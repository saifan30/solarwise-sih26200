import { 
  SiteLocation, 
  RealtimeTelemetry, 
  HistoricalDataPoint, 
  ForecastDataPoint, 
  DayForecastReport,
  DayForecastHourlyPoint,
  TomorrowHourlyPoint, 
  TomorrowSummary, 
  OpportunityWindowSummary, 
  DetectedOpportunityWindow,
  PVPerformanceStatus, 
  FlexibleLoadItem, 
  PVAnomaly, 
  PVStringStatus,
  PVDemoScenario,
  PVHealthSentinelReport,
  DayPerformanceRecord,
  HourlyExpectedVsActualPoint,
  ProbableContributor,
  AnalyticsDataSet,
  AnalyticsRange,
  AnalyticsSolarVsDemandPoint,
  AnalyticsSelfConsumptionPoint,
  AnalyticsExpectedVsActualPoint,
  Analytics7DayPoint
} from '../types';

/**
 * Solar & Facility Physics-based calculation engine
 * Generates realistic, consistent solar generation curves, commercial building load profiles,
 * net grid exchange flows, and PV health sentinel anomaly detection.
 */

// Helper to categorize solar availability based on generation
export function getSolarAvailabilityLevel(solarKw: number, capacityKwp: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  const ratio = solarKw / Math.max(1, capacityKwp);
  if (ratio > 0.55 || solarKw > 250) return 'HIGH';
  if (ratio > 0.20 || solarKw > 90) return 'MEDIUM';
  return 'LOW';
}

// Generate full multi-day forecast reports
export function generateDayForecastReport(
  site: SiteLocation,
  dayKey: 'today' | 'tomorrow' | 'dayAfter' = 'tomorrow'
): DayForecastReport {
  const capacity = site.installedCapacityKwp;
  const inverterCap = site.inverterCapacityKw;
  const hourly: DayForecastHourlyPoint[] = [];

  let dateLabel = 'Tomorrow, Sep 24';
  let weatherOutlook = 'Clear Sky · Optimal Irradiance (GHI > 950 W/m²)';
  let ambientTempRange = '17°C – 28°C';
  let confidencePercent = 97.4;
  let sunshineHours = 11.8;
  let weatherMod = 1.0;

  if (dayKey === 'today') {
    dateLabel = 'Today, Sep 23';
    weatherOutlook = 'Mostly Sunny · Stable High-Pressure System';
    ambientTempRange = '16°C – 26°C';
    confidencePercent = 98.6;
    sunshineHours = 11.2;
    weatherMod = 0.98;
  } else if (dayKey === 'dayAfter') {
    dateLabel = 'Friday, Sep 25';
    weatherOutlook = 'Scattered Cirrus Clouds · High Solar Yield';
    ambientTempRange = '18°C – 29°C';
    confidencePercent = 92.8;
    sunshineHours = 10.4;
    weatherMod = 0.91;
  }

  let totalSolarKwh = 0;
  let totalDemandKwh = 0;
  let peakSolarKw = 0;
  let peakSolarHour = 12;
  let peakDemandKw = 0;
  let peakDemandHour = 13;
  let peakSurplusKw = 0;
  let peakSurplusHour = 12;
  let totalSurplusKwh = 0;
  let totalDeficitKwh = 0;

  for (let h = 0; h < 24; h++) {
    const timeStr = `${h.toString().padStart(2, '0')}:00`;
    let solarKw = 0;
    let irradiance = 0;
    let cloudCover = 8;
    let weatherCondition = 'Clear';

    if (h >= 6 && h <= 19) {
      const sunProgress = (h - 6) / 13;
      const sunFactor = Math.sin(sunProgress * Math.PI);
      irradiance = Math.round(sunFactor * 960 * weatherMod);

      if (dayKey === 'dayAfter' && h >= 14 && h <= 17) {
        cloudCover = 24;
        weatherCondition = 'Partly Cloudy';
      } else {
        weatherCondition = irradiance > 700 ? 'Sunny' : 'Clear Sky';
      }

      const rawPower = (irradiance / 1000) * capacity * 0.92;
      solarKw = Math.min(rawPower, inverterCap);

      if (solarKw > peakSolarKw) {
        peakSolarKw = solarKw;
        peakSolarHour = h;
      }
    }

    let demandKw = 90;
    if (h >= 7 && h <= 18) {
      const workFactor = Math.sin(((h - 7) / 11) * Math.PI);
      demandKw = 100 + workFactor * 125;
      if (h >= 12 && h <= 16) demandKw += 15;
    } else if (h > 18 && h <= 22) {
      demandKw = 140 - (h - 18) * 9;
    }

    if (demandKw > peakDemandKw) {
      peakDemandKw = demandKw;
      peakDemandHour = h;
    }

    const confidenceSpread = solarKw > 0 ? solarKw * (1 - (confidencePercent / 100) * 0.7) : 0;
    const upperConfidenceKw = parseFloat((solarKw + confidenceSpread * 1.2).toFixed(1));
    const lowerConfidenceKw = parseFloat(Math.max(0, solarKw - confidenceSpread * 1.2).toFixed(1));

    const netSurplusKw = parseFloat(Math.max(0, solarKw - demandKw).toFixed(1));
    const netDeficitKw = parseFloat(Math.max(0, demandKw - solarKw).toFixed(1));

    if (netSurplusKw > peakSurplusKw) {
      peakSurplusKw = netSurplusKw;
      peakSurplusHour = h;
    }

    totalSolarKwh += solarKw;
    totalDemandKwh += demandKw;
    totalSurplusKwh += netSurplusKw;
    totalDeficitKwh += netDeficitKw;

    hourly.push({
      hour: h,
      time: timeStr,
      solarKw: parseFloat(solarKw.toFixed(1)),
      upperConfidenceKw,
      lowerConfidenceKw,
      demandKw: parseFloat(demandKw.toFixed(1)),
      netSurplusKw,
      netDeficitKw,
      irradianceWm2: irradiance,
      cloudCoverPercent: cloudCover,
      weatherCondition,
      confidenceScorePercent: Math.round(confidencePercent - Math.abs(h - 12) * 0.4),
    });
  }

  const peakStartTime = `${(peakSolarHour - 1).toString().padStart(2, '0')}:00`;
  const peakEndTime = `${(peakSolarHour + 2).toString().padStart(2, '0')}:00`;

  let dayWord = 'Tomorrow';
  if (dayKey === 'today') dayWord = 'Today';
  if (dayKey === 'dayAfter') dayWord = 'Friday';

  const summaryHeadline = `${dayWord}'s solar generation is expected to be highest between ${peakStartTime} and ${peakEndTime}.`;
  const summaryDescription = `Peak output will reach ${peakSolarKw.toFixed(1)} kW with an estimated total daily generation of ${Math.round(totalSolarKwh).toLocaleString()} kWh. A net clean solar surplus of +${peakSurplusKw.toFixed(1)} kW will be available for flexible load charging without drawing from the utility grid.`;
  const recommendedAction = `Pre-cool campus chillers from 11:30 AM – 01:30 PM and schedule EV Fleet 6-Bay fast charging during peak generation window.`;

  return {
    dayKey,
    dateLabel,
    weatherOutlook,
    ambientTempRange,
    totalSolarKwh: Math.round(totalSolarKwh),
    peakSolarKw: parseFloat(peakSolarKw.toFixed(1)),
    peakSolarTime: `${peakSolarHour.toString().padStart(2, '0')}:30`,
    confidencePercent,
    confidenceRating: confidencePercent > 95 ? 'High' : confidencePercent > 90 ? 'Good' : 'Moderate',
    sunshineHours,
    totalDemandKwh: Math.round(totalDemandKwh),
    peakDemandKw: parseFloat(peakDemandKw.toFixed(1)),
    peakDemandTime: `${peakDemandHour.toString().padStart(2, '0')}:00`,
    baseDemandKw: 90,
    totalSurplusKwh: Math.round(totalSurplusKwh),
    totalDeficitKwh: Math.round(totalDeficitKwh),
    peakSurplusKw,
    peakSurplusTime: `${peakSurplusHour.toString().padStart(2, '0')}:00`,
    summaryHeadline,
    summaryDescription,
    recommendedAction,
    hourly,
  };
}

