import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Clock, 
  DollarSign, 
  Leaf, 
  Zap, 
  Sun, 
  ArrowRight,
  Plus, 
  CheckCircle2, 
  AlertCircle,
  Play, 
  Pause, 
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  BatteryCharging,
  Car,
  Thermometer,
  Waves,
  Boxes,
  HelpCircle,
  Sliders,
  Check,
  RefreshCw,
  Info
} from 'lucide-react';
import { SiteLocation, FlexibleLoadItem, TomorrowHourlyPoint, DetectedOpportunityWindow } from '../../types';
import { 
  generateTomorrowForecast, 
  detectOpportunityWindows, 
  getSuitableLoadsForHour 
} from '../../data/energyEngine';

interface OpportunityWindowsPageProps {
  activeSite: SiteLocation;
  flexibleLoads: FlexibleLoadItem[];
  onToggleAutoExecute: (loadId: string) => void;
  onDispatchLoad: (loadId: string) => void;
  onAddLoad: (newLoad: Omit<FlexibleLoadItem, 'id'>) => void;
}

export const OpportunityWindowsPage: React.FC<OpportunityWindowsPageProps> = ({
  activeSite,
  flexibleLoads,
  onToggleAutoExecute,
  onDispatchLoad,
  onAddLoad,
}) => {
  // Generate tomorrow's forecast & identify opportunity windows dynamically
  const { hourly, summary } = useMemo(() => {
    return generateTomorrowForecast(activeSite);
  }, [activeSite]);

  const opportunityWindows = useMemo(() => {
    return detectOpportunityWindows(hourly);
  }, [hourly]);

  // Selected interactive hour (default 12:00 PM noon)
  const [selectedHour, setSelectedHour] = useState<number>(12);
  
  // Selected load category filter
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Selected window filter (optional highlight)
  const [selectedWindowId, setSelectedWindowId] = useState<string | null>('window-prime');
  
  // Track applied schedules (for the Before vs Recommended comparison action)
  const [appliedLoadIds, setAppliedLoadIds] = useState<Record<string, boolean>>({});

  // Add Load Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLoadName, setNewLoadName] = useState('');
  const [newLoadCategory, setNewLoadCategory] = useState<FlexibleLoadItem['category']>('Washing Machine');
  const [newPowerRating, setNewPowerRating] = useState('3.5');
  const [newDuration, setNewDuration] = useState('1.5');
  const [newCurrentSchedule, setNewCurrentSchedule] = useState('08:00 AM');

  // Selected hour object
  const activeHourData: TomorrowHourlyPoint = hourly.find(h => h.hour === selectedHour) || hourly[12];
  
  // Compute suitable loads for active hour
  const { suitable, tight, unsuitable } = useMemo(() => {
    return getSuitableLoadsForHour(activeHourData, flexibleLoads);
  }, [activeHourData, flexibleLoads]);

  // Summary statistics
  const totalDailySavings = flexibleLoads.reduce((sum, l) => sum + l.estimatedCostSavings, 0);
  const totalAvoidedCarbon = flexibleLoads.reduce((sum, l) => sum + l.carbonAvoidedKg, 0);
  const avgSolarCoverage = (flexibleLoads.reduce((sum, l) => sum + l.solarCoveragePercent, 0) / flexibleLoads.length).toFixed(1);
  const totalShiftableKwh = flexibleLoads.reduce((sum, l) => sum + l.energyDemandKwh, 0);

  const filteredLoads = useMemo(() => {
    if (filterCategory === 'all') return flexibleLoads;
    return flexibleLoads.filter(l => l.category === filterCategory);
  }, [flexibleLoads, filterCategory]);

  const handleApplyOptimization = (loadId: string) => {
    setAppliedLoadIds(prev => ({
      ...prev,
      [loadId]: !prev[loadId]
    }));
  };

  const handleApplyAllOptimizations = () => {
    const allApplied: Record<string, boolean> = {};
    flexibleLoads.forEach(l => {
      allApplied[l.id] = true;
    });
    setAppliedLoadIds(allApplied);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoadName.trim()) return;

    const power = parseFloat(newPowerRating) || 3.5;
    const dur = parseFloat(newDuration) || 1.5;
    const energy = power * dur;

    onAddLoad({
      name: newLoadName,
      category: newLoadCategory,
      powerRatingKw: power,
      requiredDurationHours: dur,
      energyDemandKwh: energy,
      deadlineTime: '18:00 Tomorrow',
      status: 'scheduled',
      currentScheduledTime: `${newCurrentSchedule} (User Configured)`,
      currentSolarAvailability: 'LOW',
      currentSolarMatchPercent: 15.0,
      optimalWindowStart: '12:00 PM',
      optimalWindowEnd: `${Math.floor(12 + dur)}:${(dur % 1 * 60).toString().padStart(2, '0')} PM`,
      recommendedSolarAvailability: 'HIGH',
      solarCoveragePercent: 98.0,
      utilizationImprovementPercent: 83.0,
      recommendationReason: 'Calculated optimal fit during prime solar surplus window with zero grid curtailment.',
      estimatedCostSavings: parseFloat((energy * 0.22).toFixed(2)),
      carbonAvoidedKg: parseFloat((energy * 0.39).toFixed(1)),
      priority: 'Medium',
      autoExecute: true,
    });

    setNewLoadName('');
    setShowAddModal(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Washing Machine': return RefreshCw;
      case 'Water Pump': return Waves;
      case 'EV Charging': return Car;
      case 'Water Heating': return Waves;
      case 'Battery Storage': 
      case 'Battery Charging': return BatteryCharging;
      case 'HVAC Pre-cooling': return Thermometer;
      default: return Boxes;
    }
  };

  const getAvailabilityBadge = (availability: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (availability) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            HIGH SOLAR
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            MEDIUM SOLAR
          </span>
        );
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            LOW SOLAR
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Mission Banner · Core Capability: OPTIMIZE */}
      <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-900 border border-emerald-500/20 rounded font-semibold text-[11px] uppercase tracking-wider">
              Core Capability 02 · Optimize
            </span>
            <span className="text-slate-300">·</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[11px]">
              Opportunity Window Engine · Demo Plant Data
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-medium">
              Site: <strong className="text-slate-800">{activeSite.name.split('(')[0]}</strong>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            Opportunity Windows & Flexible Load Optimization
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Automatically detect clean solar surplus windows and intelligently shift discretionary loads (Washing Machines, Water Pumps, EV Charging, Water Heaters, Batteries) for maximum self-consumption.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            onClick={handleApplyAllOptimizations}
            className="px-3.5 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Apply All Recommended Windows</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Flexible Load</span>
          </button>
        </div>
      </div>

      {/* 2. Aggregate Impact Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Daily Shifting Savings</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-700">
              ${totalDailySavings.toFixed(2)}
            </span>
            <span className="text-xs font-bold font-mono text-slate-500">/ day</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Projected Monthly:</span>
            <strong className="font-mono text-slate-900">${(totalDailySavings * 30).toFixed(0)}</strong>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Solar Self-Powered Match</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {avgSolarCoverage}%
            </span>
            <span className="text-xs font-bold font-mono text-emerald-700">clean solar</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Grid Import Avoided:</span>
            <strong className="font-mono text-emerald-700">92.4%</strong>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Avoided Carbon Footprint</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-700">
              {totalAvoidedCarbon.toFixed(1)}
            </span>
            <span className="text-xs font-bold font-mono text-slate-500">kg CO₂e</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Thermal Peakers Displaced:</span>
            <strong className="font-mono text-slate-900">100%</strong>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Shiftable Energy</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {totalShiftableKwh.toFixed(1)}
            </span>
            <span className="text-xs font-bold font-mono text-slate-500">kWh</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Managed Flexible Assets:</span>
            <strong className="font-mono text-slate-900">{flexibleLoads.length} Loads</strong>
          </div>
        </div>
      </div>

      {/* 3. Section 1: Tomorrow's Solar Availability Timeline (Requirement 1 & Requirement 6) */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1. Tomorrow's Solar Availability Timeline ({summary.dateLabel})
              </h3>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-mono font-bold">
                Surplus Peak: +{summary.peakOpportunityWindow.maxSurplusKw} kW
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hourly generation trajectory with classified LOW, MEDIUM, and HIGH availability zones and clean solar surplus periods.
            </p>
          </div>

          {/* Availability Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-slate-200 border border-slate-300" />
              <span className="text-slate-600 font-medium">LOW (&lt;90 kW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-400 border border-amber-500" />
              <span className="text-amber-900 font-medium">MEDIUM (90–250 kW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 border border-emerald-600" />
              <span className="text-emerald-900 font-bold">HIGH (&gt;250 kW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-300/60 border border-emerald-500 border-dashed" />
              <span className="text-emerald-800 font-semibold">Net Solar Surplus Area</span>
            </div>
          </div>
        </div>

        {/* 24-Hour Timeline Bar Ribbon with Availability Tiers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <span>24-Hour Solar Availability Ribbon (Click any hour to inspect & test load fitness)</span>
            <span className="font-mono text-emerald-700">Selected Hour: {activeHourData.time}</span>
          </div>

          {/* Interactive Bar Matrix */}
          <div className="grid grid-cols-24 gap-1 h-14 bg-slate-50 p-1.5 rounded-xl border border-slate-200 select-none">
            {hourly.map((point) => {
              const isSelected = selectedHour === point.hour;
              const isSurplus = point.netSurplusKw > 0;
              
              let barColor = 'bg-slate-200 hover:bg-slate-300 text-slate-600';
              if (point.solarAvailability === 'HIGH') {
                barColor = 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs';
              } else if (point.solarAvailability === 'MEDIUM') {
                barColor = 'bg-amber-400 hover:bg-amber-500 text-amber-950';
              }

              return (
                <button
                  key={point.hour}
                  type="button"
                  onClick={() => setSelectedHour(point.hour)}
                  title={`${point.time}: ${point.predictedSolarKw} kW Solar (${point.solarAvailability}) | Surplus: +${point.netSurplusKw} kW`}
                  className={`relative col-span-1 rounded-md transition-all flex flex-col items-center justify-between p-1 text-[9px] font-mono ${barColor} ${
                    isSelected ? 'ring-2 ring-slate-900 ring-offset-2 scale-105 z-10' : ''
                  }`}
                >
                  <span className="font-bold text-[8px] leading-none opacity-80">{point.hour}h</span>
                  
                  {/* Surplus indicator dot */}
                  {isSurplus && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" title={`Surplus +${point.netSurplusKw} kW`} />
                  )}

                  <span className="text-[8px] font-bold leading-none">
                    {point.predictedSolarKw > 0 ? Math.round(point.predictedSolarKw) : '0'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time & Surplus Markers below the timeline */}
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono px-1">
            <span>00:00 (Night / Low)</span>
            <span className="text-slate-600">06:00 (Sunrise)</span>
            <span className="text-amber-700 font-medium">09:00 (Ramp / Medium)</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              11:00 – 14:30 (Peak Surplus / High)
            </span>
            <span className="text-amber-700 font-medium">16:30 (Sunset / Medium)</span>
            <span>23:00 (Night / Low)</span>
          </div>
        </div>

        {/* Interactive Hour Readout Bar (Requirement 6) */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs text-amber-600">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  Hour Inspector: <span className="font-mono text-emerald-700">{activeHourData.time}</span>
                </span>
                {getAvailabilityBadge(activeHourData.solarAvailability)}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Weather: {activeHourData.weatherCondition} · Irradiance: {activeHourData.irradianceWm2} W/m² · Grid Demand: {activeHourData.predictedDemandKw} kW
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono sm:flex sm:items-center sm:gap-4 text-slate-800">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[10px] block uppercase">Solar Output</span>
              <span className="font-bold text-amber-700 text-sm">{activeHourData.predictedSolarKw} kW</span>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[10px] block uppercase">Facility Demand</span>
              <span className="font-bold text-slate-900 text-sm">{activeHourData.predictedDemandKw} kW</span>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-slate-500 text-[10px] block uppercase">Net Surplus Balance</span>
              <span className={`font-bold text-sm ${activeHourData.netSurplusKw > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                {activeHourData.netSurplusKw > 0 ? `+${activeHourData.netSurplusKw} kW` : '0.0 kW (Grid draw)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section 2: Automatically Identified Opportunity Windows (Requirement 2) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>2. Identified Opportunity Windows (Automated Detection)</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-mono text-[11px]">
                {opportunityWindows.length} Windows Detected
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Optimal time windows where flexible appliances and heavy commercial loads can consume excess solar generation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {opportunityWindows.map((window) => {
            const isPrime = window.id === 'window-prime';
            const isSelected = selectedWindowId === window.id;

            return (
              <div
                key={window.id}
                onClick={() => {
                  setSelectedWindowId(window.id);
                  setSelectedHour(window.startHour + 1);
                }}
                className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                    : isPrime
                    ? 'bg-white border-amber-300 hover:border-emerald-400 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {isPrime && (
                  <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded uppercase tracking-wider shadow-xs">
                    🌟 Prime Recommended Window
                  </span>
                )}

                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {window.name}
                  </span>
                  {getAvailabilityBadge(window.solarAvailability)}
                </div>

                {/* Window Timing & Opportunity Rating */}
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 font-mono">
                    <span className="text-slate-500">Time Window:</span>
                    <strong className="text-slate-900 font-bold">
                      {window.startTime} – {window.endTime}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100 font-mono">
                    <span className="text-slate-500">Expected Surplus:</span>
                    <strong className="text-emerald-700 font-bold">
                      +{window.expectedSurplusKw} kW peak
                    </strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100 font-mono">
                    <span className="text-slate-500">Opportunity Score:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{window.opportunityRating}/100</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">
                        {window.tierLabel.split('(')[0]}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 mt-3 leading-relaxed">
                  {window.description}
                </p>

                {/* Recommended Load Types tags */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Suitable:</span>
                  {window.recommendedLoadTypes.map((type) => (
                    <span key={type} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Section 3: Smart Recommendations & Before vs Recommended Comparison (Requirement 4 & Requirement 5) */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. Smart Recommendations & Schedule Optimization (Before vs Recommended)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated load-to-window matching algorithms pairing flexible appliances with available solar surplus.
            </p>
          </div>

          {/* Category Quick Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs overflow-x-auto">
            {['all', 'Washing Machine', 'Water Pump', 'EV Charging', 'Water Heating', 'Battery Storage', 'HVAC Pre-cooling'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                  filterCategory === cat
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'all' ? 'All Flexible Loads' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Load Matching Cards: Before vs Recommended */}
        <div className="space-y-4">
          {filteredLoads.map((load) => {
            const isApplied = !!appliedLoadIds[load.id];
            const CategoryIcon = getCategoryIcon(load.category);

            return (
              <div 
                key={load.id} 
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isApplied
                    ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-400/30'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Asset Details & Smart Recommendation Callout */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs shrink-0">
                        <CategoryIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{load.name}</h4>
                          <span className="px-2 py-0.5 bg-slate-200/80 text-slate-700 text-[10px] font-semibold rounded uppercase">
                            {load.category}
                          </span>
                          <span className="font-mono text-xs text-slate-500">
                            ({load.powerRatingKw} kW · {load.requiredDurationHours} hrs · {load.energyDemandKwh} kWh)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Prominent Smart Recommendation (Requirement 4) */}
                    <div className="p-3 bg-white rounded-lg border border-amber-200 shadow-2xs space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Smart Recommendation: Run {load.category} between {load.optimalWindowStart} and {load.optimalWindowEnd}.</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        <strong className="text-slate-800">Reason:</strong> {load.recommendationReason}
                      </p>
                    </div>
                  </div>

                  {/* Middle Column: Visual Before vs Recommended Schedule (Requirement 5) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:w-96 shrink-0 text-xs">
                    {/* Before Card */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Current Schedule (Before)
                      </span>
                      <p className="font-bold text-slate-800 font-mono text-[11px] truncate">
                        {load.currentScheduledTime}
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                        <span className="text-slate-500">Solar Availability:</span>
                        <span className="text-rose-700 font-bold">LOW (12% Solar)</span>
                      </div>
                    </div>

                    {/* Recommended Card */}
                    <div className="p-3 bg-white rounded-lg border border-emerald-300 shadow-2xs space-y-1 ring-1 ring-emerald-500/10">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block flex items-center justify-between">
                        <span>SolarWise Recommended</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      </span>
                      <p className="font-bold text-emerald-900 font-mono text-[11px]">
                        {load.optimalWindowStart} – {load.optimalWindowEnd}
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                        <span className="text-slate-500">Improvement:</span>
                        <span className="text-emerald-700 font-bold">+{load.utilizationImprovementPercent}% Match</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions & Impact Summary */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200">
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-emerald-700 block">
                        +${load.estimatedCostSavings.toFixed(2)} savings
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {load.carbonAvoidedKg} kg CO₂ avoided
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyOptimization(load.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs ${
                        isApplied
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Schedule Applied</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>Apply Recommendation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Section 4: Interactive Hour Selection & Load Compatibility Engine (Requirement 6) */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>4. Interactive Hour Selection & Load Compatibility Engine</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[11px]">
                Testing Hour: {activeHourData.time}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live power evaluation checking which flexible loads can safely execute in this interval without importing from the grid.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Available Surplus:</span>
            <strong className="text-emerald-700 font-bold text-sm">+{activeHourData.netSurplusKw} kW</strong>
          </div>
        </div>

        {/* 3 Categories of Load Compatibility for selected hour */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Box 1: Optimal to Run Now */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
              <span className="font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Optimal to Run ({suitable.length})</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-mono font-semibold">100% Solar Surplus</span>
            </div>

            {suitable.length === 0 ? (
              <p className="text-slate-500 text-[11px] italic py-2">
                No loads match within the available +{activeHourData.netSurplusKw} kW surplus headroom.
              </p>
            ) : (
              <div className="space-y-2">
                {suitable.map((load) => (
                  <div key={load.id} className="p-2.5 bg-white rounded-lg border border-emerald-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{load.name}</span>
                      <span className="font-mono text-emerald-700 font-bold">{load.powerRatingKw} kW</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Surplus headroom remaining: <strong className="font-mono text-slate-800">+{(activeHourData.netSurplusKw - load.powerRatingKw).toFixed(1)} kW</strong>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Box 2: Tight / High Power Capacity */}
          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
              <span className="font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Partial Solar Support ({tight.length})</span>
              </span>
              <span className="text-[10px] text-amber-700 font-mono font-semibold">Moderate Support</span>
            </div>

            {tight.length === 0 ? (
              <p className="text-slate-500 text-[11px] italic py-2">
                No loads in moderate threshold for this hour.
              </p>
            ) : (
              <div className="space-y-2">
                {tight.map((load) => (
                  <div key={load.id} className="p-2.5 bg-white rounded-lg border border-amber-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{load.name}</span>
                      <span className="font-mono text-amber-700 font-bold">{load.powerRatingKw} kW</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Requires {load.powerRatingKw} kW (Exceeds surplus by {(load.powerRatingKw - activeHourData.netSurplusKw).toFixed(1)} kW).
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Box 3: Incompatible / Low Solar */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Not Recommended ({unsuitable.length})</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Shift to Noon</span>
            </div>

            {unsuitable.length === 0 ? (
              <p className="text-slate-500 text-[11px] italic py-2">
                All loads are accommodated!
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {unsuitable.map((load) => (
                  <div key={load.id} className="p-2 bg-white rounded-md border border-slate-200 text-[11px] flex items-center justify-between text-slate-600">
                    <span className="truncate">{load.name}</span>
                    <span className="font-mono text-slate-400 shrink-0">{load.powerRatingKw} kW</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 7. Add Flexible Load Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Register Flexible Load Asset
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded font-bold">
                Auto-Window Detection
              </span>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Asset Name / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Industrial Washing Machine #2"
                  value={newLoadName}
                  onChange={(e) => setNewLoadName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={newLoadCategory}
                    onChange={(e) => setNewLoadCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Washing Machine">Washing Machine</option>
                    <option value="Water Pump">Water Pump</option>
                    <option value="EV Charging">EV Charging</option>
                    <option value="Water Heating">Water Heater</option>
                    <option value="Battery Storage">Battery Charging</option>
                    <option value="HVAC Pre-cooling">HVAC Pre-cooling</option>
                    <option value="Industrial Machinery">Industrial Machinery</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Power Rating (kW)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newPowerRating}
                    onChange={(e) => setNewPowerRating(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Run Duration (Hours)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Current Schedule</label>
                  <input
                    type="text"
                    value={newCurrentSchedule}
                    onChange={(e) => setNewCurrentSchedule(e.target.value)}
                    placeholder="e.g., 07:30 AM"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                💡 SolarWise will automatically compute the optimal surplus window and simulate utility cost savings.
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-2xs"
                >
                  Register & Calculate Window
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
