export type NavigationTab = 
  | 'dashboard'
  | 'forecast'
  | 'opportunity-windows'
  | 'health-sentinel'
  | 'analytics'
  | 'settings';

export interface SiteLocation {
  id: string;
  name: string;
  address: string;
  installedCapacityKwp: number;
  inverterCapacityKw: number;
  batteryCapacityKwh: number;
  status: 'nominal' | 'warning' | 'critical';
  timezone: string;
}

export interface RealtimeTelemetry {
  timestamp: string;
  currentSolarKw: number;
  expectedSolarKw: number;
  facilityDemandKw: number;
  netGridExportKw: number; // Positive = exporting, Negative = importing
  isExporting: boolean;
  batterySocPercent: number;
  batteryPowerKw: number; // Positive = charging, Negative = discharging
  ambientTempC: number;
  solarIrradianceWm2: number;
  selfConsumptionRatePercent: number;
  dailyYieldKwh: number;
  dailyDemandKwh: number;
  dailyGridExportKwh: number;
  dailyGridImportKwh: number;
}

export interface HistoricalDataPoint {
  time: string;
  timestamp: string;
  hour: number;
  solarKw: number;
  demandKw: number;
  netGridKw: number; // >0 export, <0 import
  batterySoc: number;
  irradianceWm2: number;
}

export interface ForecastDataPoint {
  time: string;
  timestamp: string;
  expectedSolarKw: number;
  upperConfidenceKw: number;
  lowerConfidenceKw: number;
  facilityDemandKw: number;
  irradianceWm2: number;
  cloudCoverPercent: number;
  surplusSolarKw: number;
}

export interface DayForecastHourlyPoint {
  hour: number;
  time: string;
  solarKw: number;
  upperConfidenceKw: number;
  lowerConfidenceKw: number;
  demandKw: number;
  netSurplusKw: number;
  netDeficitKw: number;
  irradianceWm2: number;
  cloudCoverPercent: number;
  weatherCondition: string;
  confidenceScorePercent: number;
}

export interface DayForecastReport {
  dayKey: 'today' | 'tomorrow' | 'dayAfter';
  dateLabel: string;
  weatherOutlook: string;
  ambientTempRange: string;
  
  // Solar Generation Forecast
  totalSolarKwh: number;
  peakSolarKw: number;
  peakSolarTime: string;
  confidencePercent: number;
  confidenceRating: 'High' | 'Moderate' | 'Good';
  sunshineHours: number;

  // Electricity Demand Forecast
  totalDemandKwh: number;
  peakDemandKw: number;
  peakDemandTime: string;
  baseDemandKw: number;

  // Net Balance
  totalSurplusKwh: number;
  totalDeficitKwh: number;
  peakSurplusKw: number;
  peakSurplusTime: string;

  // Dynamic Natural Summary
  summaryHeadline: string;
  summaryDescription: string;
  recommendedAction: string;

  hourly: DayForecastHourlyPoint[];
}