// Generate 24-hour historical data points for the past 24 hours
export function generate24HourHistory(site: SiteLocation): HistoricalDataPoint[] {
  const points: HistoricalDataPoint[] = [];
  const capacity = site.installedCapacityKwp;

  for (let h = 0; h < 24; h++) {
    const timeStr = `${h.toString().padStart(2, '0')}:00`;
    let solarKw = 0;
    let irradiance = 0;
    if (h >= 6 && h <= 19) {
      const sunProgress = (h - 6) / 13;
      const sunAngleFactor = Math.sin(sunProgress * Math.PI);
      irradiance = Math.round(sunAngleFactor * 960);
      
      const rawPower = (irradiance / 1000) * capacity * 0.91;
      solarKw = Math.min(rawPower, site.inverterCapacityKw);
      
      const noise = (Math.sin(h * 3.7) * 0.03 + 0.98);
      solarKw = Math.max(0, solarKw * noise);
    }

    let demandKw = 90;
    if (h >= 6 && h <= 18) {
      const workHourFactor = Math.sin(((h - 6) / 12) * Math.PI);
      demandKw = 95 + workHourFactor * 135;
      if (h >= 12 && h <= 16) {
        demandKw += 15;
      }
    } else if (h > 18 && h <= 22) {
      demandKw = 140 - (h - 18) * 10;
    }

    const netGridKw = solarKw - demandKw;

    let batterySoc = 65;
    if (h >= 10 && h <= 15) {
      batterySoc = Math.min(95, 65 + (h - 10) * 6);
    } else if (h >= 17 && h <= 21) {
      batterySoc = Math.max(45, 95 - (h - 17) * 10);
    }

    points.push({
      time: timeStr,
      timestamp: `2026-09-23T${timeStr}:00`,
      hour: h,
      solarKw: parseFloat(solarKw.toFixed(1)),
      demandKw: parseFloat(demandKw.toFixed(1)),
      netGridKw: parseFloat(netGridKw.toFixed(1)),
      batterySoc: parseFloat(batterySoc.toFixed(1)),
      irradianceWm2: irradiance,
    });
  }

  return points;
}

// Generate Tomorrow's Hourly Prediction Profile
export function generateTomorrowForecast(site: SiteLocation): {
  hourly: TomorrowHourlyPoint[];
  summary: TomorrowSummary;
} {
  const hourly: TomorrowHourlyPoint[] = [];
  const capacity = site.installedCapacityKwp;
  let totalYieldKwh = 0;
  let totalDemandKwh = 0;
  let peakSolarKw = 0;
  let peakHour = 12;

  for (let h = 0; h < 24; h++) {
    const timeStr = `${h.toString().padStart(2, '0')}:00`;
    let solarKw = 0;
    let irradiance = 0;

    if (h >= 6 && h <= 19) {
      const sunProgress = (h - 6) / 13;
      const sunAngleFactor = Math.sin(sunProgress * Math.PI);
      irradiance = Math.round(sunAngleFactor * 980);
      const rawPower = (irradiance / 1000) * capacity * 0.93;
      solarKw = Math.min(rawPower, site.inverterCapacityKw);
      
      if (solarKw > peakSolarKw) {
        peakSolarKw = solarKw;
        peakHour = h;
      }
    }

    let demandKw = 88;
    if (h >= 7 && h <= 18) {
      const workHourFactor = Math.sin(((h - 7) / 11) * Math.PI);
      demandKw = 100 + workHourFactor * 130;
      if (h >= 13 && h <= 16) {
        demandKw += 12;
      }
    } else if (h > 18 && h <= 22) {
      demandKw = 135 - (h - 18) * 8;
    }

    const netSurplusKw = Math.max(0, solarKw - demandKw);
    totalYieldKwh += solarKw;
    totalDemandKwh += demandKw;

    const opportunityScore = netSurplusKw > 150 ? 98 : netSurplusKw > 80 ? 82 : netSurplusKw > 20 ? 55 : 0;
    const weatherCond = h >= 14 && h <= 16 ? 'Partly Cloudy' : h >= 6 && h <= 18 ? 'Sunny' : 'Clear';
    const solarAvailability = getSolarAvailabilityLevel(solarKw, capacity);

    hourly.push({
      hour: h,
      time: timeStr,
      predictedSolarKw: parseFloat(solarKw.toFixed(1)),
      predictedDemandKw: parseFloat(demandKw.toFixed(1)),
      netSurplusKw: parseFloat(netSurplusKw.toFixed(1)),
      irradianceWm2: irradiance,
      weatherCondition: weatherCond as any,
      opportunityScore,
      solarAvailability,
    });
  }

  const summary: TomorrowSummary = {
    dateLabel: 'Tomorrow, Sep 24',
    predictedTotalYieldKwh: Math.round(totalYieldKwh),
    peakSolarKw: parseFloat(peakSolarKw.toFixed(1)),
    peakSolarTime: `${peakHour.toString().padStart(2, '0')}:30 PM`,
    predictedDemandKwh: Math.round(totalDemandKwh),
    projectedSavingsUsd: parseFloat((totalYieldKwh * 0.165).toFixed(2)),
    weatherOutlook: 'Optimal Clear Sky (GHI > 950 W/m²)',
    sunshineHours: 11.8,
    peakOpportunityWindow: {
      start: '10:30 AM',
      end: '03:30 PM',
      maxSurplusKw: parseFloat((peakSolarKw - 225).toFixed(1)),
      recommendedAction: 'Schedule EV Fleet fast charging, Washing Machines & Water Pumps',
    }
  };

  return { hourly, summary };
}