export interface TomorrowHourlyPoint {
  hour: number;
  time: string;
  predictedSolarKw: number;
  predictedDemandKw: number;
  netSurplusKw: number;
  irradianceWm2: number;
  weatherCondition: 'Sunny' | 'Partly Cloudy' | 'Clear' | 'Scattered Clouds';
  opportunityScore: number; // 0 to 100
  solarAvailability: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TomorrowSummary {
  dateLabel: string;
  predictedTotalYieldKwh: number;
  peakSolarKw: number;
  peakSolarTime: string;
  predictedDemandKwh: number;
  projectedSavingsUsd: number;
  weatherOutlook: string;
  sunshineHours: number;
  peakOpportunityWindow: {
    start: string;
    end: string;
    maxSurplusKw: number;
    recommendedAction: string;
  };
}

export interface DetectedOpportunityWindow {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  startHour: number;
  endHour: number;
  solarAvailability: 'HIGH' | 'MEDIUM' | 'LOW';
  expectedSurplusKw: number;
  avgSurplusKw: number;
  opportunityRating: number; // 0 - 100
  tierLabel: string;
  description: string;
  recommendedLoadTypes: string[];
}

export interface OpportunityWindowSummary {
  windowStart: string;
  windowEnd: string;
  durationHours: number;
  maxSurplusKw: number;
  avgSurplusKw: number;
  targetLoadName: string;
  targetCategory: string;
  estimatedSavingsUsd: number;
  solarMatchPercent: number;
  status: 'active' | 'upcoming' | 'completed';
}

export interface PVPerformanceStatus {
  healthScorePercent: number;
  status: 'Optimal' | 'Warning' | 'Degraded';
  activeAnomaliesCount: number;
  nominalStringsCount: number;
  totalStringsCount: number;
  currentVsExpectedPercent: number;
  todayLossKwh: number;
  todayLossUsd: number;
  soilingIndex: string;
}

export interface FlexibleLoadItem {
  id: string;
  name: string;
  category: 
    | 'Washing Machine' 
    | 'Water Pump' 
    | 'EV Charging' 
    | 'Water Heater' 
    | 'Water Heating'
    | 'Battery Charging' 
    | 'Battery Storage'
    | 'HVAC Pre-cooling' 
    | 'Industrial Machinery' 
    | 'Cold Storage';
  powerRatingKw: number;
  requiredDurationHours: number;
  energyDemandKwh: number;
  deadlineTime: string;
  status: 'scheduled' | 'running' | 'completed' | 'standby';
  
  // Current scheduled timing (Before optimization)
  currentScheduledTime: string;
  currentSolarAvailability: 'LOW' | 'MEDIUM' | 'HIGH';
  currentSolarMatchPercent: number;

  // Recommended timing (After SolarWise optimization)
  optimalWindowStart: string;
  optimalWindowEnd: string;
  recommendedSolarAvailability: 'LOW' | 'MEDIUM' | 'HIGH';
  solarCoveragePercent: number; // e.g. 98%
  utilizationImprovementPercent: number; // e.g. +78% improvement
  recommendationReason: string;

  estimatedCostSavings: number;
  carbonAvoidedKg: number;
  priority: 'High' | 'Medium' | 'Low';
  autoExecute: boolean;
}

export interface PVAnomaly {
  id: string;
  siteId: string;
  arrayName: string;
  stringId: string;
  severity: 'critical' | 'warning' | 'info';
  anomalyType: 'Inverter Throttling' | 'String Open Circuit' | 'Persistent Soiling' | 'Partial Shading' | 'PID Degradation' | 'Tracker Misalignment';
  detectedAt: string;
  durationHours: number;
  expectedOutputKw: number;
  actualOutputKw: number;
  lossKwhToday: number;
  financialLossUsd: number;
  status: 'active' | 'investigating' | 'resolved';
  recommendedAction: string;
  description: string;
}

export interface PVStringStatus {
  id: string;
  name: string;
  inverterId: string;
  voltageV: number;
  currentA: number;
  powerKw: number;
  expectedPowerKw: number;
  efficiencyPercent: number;
  health: 'good' | 'degraded' | 'fault';
}

// PV Health Sentinel Specific Types
export type PVDemoScenario = 'nominal' | 'weather-reduced' | 'persistent-underperformance';

export interface DayPerformanceRecord {
  date: string;
  dayLabel: string;
  expectedKwh: number;
  actualKwh: number;
  deviationKwh: number;
  deviationPercent: number;
  irradianceWm2: number;
  weatherCondition: string;
  status: 'Nominal' | 'Weather Reduced' | 'Underperforming' | 'Persistent Underperformance';
}

export interface HourlyExpectedVsActualPoint {
  hour: number;
  time: string;
  expectedKw: number;
  actualKw: number;
  deviationKw: number;
  deviationPercent: number;
  irradianceWm2: number;
  ambientTempC: number;
}

export interface ProbableContributor {
  id: string;
  name: string;
  probability: 'High' | 'Moderate' | 'Low' | 'Negligible';
  confidenceScore: number;
  description: string;
  evidence: string;
}

export interface PVHealthSentinelReport {
  scenario: PVDemoScenario;
  scenarioTitle: string;
  siteName: string;
  
  // Overview metrics
  todayExpectedKwh: number;
  todayActualKwh: number;
  todayDeviationKwh: number;
  todayDeviationPercent: number;
  healthScorePercent: number;
  plantHealthStatus: 'Optimal' | 'Advisory / Weather Impacted' | 'Degraded / Persistent Anomaly';
  healthBadgeSeverity: 'nominal' | 'advisory' | 'warning' | 'critical';
  
  // Persistence Engine findings
  isPersistentUnderperformance: boolean;
  persistenceHeadline: string;
  persistenceSummary: string;
  consecutiveDeficitDays: number;
  meanMultiDayDeviationPercent: number;

  // Probable Contributors
  contributors: ProbableContributor[];

  // Alert Card details
  alert: {
    severity: 'nominal' | 'advisory' | 'warning' | 'critical';
    detectionDateTime: string;
    expectedSummary: string;
    actualSummary: string;
    deviationLabel: string;
    probableContributorSummary: string;
    recommendedInvestigation: string;
    headline: string;
    body: string;
  };

  // 7-day history & 24h hourly points
  history7d: DayPerformanceRecord[];
  hourly24h: HourlyExpectedVsActualPoint[];
}

export type AnalyticsRange = 'today' | '7days' | '30days';

export interface AnalyticsSolarVsDemandPoint {
  label: string;
  solarKwh: number;
  demandKwh: number;
  netSurplusKwh: number;
  netDeficitKwh: number;
}

export interface AnalyticsSelfConsumptionPoint {
  label: string;
  solarSelfConsumedKwh: number;
  gridImportKwh: number;
  gridExportKwh: number;
}

export interface AnalyticsExpectedVsActualPoint {
  label: string;
  expectedKwh: number;
  actualKwh: number;
  deviationPercent: number;
}

export interface Analytics7DayPoint {
  date: string;
  dayLabel: string;
  solarYieldKwh: number;
  performanceRatioPercent: number;
  solarSelfConsumptionPercent: number;
  weatherCondition: string;
}

export interface AnalyticsDataSet {
  range: AnalyticsRange;
  rangeLabel: string;
  siteName: string;
  
  // Core Required KPIs
  totalSolarGenerationKwh: number;
  solarSelfConsumptionKwh: number;
  solarSelfConsumptionPercent: number; // Solar utilization %
  gridImportKwh: number;
  gridExportKwh: number;
  solarUtilizationPercent: number;
  pvPerformancePercent: number;
  forecastAccuracyPercent: number;
  estimatedCo2AvoidedTons: number;
  totalFinancialSavingsUsd: number;
  totalDemandKwh: number;
  
  // Interactive Chart Time Series
  solarVsDemand: AnalyticsSolarVsDemandPoint[];
  selfConsumptionVsGrid: AnalyticsSelfConsumptionPoint[];
  expectedVsActual: AnalyticsExpectedVsActualPoint[];
  sevenDayPerformance: Analytics7DayPoint[];
}

export interface AnalyticsSummary {
  period: 'day' | 'week' | 'month' | 'year';
  totalGenerationKwh: number;
  totalConsumptionKwh: number;
  solarSelfConsumedKwh: number;
  gridExportKwh: number;
  gridImportKwh: number;
  selfSufficiencyPercent: number;
  performanceRatioPercent: number;
  co2AvoidedTons: number;
  totalFinancialSavingsUsd: number;
}

export interface SystemSettingsState {
  siteName: string;
  locationAddress: string;
  installedCapacityKwp: number;
  tiltAngleDeg: number;
  azimuthDeg: number;
  peakTariffRateUsd: number;
  offPeakTariffRateUsd: number;
  feedInTariffUsd: number;
  underperformanceAlertThresholdPercent: number;
  soilingSensitivity: 'low' | 'medium' | 'high';
  emailAlerts: boolean;
  autoDispatchFlexibleLoads: boolean;
  minSolarCoverageForDispatch: number;
}