// Automatically identify Opportunity Windows
export function detectOpportunityWindows(hourly: TomorrowHourlyPoint[]): DetectedOpportunityWindow[] {
  return [
    {
      id: 'window-morning',
      name: 'Morning Solar Ramp (Tier 2)',
      startTime: '09:00 AM',
      endTime: '11:00 AM',
      startHour: 9,
      endHour: 11,
      solarAvailability: 'MEDIUM',
      expectedSurplusKw: 110.0,
      avgSurplusKw: 85.0,
      opportunityRating: 82,
      tierLabel: 'Tier 2 (Moderate Surplus)',
      description: 'Moderate generation ramp sufficient for Water Pumps and Washing Machine cycles without battery drain.',
      recommendedLoadTypes: ['Water Pump', 'Washing Machine', 'Water Heater'],
    },
    {
      id: 'window-prime',
      name: 'Prime Solar Peak (Tier 1)',
      startTime: '11:00 AM',
      endTime: '02:30 PM',
      startHour: 11,
      endHour: 14,
      solarAvailability: 'HIGH',
      expectedSurplusKw: 215.0,
      avgSurplusKw: 185.0,
      opportunityRating: 98,
      tierLabel: 'Tier 1 (Prime Optimal)',
      description: 'Maximum solar output exceeding facility demand by +185 to +215 kW. Ideal for high-power EV fleet and BESS charging.',
      recommendedLoadTypes: ['EV Charging', 'Battery Charging', 'HVAC Pre-cooling', 'Washing Machine', 'Water Pump'],
    },
    {
      id: 'window-afternoon',
      name: 'Afternoon Yield Buffer (Tier 2)',
      startTime: '02:30 PM',
      endTime: '05:00 PM',
      startHour: 14,
      endHour: 17,
      solarAvailability: 'MEDIUM',
      expectedSurplusKw: 120.0,
      avgSurplusKw: 75.0,
      opportunityRating: 78,
      tierLabel: 'Tier 2 (Sustained Yield)',
      description: 'Secondary window ideal for thermal hot water top-off and medium duration pump runs before peak grid tariff begins.',
      recommendedLoadTypes: ['Water Heater', 'Water Pump', 'Industrial Machinery'],
    }
  ];
}

export function getSuitableLoadsForHour(
  hourPoint: TomorrowHourlyPoint, 
  loads: FlexibleLoadItem[]
): {
  suitable: FlexibleLoadItem[];
  tight: FlexibleLoadItem[];
  unsuitable: FlexibleLoadItem[];
} {
  const surplus = hourPoint.netSurplusKw;
  const solarGen = hourPoint.predictedSolarKw;

  const suitable: FlexibleLoadItem[] = [];
  const tight: FlexibleLoadItem[] = [];
  const unsuitable: FlexibleLoadItem[] = [];

  loads.forEach(load => {
    if (surplus >= load.powerRatingKw) {
      suitable.push(load);
    } else if (solarGen >= load.powerRatingKw && surplus >= load.powerRatingKw * 0.4) {
      tight.push(load);
    } else {
      unsuitable.push(load);
    }
  });

  return { suitable, tight, unsuitable };
}

// Compute Real-time Telemetry state based on current time & active site
export function computeRealtimeTelemetry(
  site: SiteLocation, 
  currentHour: number = 13, 
  currentMinute: number = 15
): RealtimeTelemetry {
  const timeProgress = (currentHour + currentMinute / 60 - 6) / 13;
  const sunAngle = Math.max(0, Math.sin(timeProgress * Math.PI));
  
  const irradiance = Math.round(sunAngle * 910);
  const expectedSolarKw = parseFloat(((irradiance / 1000) * site.installedCapacityKwp * 0.90).toFixed(1));
  
  const currentSolarKw = parseFloat((expectedSolarKw * 0.932).toFixed(1));
  const facilityDemandKw = 218.4;
  const netGridExportKw = parseFloat((currentSolarKw - facilityDemandKw).toFixed(1));
  const isExporting = netGridExportKw >= 0;

  return {
    timestamp: '01:15 PM',
    currentSolarKw,
    expectedSolarKw,
    facilityDemandKw,
    netGridExportKw,
    isExporting,
    batterySocPercent: 82.4,
    batteryPowerKw: 45.0,
    ambientTempC: 25.4,
    solarIrradianceWm2: irradiance,
    selfConsumptionRatePercent: 56.8,
    dailyYieldKwh: 1942.8,
    dailyDemandKwh: 1485.0,
    dailyGridExportKwh: 860.4,
    dailyGridImportKwh: 402.6,
  };
}

// Compute PV Health Status Summary
export function computePVHealthStatus(anomalies: PVAnomaly[], stringStatuses: PVStringStatus[]): PVPerformanceStatus {
  const activeAnomalies = anomalies.filter(a => a.status !== 'resolved');
  const nominalStrings = stringStatuses.filter(s => s.health === 'good').length;
  const totalStrings = stringStatuses.length || 16;
  const healthScore = Math.round((nominalStrings / totalStrings) * 100 * 0.95);
  const totalLossKwh = activeAnomalies.reduce((sum, a) => sum + a.lossKwhToday, 0);
  const totalLossUsd = activeAnomalies.reduce((sum, a) => sum + a.financialLossUsd, 0);

  return {
    healthScorePercent: healthScore,
    status: activeAnomalies.length === 0 ? 'Optimal' : activeAnomalies.some(a => a.severity === 'critical') ? 'Warning' : 'Degraded',
    activeAnomaliesCount: activeAnomalies.length,
    nominalStringsCount: nominalStrings,
    totalStringsCount: totalStrings,
    currentVsExpectedPercent: 93.2,
    todayLossKwh: parseFloat(totalLossKwh.toFixed(1)),
    todayLossUsd: parseFloat(totalLossUsd.toFixed(2)),
    soilingIndex: '0.94 (Light Dust on East Canopy)',
  };
}

// Next Opportunity Window calculation from flexible loads
export function computeNextOpportunityWindow(loads: FlexibleLoadItem[]): OpportunityWindowSummary {
  const activeOrScheduled = loads.find(l => l.status === 'scheduled' || l.status === 'running') || loads[0];

  return {
    windowStart: activeOrScheduled?.optimalWindowStart || '11:00 AM',
    windowEnd: activeOrScheduled?.optimalWindowEnd || '02:30 PM',
    durationHours: activeOrScheduled?.requiredDurationHours || 3.5,
    maxSurplusKw: 195.0,
    avgSurplusKw: 172.5,
    targetLoadName: activeOrScheduled?.name || 'EV Fleet Fast Charging Station',
    targetCategory: activeOrScheduled?.category || 'EV Charging',
    estimatedSavingsUsd: activeOrScheduled?.estimatedCostSavings || 68.50,
    solarMatchPercent: activeOrScheduled?.solarCoveragePercent || 96.2,
    status: activeOrScheduled?.status === 'running' ? 'active' : 'upcoming',
  };
}

// ==========================================
// PV HEALTH SENTINEL SCENARIO REPORT GENERATOR
// ==========================================
export function generatePVHealthSentinelReport(
  site: SiteLocation,
  scenario: PVDemoScenario = 'persistent-underperformance'
): PVHealthSentinelReport {
  const capacity = site.installedCapacityKwp;

  if (scenario === 'nominal') {
    const history7d: DayPerformanceRecord[] = [
      { date: 'Sep 17', dayLabel: 'Wed', expectedKwh: 2420, actualKwh: 2450, deviationKwh: 30, deviationPercent: 1.2, irradianceWm2: 940, weatherCondition: 'Clear Sky', status: 'Nominal' },
      { date: 'Sep 18', dayLabel: 'Thu', expectedKwh: 2480, actualKwh: 2460, deviationKwh: -20, deviationPercent: -0.8, irradianceWm2: 955, weatherCondition: 'Sunny', status: 'Nominal' },
      { date: 'Sep 19', dayLabel: 'Fri', expectedKwh: 2510, actualKwh: 2490, deviationKwh: -20, deviationPercent: -0.8, irradianceWm2: 960, weatherCondition: 'Clear Sky', status: 'Nominal' },
      { date: 'Sep 20', dayLabel: 'Sat', expectedKwh: 2460, actualKwh: 2440, deviationKwh: -20, deviationPercent: -0.8, irradianceWm2: 945, weatherCondition: 'Sunny', status: 'Nominal' },
      { date: 'Sep 21', dayLabel: 'Sun', expectedKwh: 2520, actualKwh: 2490, deviationKwh: -30, deviationPercent: -1.2, irradianceWm2: 965, weatherCondition: 'Clear Sky', status: 'Nominal' },
      { date: 'Sep 22', dayLabel: 'Mon', expectedKwh: 2500, actualKwh: 2480, deviationKwh: -20, deviationPercent: -0.8, irradianceWm2: 950, weatherCondition: 'Sunny', status: 'Nominal' },
      { date: 'Sep 23 (Today)', dayLabel: 'Tue', expectedKwh: 2540, actualKwh: 2510, deviationKwh: -30, deviationPercent: -1.2, irradianceWm2: 960, weatherCondition: 'Optimal Clear Sky', status: 'Nominal' },
    ];

    const hourly24h: HourlyExpectedVsActualPoint[] = [];
    for (let h = 0; h < 24; h++) {
      const timeStr = `${h.toString().padStart(2, '0')}:00`;
      let expectedKw = 0;
      let actualKw = 0;
      let irr = 0;
      if (h >= 6 && h <= 19) {
        const p = (h - 6) / 13;
        const sinF = Math.sin(p * Math.PI);
        irr = Math.round(sinF * 960);
        expectedKw = parseFloat(((irr / 1000) * capacity * 0.92).toFixed(1));
        actualKw = parseFloat((expectedKw * 0.988).toFixed(1));
      }
      const devKw = parseFloat((actualKw - expectedKw).toFixed(1));
      const devPct = expectedKw > 0 ? parseFloat(((devKw / expectedKw) * 100).toFixed(1)) : 0;
      hourly24h.push({ hour: h, time: timeStr, expectedKw, actualKw, deviationKw: devKw, deviationPercent: devPct, irradianceWm2: irr, ambientTempC: 24.5 });
    }

    const contributors: ProbableContributor[] = [
      { id: 'c-irr', name: 'Low solar irradiance', probability: 'Negligible', confidenceScore: 2, description: 'Irradiance measured at nominal clear-sky baseline (>950 W/m²).', evidence: 'Pyranometer reading matches clear-sky model within ±1.5%.' },
      { id: 'c-weather', name: 'Cloud/weather impact', probability: 'Negligible', confidenceScore: 3, description: 'No cloud attenuation detected across telemetry sensors.', evidence: 'Satellite optical depth shows GHI stability index 0.98.' },
      { id: 'c-temp', name: 'Elevated temperature', probability: 'Low', confidenceScore: 12, description: 'Module cell temperature operating within standard 25°C – 32°C envelope.', evidence: 'Thermography sensors indicate uniform dissipation.' },
      { id: 'c-soiling', name: 'Possible soiling', probability: 'Low', confidenceScore: 8, description: 'Soiling index nominal (0.98). No particulate buildup identified.', evidence: 'Reference cell comparison indicates clean optical glass.' },
      { id: 'c-system', name: 'Possible system anomaly', probability: 'Negligible', confidenceScore: 1, description: 'All 16 string inverters reporting balanced DC voltages & nominal current.', evidence: 'String variance < 1.2% across arrays.' }
    ];

    return {
      scenario: 'nominal',
      scenarioTitle: 'Scenario 1: Normal Performance',
      siteName: site.name,
      todayExpectedKwh: 2540,
      todayActualKwh: 2510,
      todayDeviationKwh: -30,
      todayDeviationPercent: -1.2,
      healthScorePercent: 98.8,
      plantHealthStatus: 'Optimal',
      healthBadgeSeverity: 'nominal',
      isPersistentUnderperformance: false,
      persistenceHeadline: 'Nominal Performance — Array operating within expected parameters.',
      persistenceSummary: 'Multi-period deviation is -0.9% across the last 7 days, well within the standard ±3.0% clear-sky tolerance envelope. No underperformance detected.',
      consecutiveDeficitDays: 0,
      meanMultiDayDeviationPercent: -0.9,
      contributors,
      alert: {
        severity: 'nominal',
        detectionDateTime: 'Sep 23, 01:15 PM',
        expectedSummary: '2,540 kWh Expected Daily Yield',
        actualSummary: '2,510 kWh Actual Daily Generation (98.8%)',
        deviationLabel: '-1.2% Deviation (Normal Variance)',
        probableContributorSummary: 'None (System Operating Nominally)',
        recommendedInvestigation: 'Routine periodic monitoring. No physical maintenance required.',
        headline: 'PV Generation In Sync With Clear-Sky Model',
        body: 'Array performance metrics match theoretical physics irradiance curves. All string combiner boxes, inverters, and tracking mechanisms are functioning with nominal efficiency.'
      },
      history7d,
      hourly24h
    };
  }

  if (scenario === 'weather-reduced') {
    const history7d: DayPerformanceRecord[] = [
      { date: 'Sep 17', dayLabel: 'Wed', expectedKwh: 2450, actualKwh: 2430, deviationKwh: -20, deviationPercent: -0.8, irradianceWm2: 950, weatherCondition: 'Sunny', status: 'Nominal' },
      { date: 'Sep 18', dayLabel: 'Thu', expectedKwh: 2480, actualKwh: 2470, deviationKwh: -10, deviationPercent: -0.4, irradianceWm2: 955, weatherCondition: 'Clear Sky', status: 'Nominal' },
      { date: 'Sep 19', dayLabel: 'Fri', expectedKwh: 2510, actualKwh: 2490, deviationKwh: -20, deviationPercent: -0.8, irradianceWm2: 960, weatherCondition: 'Sunny', status: 'Nominal' },
      { date: 'Sep 20', dayLabel: 'Sat', expectedKwh: 2460, actualKwh: 2440, deviationKwh: -20, deviationPercent: -0.8, irradianceWm2: 945, weatherCondition: 'Sunny', status: 'Nominal' },
      { date: 'Sep 21', dayLabel: 'Sun', expectedKwh: 2520, actualKwh: 2480, deviationKwh: -40, deviationPercent: -1.6, irradianceWm2: 955, weatherCondition: 'Clear Sky', status: 'Nominal' },
      { date: 'Sep 22', dayLabel: 'Mon', expectedKwh: 2480, actualKwh: 1490, deviationKwh: -990, deviationPercent: -39.9, irradianceWm2: 410, weatherCondition: 'Heavy Thunderstorms & Overcast', status: 'Weather Reduced' },
      { date: 'Sep 23 (Today)', dayLabel: 'Tue', expectedKwh: 2540, actualKwh: 2460, deviationKwh: -80, deviationPercent: -3.1, irradianceWm2: 940, weatherCondition: 'Recovering / Clear Sky', status: 'Nominal' },
    ];

    const hourly24h: HourlyExpectedVsActualPoint[] = [];
    for (let h = 0; h < 24; h++) {
      const timeStr = `${h.toString().padStart(2, '0')}:00`;
      let expectedKw = 0;
      let actualKw = 0;
      let irr = 0;
      if (h >= 6 && h <= 19) {
        const p = (h - 6) / 13;
        const sinF = Math.sin(p * Math.PI);
        irr = Math.round(sinF * 940);
        expectedKw = parseFloat(((irr / 1000) * capacity * 0.92).toFixed(1));
        actualKw = parseFloat((expectedKw * 0.968).toFixed(1));
      }
      const devKw = parseFloat((actualKw - expectedKw).toFixed(1));
      const devPct = expectedKw > 0 ? parseFloat(((devKw / expectedKw) * 100).toFixed(1)) : 0;
      hourly24h.push({ hour: h, time: timeStr, expectedKw, actualKw, deviationKw: devKw, deviationPercent: devPct, irradianceWm2: irr, ambientTempC: 22.0 });
    }

    const contributors: ProbableContributor[] = [
      { id: 'c-irr', name: 'Low solar irradiance', probability: 'High', confidenceScore: 94, description: 'Irradiance dropped by 57% on Sep 22 due to heavy storm system.', evidence: 'Station pyranometer recorded 410 W/m² peak vs expected 950 W/m².' },
      { id: 'c-weather', name: 'Cloud/weather impact', probability: 'High', confidenceScore: 92, description: 'Localized cloud cover and atmospheric rain attenuation on Sep 22.', evidence: 'Regional meteorological station reported 88% cloud fraction.' },
      { id: 'c-temp', name: 'Elevated temperature', probability: 'Negligible', confidenceScore: 5, description: 'Rain cooled module surface temperatures down to 18°C.', evidence: 'Inverter thermal telemetry nominal.' },
      { id: 'c-soiling', name: 'Possible soiling', probability: 'Low', confidenceScore: 10, description: 'Rainfall naturally washed module glass; optical transparency improved.', evidence: 'Post-rain optical baseline measured 0.99.' },
      { id: 'c-system', name: 'Possible system anomaly', probability: 'Low', confidenceScore: 8, description: 'String currents recovered synchronously with sunlight return.', evidence: 'No tripped breakers or DC grounding faults.' }
    ];

    return {
      scenario: 'weather-reduced',
      scenarioTitle: 'Scenario 2: Weather-Related Reduction',
      siteName: site.name,
      todayExpectedKwh: 2540,
      todayActualKwh: 2460,
      todayDeviationKwh: -80,
      todayDeviationPercent: -3.1,
      healthScorePercent: 96.8,
      plantHealthStatus: 'Advisory / Weather Impacted',
      healthBadgeSeverity: 'advisory',
      isPersistentUnderperformance: false,
      persistenceHeadline: 'Temporary generation reduction — continue monitoring.',
      persistenceSummary: 'Generation was significantly reduced on Sep 22 (-39.9%), but on-site sensor telemetry confirms this correlated directly with heavy localized cloud cover and low solar irradiance (410 W/m²). Output has rebounded to nominal today (+96.9%). No persistent fault exists.',
      consecutiveDeficitDays: 0,
      meanMultiDayDeviationPercent: -6.8,
      contributors,
      alert: {
        severity: 'advisory',
        detectionDateTime: 'Sep 22, 02:30 PM (Resolved)',
        expectedSummary: '2,480 kWh Expected (Sep 22)',
        actualSummary: '1,490 kWh Actual (Sep 22 Weather Event)',
        deviationLabel: '-39.9% Single-Day Deviation (Transient)',
        probableContributorSummary: 'Low Solar Irradiance & Cloud Attenuation',
        recommendedInvestigation: 'Continue automated passive monitoring. No physical inspection required as performance rebounded to nominal levels today.',
        headline: 'Transient Weather Reduction — No System Anomaly Found',
        body: 'SolarWise evaluated multi-period persistence rules and determined the output dip was transient and fully accounted for by meteorological irradiance data. Premature technician dispatch was automatically prevented.'
      },
      history7d,
      hourly24h
    };
  }

  // DEFAULT / SCENARIO 3: Persistent Underperformance (Multi-Period Anomaly)
  const history7d: DayPerformanceRecord[] = [
    { date: 'Sep 17 (Day 1)', dayLabel: 'Wed', expectedKwh: 2450, actualKwh: 2327, deviationKwh: -123, deviationPercent: -5.0, irradianceWm2: 950, weatherCondition: 'Clear Sky', status: 'Nominal' },
    { date: 'Sep 18 (Day 2)', dayLabel: 'Thu', expectedKwh: 2490, actualKwh: 2291, deviationKwh: -199, deviationPercent: -8.0, irradianceWm2: 960, weatherCondition: 'Sunny', status: 'Underperforming' },
    { date: 'Sep 19 (Day 3)', dayLabel: 'Fri', expectedKwh: 2520, actualKwh: 2041, deviationKwh: -479, deviationPercent: -19.0, irradianceWm2: 965, weatherCondition: 'Clear Sky', status: 'Persistent Underperformance' },
    { date: 'Sep 20 (Day 4)', dayLabel: 'Sat', expectedKwh: 2480, actualKwh: 1810, deviationKwh: -670, deviationPercent: -27.0, irradianceWm2: 955, weatherCondition: 'Sunny', status: 'Persistent Underperformance' },
    { date: 'Sep 21 (Day 5)', dayLabel: 'Sun', expectedKwh: 2510, actualKwh: 1908, deviationKwh: -602, deviationPercent: -24.0, irradianceWm2: 960, weatherCondition: 'Clear Sky', status: 'Persistent Underperformance' },
    { date: 'Sep 22 (Day 6)', dayLabel: 'Mon', expectedKwh: 2530, actualKwh: 1948, deviationKwh: -582, deviationPercent: -23.0, irradianceWm2: 960, weatherCondition: 'Sunny', status: 'Persistent Underperformance' },
    { date: 'Sep 23 (Today)', dayLabel: 'Tue', expectedKwh: 2540, actualKwh: 1942, deviationKwh: -598, deviationPercent: -23.5, irradianceWm2: 965, weatherCondition: 'Optimal Clear Sky (GHI > 950 W/m²)', status: 'Persistent Underperformance' },
  ];

  const hourly24h: HourlyExpectedVsActualPoint[] = [];
  for (let h = 0; h < 24; h++) {
    const timeStr = `${h.toString().padStart(2, '0')}:00`;
    let expectedKw = 0;
    let actualKw = 0;
    let irr = 0;
    if (h >= 6 && h <= 19) {
      const p = (h - 6) / 13;
      const sinF = Math.sin(p * Math.PI);
      irr = Math.round(sinF * 965);
      expectedKw = parseFloat(((irr / 1000) * capacity * 0.92).toFixed(1));
      // Persistent underperformance curve (clipped String W-09 open circuit + soiling on Canopy East)
      actualKw = parseFloat((expectedKw * 0.765).toFixed(1));
    }
    const devKw = parseFloat((actualKw - expectedKw).toFixed(1));
    const devPct = expectedKw > 0 ? parseFloat(((devKw / expectedKw) * 100).toFixed(1)) : 0;
    hourly24h.push({ hour: h, time: timeStr, expectedKw, actualKw, deviationKw: devKw, deviationPercent: devPct, irradianceWm2: irr, ambientTempC: 28.2 });
  }

  const contributors: ProbableContributor[] = [
    { id: 'c-system', name: 'Possible system anomaly', probability: 'High', confidenceScore: 88, description: 'String open circuit or blown fuse detected on Array West String W-09 (Current dropped to 0.1A while DC voltage is 620V).', evidence: 'String W-09 telemetry shows 0.06 kW output vs 6.10 kW expected baseline.' },
    { id: 'c-soiling', name: 'Possible soiling', probability: 'High', confidenceScore: 76, description: 'Canopy Array East Bay 4 shows sustained 22% degradation without inverter fault codes, consistent with particulate dust accumulation.', evidence: 'Soiling index dropped to 0.78 on eastern canopy section.' },
    { id: 'c-temp', name: 'Elevated temperature', probability: 'Moderate', confidenceScore: 42, description: 'Inverter #3 internal enclosure temperature reached 58°C, applying minor thermal derating during peak noon hours.', evidence: 'Telemetry logs show inverter derating mode active for 1.8 hours.' },
    { id: 'c-weather', name: 'Cloud/weather impact', probability: 'Low', confidenceScore: 6, description: 'Weather conditions do NOT explain the deviation. Clear sky index remained >0.95 across all 5 deficit days.', evidence: 'GHI sensor registered continuous un-attenuated irradiance >950 W/m².' },
    { id: 'c-irr', name: 'Low solar irradiance', probability: 'Negligible', confidenceScore: 4, description: 'Solar irradiance is at peak seasonal maximum (>960 W/m²).', evidence: 'Solar zenith and pyranometer match theoretical clear-sky model.' }
  ];

  return {
    scenario: 'persistent-underperformance',
    scenarioTitle: 'Scenario 3: Persistent Underperformance',
    siteName: site.name,
    todayExpectedKwh: 2540,
    todayActualKwh: 1942,
    todayDeviationKwh: -598,
    todayDeviationPercent: -23.5,
    healthScorePercent: 76.5,
    plantHealthStatus: 'Degraded / Persistent Anomaly',
    healthBadgeSeverity: 'warning',
    isPersistentUnderperformance: true,
    persistenceHeadline: 'Persistent PV underperformance detected.',
    persistenceSummary: 'PV generation has remained significantly below expected output across 5 consecutive observation days (averaging -23.3% deficit). On-site weather sensors confirm persistent clear-sky irradiance (>950 W/m²), ruling out atmospheric conditions as the primary root cause.',
    consecutiveDeficitDays: 5,
    meanMultiDayDeviationPercent: -23.3,
    contributors,
    alert: {
      severity: 'warning',
      detectionDateTime: 'Sep 21, 11:20 AM (5 Consecutive Deficit Days)',
      expectedSummary: '2,540 kWh Expected Today (485.5 kWp Array)',
      actualSummary: '1,942 kWh Actual (-598 kWh Deficit / -$89.70/day)',
      deviationLabel: '-23.5% Persistent Deviation Across 5 Days',
      probableContributorSummary: 'Possible String Open Circuit (String W-09) & Canopy Module Soiling',
      recommendedInvestigation: 'PV generation has remained below expected output across multiple periods. Weather conditions do not fully explain the deviation. Further PV system inspection is recommended: inspect DC combiner fuse F-09 on String W-09 and check Canopy Array East for module soiling.',
      headline: 'Multi-Period Underperformance Exceeds Statistical Tolerance',
      body: 'Statistical persistence analysis confirms array underperformance has persisted continuously across Days 3, 4, 5, 6, and 7 (-19% to -27% daily loss). Ambient irradiance was verified at >950 W/m², indicating an active physical or electrical hardware constraint rather than weather fluctuation.'
    },
    history7d,
    hourly24h
  };
}

// ==========================================
// ANALYTICS DATASET GENERATOR
// ==========================================
export function generateAnalyticsDataSet(
  site: SiteLocation,
  range: AnalyticsRange = 'today'
): AnalyticsDataSet {
  const capacity = site.installedCapacityKwp;

  if (range === 'today') {
    // 24 Hour granularity for Today
    const solarVsDemand: AnalyticsSolarVsDemandPoint[] = [];
    const selfConsumptionVsGrid: AnalyticsSelfConsumptionPoint[] = [];
    const expectedVsActual: AnalyticsExpectedVsActualPoint[] = [];

    let totalSolar = 0;
    let totalDemand = 0;
    let totalSelfConsumed = 0;
    let totalExport = 0;
    let totalImport = 0;
    let totalExpected = 0;

    for (let h = 0; h < 24; h++) {
      const label = `${h.toString().padStart(2, '0')}:00`;
      let solarKwh = 0;
      let expectedKwh = 0;

      if (h >= 6 && h <= 19) {
        const p = (h - 6) / 13;
        const sinF = Math.sin(p * Math.PI);
        const irr = Math.round(sinF * 960);
        expectedKwh = parseFloat(((irr / 1000) * capacity * 0.92).toFixed(1));
        solarKwh = parseFloat((expectedKwh * 0.965).toFixed(1));
      }

      let demandKwh = 92;
      if (h >= 7 && h <= 18) {
        demandKwh = 100 + Math.sin(((h - 7) / 11) * Math.PI) * 125;
        if (h >= 12 && h <= 15) demandKwh += 15;
      } else if (h > 18 && h <= 22) {
        demandKwh = 140 - (h - 18) * 9;
      }
      demandKwh = parseFloat(demandKwh.toFixed(1));

      const selfConsumed = Math.min(solarKwh, demandKwh);
      const gridExp = Math.max(0, solarKwh - demandKwh);
      const gridImp = Math.max(0, demandKwh - solarKwh);

      totalSolar += solarKwh;
      totalExpected += expectedKwh;
      totalDemand += demandKwh;
      totalSelfConsumed += selfConsumed;
      totalExport += gridExp;
      totalImport += gridImp;

      solarVsDemand.push({
        label,
        solarKwh,
        demandKwh,
        netSurplusKwh: gridExp,
        netDeficitKwh: gridImp,
      });

      selfConsumptionVsGrid.push({
        label,
        solarSelfConsumedKwh: parseFloat(selfConsumed.toFixed(1)),
        gridImportKwh: parseFloat(gridImp.toFixed(1)),
        gridExportKwh: parseFloat(gridExp.toFixed(1)),
      });

      const devPct = expectedKwh > 0 ? parseFloat((((solarKwh - expectedKwh) / expectedKwh) * 100).toFixed(1)) : 0;
      expectedVsActual.push({
        label,
        expectedKwh,
        actualKwh: solarKwh,
        deviationPercent: devPct,
      });
    }

    const sevenDayPerformance: Analytics7DayPoint[] = [
      { date: 'Sep 17', dayLabel: 'Wed', solarYieldKwh: 2450, performanceRatioPercent: 84.2, solarSelfConsumptionPercent: 78.5, weatherCondition: 'Clear Sky' },
      { date: 'Sep 18', dayLabel: 'Thu', solarYieldKwh: 2460, performanceRatioPercent: 84.8, solarSelfConsumptionPercent: 79.1, weatherCondition: 'Sunny' },
      { date: 'Sep 19', dayLabel: 'Fri', solarYieldKwh: 2490, performanceRatioPercent: 85.1, solarSelfConsumptionPercent: 80.2, weatherCondition: 'Clear Sky' },
      { date: 'Sep 20', dayLabel: 'Sat', solarYieldKwh: 2440, performanceRatioPercent: 83.9, solarSelfConsumptionPercent: 77.4, weatherCondition: 'Sunny' },
      { date: 'Sep 21', dayLabel: 'Sun', solarYieldKwh: 2490, performanceRatioPercent: 84.9, solarSelfConsumptionPercent: 79.8, weatherCondition: 'Clear Sky' },
      { date: 'Sep 22', dayLabel: 'Mon', solarYieldKwh: 2480, performanceRatioPercent: 84.4, solarSelfConsumptionPercent: 78.9, weatherCondition: 'Sunny' },
      { date: 'Sep 23 (Today)', dayLabel: 'Tue', solarYieldKwh: Math.round(totalSolar), performanceRatioPercent: 84.6, solarSelfConsumptionPercent: parseFloat(((totalSelfConsumed / totalSolar) * 100).toFixed(1)), weatherCondition: 'Optimal Clear Sky' },
    ];

    const utilizationPct = parseFloat(((totalSelfConsumed / totalSolar) * 100).toFixed(1));

    return {
      range: 'today',
      rangeLabel: 'Today (Sep 23, 2026)',
      siteName: site.name,
      totalSolarGenerationKwh: Math.round(totalSolar),
      solarSelfConsumptionKwh: Math.round(totalSelfConsumed),
      solarSelfConsumptionPercent: utilizationPct,
      gridImportKwh: Math.round(totalImport),
      gridExportKwh: Math.round(totalExport),
      solarUtilizationPercent: utilizationPct,
      pvPerformancePercent: 84.6,
      forecastAccuracyPercent: 97.8,
      estimatedCo2AvoidedTons: parseFloat(((totalSolar * 0.708) / 1000).toFixed(2)),
      totalFinancialSavingsUsd: parseFloat((totalSelfConsumed * 0.24 + totalExport * 0.08).toFixed(2)),
      totalDemandKwh: Math.round(totalDemand),
      solarVsDemand,
      selfConsumptionVsGrid,
      expectedVsActual,
      sevenDayPerformance,
    };
  }

  if (range === '7days') {
    // 7 Day Daily Breakdown
    const days = [
      { date: 'Sep 17', label: 'Wed 17', expected: 2480, actual: 2450, demand: 1890, selfCons: 1480, exp: 970, imp: 410, pr: 84.2, acc: 97.4, weather: 'Clear Sky' },
      { date: 'Sep 18', label: 'Thu 18', expected: 2510, actual: 2460, demand: 1940, selfCons: 1510, exp: 950, imp: 430, pr: 84.8, acc: 98.0, weather: 'Sunny' },
      { date: 'Sep 19', label: 'Fri 19', expected: 2520, actual: 2490, demand: 1980, selfCons: 1540, exp: 950, imp: 440, pr: 85.1, acc: 98.8, weather: 'Clear Sky' },
      { date: 'Sep 20', label: 'Sat 20', expected: 2490, actual: 2440, demand: 1620, selfCons: 1320, exp: 1120, imp: 300, pr: 83.9, acc: 98.0, weather: 'Sunny' },
      { date: 'Sep 21', label: 'Sun 21', expected: 2520, actual: 2490, demand: 1580, selfCons: 1310, exp: 1180, imp: 270, pr: 84.9, acc: 98.8, weather: 'Clear Sky' },
      { date: 'Sep 22', label: 'Mon 22', expected: 2500, actual: 2480, demand: 1920, selfCons: 1520, exp: 960, imp: 400, pr: 84.4, acc: 99.2, weather: 'Sunny' },
      { date: 'Sep 23', label: 'Tue 23 (Today)', expected: 2540, actual: 2510, demand: 1950, selfCons: 1540, exp: 970, imp: 410, pr: 84.6, acc: 98.8, weather: 'Optimal Clear Sky' },
    ];

    const solarVsDemand: AnalyticsSolarVsDemandPoint[] = days.map(d => ({
      label: d.label,
      solarKwh: d.actual,
      demandKwh: d.demand,
      netSurplusKwh: d.exp,
      netDeficitKwh: d.imp,
    }));

    const selfConsumptionVsGrid: AnalyticsSelfConsumptionPoint[] = days.map(d => ({
      label: d.label,
      solarSelfConsumedKwh: d.selfCons,
      gridImportKwh: d.imp,
      gridExportKwh: d.exp,
    }));

    const expectedVsActual: AnalyticsExpectedVsActualPoint[] = days.map(d => ({
      label: d.label,
      expectedKwh: d.expected,
      actualKwh: d.actual,
      deviationPercent: parseFloat((((d.actual - d.expected) / d.expected) * 100).toFixed(1)),
    }));

    const sevenDayPerformance: Analytics7DayPoint[] = days.map(d => ({
      date: d.date,
      dayLabel: d.label.split(' ')[0],
      solarYieldKwh: d.actual,
      performanceRatioPercent: d.pr,
      solarSelfConsumptionPercent: parseFloat(((d.selfCons / d.actual) * 100).toFixed(1)),
      weatherCondition: d.weather,
    }));

    const totalSolar = days.reduce((sum, d) => sum + d.actual, 0);
    const totalSelfConsumed = days.reduce((sum, d) => sum + d.selfCons, 0);
    const totalDemand = days.reduce((sum, d) => sum + d.demand, 0);
    const totalExport = days.reduce((sum, d) => sum + d.exp, 0);
    const totalImport = days.reduce((sum, d) => sum + d.imp, 0);
    const utilizationPct = parseFloat(((totalSelfConsumed / totalSolar) * 100).toFixed(1));

    return {
      range: '7days',
      rangeLabel: 'Last 7 Days (Sep 17 – Sep 23, 2026)',
      siteName: site.name,
      totalSolarGenerationKwh: totalSolar,
      solarSelfConsumptionKwh: totalSelfConsumed,
      solarSelfConsumptionPercent: utilizationPct,
      gridImportKwh: totalImport,
      gridExportKwh: totalExport,
      solarUtilizationPercent: utilizationPct,
      pvPerformancePercent: 84.7,
      forecastAccuracyPercent: 98.4,
      estimatedCo2AvoidedTons: parseFloat(((totalSolar * 0.708) / 1000).toFixed(2)),
      totalFinancialSavingsUsd: parseFloat((totalSelfConsumed * 0.24 + totalExport * 0.08).toFixed(2)),
      totalDemandKwh: totalDemand,
      solarVsDemand,
      selfConsumptionVsGrid,
      expectedVsActual,
      sevenDayPerformance,
    };
  }

  // 30 DAYS (Monthly Range)
  const weeks = [
    { label: 'Week 1 (Aug 25 - 31)', expected: 17200, actual: 16950, demand: 13400, selfCons: 10600, exp: 6350, imp: 2800, pr: 84.1 },
    { label: 'Week 2 (Sep 01 - 07)', expected: 17400, actual: 17100, demand: 13600, selfCons: 10800, exp: 6300, imp: 2800, pr: 84.3 },
    { label: 'Week 3 (Sep 08 - 14)', expected: 17500, actual: 17300, demand: 13850, selfCons: 10950, exp: 6350, imp: 2900, pr: 84.6 },
    { label: 'Week 4 (Sep 15 - 21)', expected: 17350, actual: 17220, demand: 13750, selfCons: 10900, exp: 6320, imp: 2850, pr: 84.4 },
    { label: 'Current Days (Sep 22-23)', expected: 5040, actual: 4990, demand: 3870, selfCons: 3060, exp: 1930, imp: 810, pr: 84.5 },
  ];

  const solarVsDemand: AnalyticsSolarVsDemandPoint[] = weeks.map(w => ({
    label: w.label,
    solarKwh: w.actual,
    demandKwh: w.demand,
    netSurplusKwh: w.exp,
    netDeficitKwh: w.imp,
  }));

  const selfConsumptionVsGrid: AnalyticsSelfConsumptionPoint[] = weeks.map(w => ({
    label: w.label,
    solarSelfConsumedKwh: w.selfCons,
    gridImportKwh: w.imp,
    gridExportKwh: w.exp,
  }));

  const expectedVsActual: AnalyticsExpectedVsActualPoint[] = weeks.map(w => ({
    label: w.label,
    expectedKwh: w.expected,
    actualKwh: w.actual,
    deviationPercent: parseFloat((((w.actual - w.expected) / w.expected) * 100).toFixed(1)),
  }));

  const sevenDayPerformance: Analytics7DayPoint[] = [
    { date: 'Sep 17', dayLabel: 'Wed', solarYieldKwh: 2450, performanceRatioPercent: 84.2, solarSelfConsumptionPercent: 78.5, weatherCondition: 'Clear Sky' },
    { date: 'Sep 18', dayLabel: 'Thu', solarYieldKwh: 2460, performanceRatioPercent: 84.8, solarSelfConsumptionPercent: 79.1, weatherCondition: 'Sunny' },
    { date: 'Sep 19', dayLabel: 'Fri', solarYieldKwh: 2490, performanceRatioPercent: 85.1, solarSelfConsumptionPercent: 80.2, weatherCondition: 'Clear Sky' },
    { date: 'Sep 20', dayLabel: 'Sat', solarYieldKwh: 2440, performanceRatioPercent: 83.9, solarSelfConsumptionPercent: 77.4, weatherCondition: 'Sunny' },
    { date: 'Sep 21', dayLabel: 'Sun', solarYieldKwh: 2490, performanceRatioPercent: 84.9, solarSelfConsumptionPercent: 79.8, weatherCondition: 'Clear Sky' },
    { date: 'Sep 22', dayLabel: 'Mon', solarYieldKwh: 2480, performanceRatioPercent: 84.4, solarSelfConsumptionPercent: 78.9, weatherCondition: 'Sunny' },
    { date: 'Sep 23 (Today)', dayLabel: 'Tue', solarYieldKwh: 2510, performanceRatioPercent: 84.6, solarSelfConsumptionPercent: 79.5, weatherCondition: 'Optimal Clear Sky' },
  ];

  const totalSolar = weeks.reduce((sum, w) => sum + w.actual, 0);
  const totalSelfConsumed = weeks.reduce((sum, w) => sum + w.selfCons, 0);
  const totalDemand = weeks.reduce((sum, w) => sum + w.demand, 0);
  const totalExport = weeks.reduce((sum, w) => sum + w.exp, 0);
  const totalImport = weeks.reduce((sum, w) => sum + w.imp, 0);
  const utilizationPct = parseFloat(((totalSelfConsumed / totalSolar) * 100).toFixed(1));

  return {
    range: '30days',
    rangeLabel: 'Last 30 Days (Trailing 30-Day Aggregates)',
    siteName: site.name,
    totalSolarGenerationKwh: totalSolar,
    solarSelfConsumptionKwh: totalSelfConsumed,
    solarSelfConsumptionPercent: utilizationPct,
    gridImportKwh: totalImport,
    gridExportKwh: totalExport,
    solarUtilizationPercent: utilizationPct,
    pvPerformancePercent: 84.4,
    forecastAccuracyPercent: 98.1,
    estimatedCo2AvoidedTons: parseFloat(((totalSolar * 0.708) / 1000).toFixed(2)),
    totalFinancialSavingsUsd: parseFloat((totalSelfConsumed * 0.24 + totalExport * 0.08).toFixed(2)),
    totalDemandKwh: totalDemand,
    solarVsDemand,
    selfConsumptionVsGrid,
    expectedVsActual,
    sevenDayPerformance,
  };
}

