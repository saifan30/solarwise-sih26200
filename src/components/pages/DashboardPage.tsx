import React, { useState } from 'react';
import { 
  Sun, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  BatteryCharging, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  Activity, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  DollarSign,
  Leaf,
  Layers,
  Calendar,
  Gauge,
  Info,
  Radio,
  Sliders,
  Check
} from 'lucide-react';
import { 
  SiteLocation, 
  RealtimeTelemetry, 
  HistoricalDataPoint,
  ForecastDataPoint, 
  TomorrowHourlyPoint,
  TomorrowSummary,
  FlexibleLoadItem, 
  PVAnomaly, 
  PVStringStatus,
  NavigationTab 
} from '../../types';
import { 
  computePVHealthStatus, 
  computeNextOpportunityWindow 
} from '../../data/energyEngine';

interface DashboardPageProps {
  activeSite: SiteLocation;
  telemetry: RealtimeTelemetry;
  history24h: HistoricalDataPoint[];
  forecast24h: ForecastDataPoint[];
  tomorrowForecast: {
    hourly: TomorrowHourlyPoint[];
    summary: TomorrowSummary;
  };
  flexibleLoads: FlexibleLoadItem[];
  anomalies: PVAnomaly[];
  stringStatuses: PVStringStatus[];
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  activeSite,
  telemetry,
  history24h,
  forecast24h,
  tomorrowForecast,
  flexibleLoads,
  anomalies,
  stringStatuses,
  onNavigate,
}) => {
  // Chart interaction states
  const [hoveredHistoryIndex, setHoveredHistoryIndex] = useState<number | null>(13); // Default to ~13:00 (peak)
  const [chartViewMode, setChartViewMode] = useState<'all' | 'solar-demand' | 'net-grid'>('all');
  
  // Tomorrow Preview state
  const [selectedTomorrowHour, setSelectedTomorrowHour] = useState<number>(12); // Noon default

  // Derived calculations from shared application state
  const healthStatus = computePVHealthStatus(anomalies, stringStatuses);
  const nextOpportunity = computeNextOpportunityWindow(flexibleLoads);
  
  const currentHoveredPoint = hoveredHistoryIndex !== null ? history24h[hoveredHistoryIndex] : history24h[13];
  const selectedTomorrowPoint = tomorrowForecast.hourly.find(p => p.hour === selectedTomorrowHour) || tomorrowForecast.hourly[12];

  // Max scale for chart (ensure proportional rendering)
  const maxKwScale = Math.max(
    ...history24h.map(p => Math.max(p.solarKw, p.demandKw, Math.abs(p.netGridKw))),
    activeSite.installedCapacityKwp
  ) * 1.05;

  return (
    <div className="space-y-6">
      {/* 1. Platform & Demo Plant Meta Banner */}
      <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-900 border border-amber-500/20 rounded font-semibold text-[11px] uppercase tracking-wider">
              Demo Plant Data
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600 font-medium">Site ID: <span className="font-mono text-slate-800">{activeSite.id}</span></span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-600 font-medium">Timezone: <span className="font-mono text-slate-800">{activeSite.timezone}</span></span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Inverter Telemetry
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3 pt-0.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {activeSite.name}
            </h2>
            <span className="text-xs text-slate-500 font-normal">
              {activeSite.address}
            </span>
          </div>
        </div>

        {/* Plant Specs Quick Indicator Badge */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="text-[11px] text-slate-500 block uppercase font-medium">Installed DC Capacity</span>
            <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
              {activeSite.installedCapacityKwp} <span className="text-xs font-normal text-slate-500">kWp</span>
            </span>
          </div>

          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="text-[11px] text-slate-500 block uppercase font-medium">Inverter Rating</span>
            <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
              {activeSite.inverterCapacityKw} <span className="text-xs font-normal text-slate-500">kW AC</span>
            </span>
          </div>

          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="text-[11px] text-slate-500 block uppercase font-medium">BESS Storage</span>
            <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
              {activeSite.batteryCapacityKwh} <span className="text-xs font-normal text-slate-500">kWh</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Comprehensive 8 Core KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Current Solar Generation in kW */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Current Solar Generation
            </span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {telemetry.currentSolarKw.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">kW</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Expected: <strong className="font-mono text-slate-800">{telemetry.expectedSolarKw.toFixed(1)} kW</strong></span>
            <span className="font-mono text-amber-700 font-semibold">
              {((telemetry.currentSolarKw / telemetry.expectedSolarKw) * 100).toFixed(0)}% nominal
            </span>
          </div>
        </div>

        {/* KPI 2: Today's Solar Energy Generated in kWh */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Today's Solar Energy Generated
            </span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-700">
              {telemetry.dailyYieldKwh.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">kWh</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Peak Sun Hours:</span>
            <span className="font-mono font-semibold text-slate-800">
              {(telemetry.dailyYieldKwh / activeSite.installedCapacityKwp).toFixed(2)} hrs
            </span>
          </div>
        </div>

        {/* KPI 3: Today's Electricity Consumption in kWh */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Today's Electricity Consumption
            </span>
            <Zap className="w-4 h-4 text-slate-700" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {telemetry.dailyDemandKwh.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">kWh</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Instant Load: <strong className="font-mono text-slate-800">{telemetry.facilityDemandKw.toFixed(1)} kW</strong></span>
            <span className="font-mono text-emerald-700 font-semibold">{telemetry.selfConsumptionRatePercent}% solar-fed</span>
          </div>
        </div>

        {/* KPI 4: Current Grid Import / Export Flow */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Current Grid Exchange
            </span>
            {telemetry.isExporting ? (
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Exporting
              </span>
            ) : (
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" /> Importing
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${telemetry.isExporting ? 'text-emerald-700' : 'text-slate-800'}`}>
              {telemetry.isExporting ? `+${telemetry.netGridExportKw.toFixed(1)}` : `${telemetry.netGridExportKw.toFixed(1)}`}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">kW</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Exported Today:</span>
            <span className="font-mono font-semibold text-emerald-700">{telemetry.dailyGridExportKwh.toFixed(0)} kWh</span>
          </div>
        </div>

        {/* KPI 5: Solar Plant Capacity & Specs */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Solar Plant Capacity
            </span>
            <Gauge className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {activeSite.installedCapacityKwp}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">kWp DC</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Inverter / BESS:</span>
            <span className="font-mono font-medium text-slate-800">
              {activeSite.inverterCapacityKw} kW / {activeSite.batteryCapacityKwh} kWh
            </span>
          </div>
        </div>

        {/* KPI 6: PV Performance Status */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              PV Performance Status
            </span>
            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${
              healthStatus.status === 'Optimal' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-900'
            }`}>
              {healthStatus.status}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {healthStatus.healthScorePercent}%
            </span>
            <span className="text-xs font-semibold text-slate-500">Fleet Health</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>String Arrays:</span>
            <span className="font-mono font-medium text-slate-800">
              {healthStatus.nominalStringsCount} / {healthStatus.totalStringsCount} Nominal
              {healthStatus.activeAnomaliesCount > 0 && (
                <span className="text-red-600 font-semibold ml-1">({healthStatus.activeAnomaliesCount} flag)</span>
              )}
            </span>
          </div>
        </div>

        {/* KPI 7: Next Opportunity Window */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Next Opportunity Window
            </span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-700 truncate">
              {nextOpportunity.windowStart} – {nextOpportunity.windowEnd}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Peak Clean Surplus:</span>
            <span className="font-mono font-bold text-emerald-700">+{nextOpportunity.maxSurplusKw} kW</span>
          </div>
        </div>

        {/* KPI 8: Tomorrow's Predicted Solar Generation */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Tomorrow's Predicted Solar
            </span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {tomorrowForecast.summary.predictedTotalYieldKwh.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">kWh</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Peak Expected:</span>
            <span className="font-mono font-semibold text-slate-800">
              {tomorrowForecast.summary.peakSolarKw} kW ({tomorrowForecast.summary.peakSolarTime})
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Interactive 24-Hour Chart: Solar Generation, Electricity Demand & Net Grid Flow */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                24-Hour Multi-Stream Energy Exchange Chart
              </h3>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
                Past 24 Hours Telemetry (Demo Plant Data)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive timeline comparing real Solar Generation, Facility Electrical Demand, and Net Grid Import/Export.
            </p>
          </div>

          {/* Interactive Series View Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setChartViewMode('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                chartViewMode === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All 3 Series
            </button>
            <button
              type="button"
              onClick={() => setChartViewMode('solar-demand')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                chartViewMode === 'solar-demand'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Solar vs Demand
            </button>
            <button
              type="button"
              onClick={() => setChartViewMode('net-grid')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                chartViewMode === 'net-grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Net Grid Flow
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-medium text-slate-600">
            {(chartViewMode === 'all' || chartViewMode === 'solar-demand') && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-amber-500 border border-amber-600" />
                <span>Solar Generation (kW)</span>
              </div>
            )}
            {(chartViewMode === 'all' || chartViewMode === 'solar-demand') && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-slate-700" />
                <span>Facility Demand (kW)</span>
              </div>
            )}
            {(chartViewMode === 'all' || chartViewMode === 'net-grid') && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-emerald-500/30 border border-emerald-600" />
                <span>Net Grid Flow (+Export / -Import)</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-500">
              <span className="w-3 h-0.5 bg-amber-400 border-b border-dashed" />
              <span>Current Time Marker</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Hover or click column to inspect exact hour values
          </div>
        </div>

        {/* Interactive SVG Chart Viewport */}
        <div className="relative w-full h-72 sm:h-80 select-none">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 880 260" preserveAspectRatio="none">
            <defs>
              <linearGradient id="dashSolarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="dashGridExportGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="dashGridImportGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#64748b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#64748b" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 100, 200, 300, 400, 500].map((val) => {
              const y = 230 - (val / 520) * 210;
              return (
                <g key={val}>
                  <line x1="45" y1={y} x2="860" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  <text x="36" y={y + 4} textAnchor="end" className="text-[10px] font-mono fill-slate-400">
                    {val} kW
                  </text>
                </g>
              );
            })}

            {/* Zero Axis / Grid baseline */}
            <line x1="45" y1="230" x2="860" y2="230" stroke="#cbd5e1" strokeWidth="1.2" />

            {/* Net Grid Flow Fill & Area (if enabled) */}
            {(chartViewMode === 'all' || chartViewMode === 'net-grid') && (() => {
              const exportPath = history24h.reduce((acc, p, i) => {
                const x = 50 + (i / 23) * 800;
                const exportVal = Math.max(0, p.netGridKw);
                const y = 230 - (exportVal / 520) * 210;
                return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }, '') + ` L 850 230 L 50 230 Z`;

              return (
                <g>
                  <path d={exportPath} fill="url(#dashGridExportGrad)" />
                  {/* Grid Export Line */}
                  <path
                    d={history24h.reduce((acc, p, i) => {
                      const x = 50 + (i / 23) * 800;
                      const exportVal = Math.max(0, p.netGridKw);
                      const y = 230 - (exportVal / 520) * 210;
                      return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }, '')}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                  />
                </g>
              );
            })()}

            {/* Solar Generation Area Fill & Curve */}
            {(chartViewMode === 'all' || chartViewMode === 'solar-demand') && (() => {
              const solarAreaPath = history24h.reduce((acc, p, i) => {
                const x = 50 + (i / 23) * 800;
                const y = 230 - (p.solarKw / 520) * 210;
                return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }, '') + ` L 850 230 L 50 230 Z`;

              const solarLinePath = history24h.reduce((acc, p, i) => {
                const x = 50 + (i / 23) * 800;
                const y = 230 - (p.solarKw / 520) * 210;
                return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }, '');

              return (
                <g>
                  <path d={solarAreaPath} fill="url(#dashSolarGrad)" />
                  <path d={solarLinePath} fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              );
            })()}

            {/* Facility Demand Curve Line */}
            {(chartViewMode === 'all' || chartViewMode === 'solar-demand') && (() => {
              const demandLinePath = history24h.reduce((acc, p, i) => {
                const x = 50 + (i / 23) * 800;
                const y = 230 - (p.demandKw / 520) * 210;
                return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }, '');

              return (
                <path d={demandLinePath} fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 2" />
              );
            })()}

            {/* Interactive Column Hover Slots */}
            {history24h.map((p, i) => {
              const x = 50 + (i / 23) * 800;
              const isHovered = hoveredHistoryIndex === i;
              const ySolar = 230 - (p.solarKw / 520) * 210;
              const yDemand = 230 - (p.demandKw / 520) * 210;

              return (
                <g 
                  key={p.time} 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredHistoryIndex(i)}
                  onClick={() => setHoveredHistoryIndex(i)}
                >
                  {/* Invisible broad hitbox */}
                  <rect x={x - 16} y="15" width="32" height="235" fill="transparent" />

                  {/* Scrubber vertical guide line */}
                  {isHovered && (
                    <g>
                      <line x1={x} y1="15" x2={x} y2="230" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                      {/* Solar node */}
                      <circle cx={x} cy={ySolar} r="5" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
                      {/* Demand node */}
                      <circle cx={x} cy={yDemand} r="4.5" fill="#1e293b" stroke="#ffffff" strokeWidth="2" />
                    </g>
                  )}
                </g>
              );
            })}

            {/* Time labels along the bottom X-axis */}
            {history24h.map((p, i) => {
              if (i % 2 !== 0 && i !== 23) return null;
              const x = 50 + (i / 23) * 800;
              return (
                <text key={p.time} x={x} y="250" textAnchor="middle" className="text-[10px] font-mono fill-slate-500">
                  {p.time}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Dynamic Telemetry Scrubber Readout Box */}
        {currentHoveredPoint && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-slate-900">
                Timeline Instant: <span className="font-mono text-amber-700 font-bold">{currentHoveredPoint.time}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-slate-700 font-mono">
              <div>
                <span className="text-slate-500">Solar Gen: </span>
                <strong className="text-amber-700 font-bold">{currentHoveredPoint.solarKw} kW</strong>
              </div>

              <div>
                <span className="text-slate-500">Facility Demand: </span>
                <strong className="text-slate-900 font-bold">{currentHoveredPoint.demandKw} kW</strong>
              </div>

              <div>
                <span className="text-slate-500">Net Grid Exchange: </span>
                <strong className={currentHoveredPoint.netGridKw >= 0 ? 'text-emerald-700 font-bold' : 'text-slate-700 font-bold'}>
                  {currentHoveredPoint.netGridKw >= 0 ? `+${currentHoveredPoint.netGridKw} kW (Export)` : `${currentHoveredPoint.netGridKw} kW (Import)`}
                </strong>
              </div>

              <div>
                <span className="text-slate-500">BESS SoC: </span>
                <strong className="text-slate-900 font-bold">{currentHoveredPoint.batterySoc}%</strong>
              </div>

              <div>
                <span className="text-slate-500">Irradiance: </span>
                <strong className="text-slate-800">{currentHoveredPoint.irradianceWm2} W/m²</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. "Tomorrow" Preview Showing Hourly Predicted Solar Generation and Demand */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Tomorrow Forecast Preview (Hourly Generation & Demand)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Physics-grounded solar irradiance trajectory and flexible load optimization windows for {tomorrowForecast.summary.dateLabel}.
            </p>
          </div>

          {/* Tomorrow High-Level Key Summary */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded text-amber-900 font-semibold">
              Projected Yield: {tomorrowForecast.summary.predictedTotalYieldKwh.toLocaleString()} kWh
            </span>
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 font-semibold">
              Est. Tariff Savings: ${tomorrowForecast.summary.projectedSavingsUsd.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Hourly Horizontal Strip with Opportunity Color Grading */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[700px] grid grid-cols-12 gap-1.5 text-center">
            {tomorrowForecast.hourly.filter(p => p.hour >= 6 && p.hour <= 18).map((point) => {
              const isSelected = selectedTomorrowHour === point.hour;
              const hasOpportunity = point.netSurplusKw > 80;

              return (
                <button
                  key={point.hour}
                  type="button"
                  onClick={() => setSelectedTomorrowHour(point.hour)}
                  className={`p-2 rounded-lg border text-xs transition-all ${
                    hasOpportunity
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 hover:bg-emerald-100/70'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                  } ${isSelected ? 'ring-2 ring-slate-900 shadow-xs' : ''}`}
                >
                  <div className="font-mono text-[11px] font-semibold text-slate-600 mb-1">
                    {point.time}
                  </div>
                  
                  {/* Solar bar visual indicator */}
                  <div className="h-10 w-full bg-slate-200 rounded flex flex-col justify-end overflow-hidden mb-1.5">
                    <div 
                      className={hasOpportunity ? 'bg-emerald-500' : 'bg-amber-500'} 
                      style={{ height: `${Math.min(100, (point.predictedSolarKw / 460) * 100)}%` }} 
                    />
                  </div>

                  <div className="font-mono font-bold text-xs text-slate-900">
                    {point.predictedSolarKw.toFixed(0)} <span className="text-[10px] text-slate-500">kW</span>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Load: {point.predictedDemandKw.toFixed(0)}
                  </div>

                  {point.netSurplusKw > 0 && (
                    <div className="text-[10px] font-mono font-semibold text-emerald-700 mt-0.5">
                      +{point.netSurplusKw.toFixed(0)} net
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Selected Tomorrow Hour Diagnostic Card */}
        {selectedTomorrowPoint && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  Tomorrow at {selectedTomorrowPoint.time} Forecast Breakdown
                </span>
                <span className="px-2 py-0.5 bg-slate-200 rounded text-[11px] font-mono">
                  {selectedTomorrowPoint.weatherCondition}
                </span>
              </div>
              <p className="text-slate-600">
                {selectedTomorrowPoint.netSurplusKw > 100 
                  ? '🌟 Prime Opportunity Window: High clean surplus available for full-speed EV charging and battery pre-topping.' 
                  : selectedTomorrowPoint.predictedSolarKw > 0
                  ? 'Normal daylight solar generation band matching base campus electrical load.'
                  : 'Off-sunlight interval supplied via utility grid / stored BESS.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-800 font-mono shrink-0">
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 text-[10px] block uppercase">Predicted Solar</span>
                <span className="font-bold text-amber-700 text-sm">{selectedTomorrowPoint.predictedSolarKw} kW</span>
              </div>

              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 text-[10px] block uppercase">Predicted Load</span>
                <span className="font-bold text-slate-900 text-sm">{selectedTomorrowPoint.predictedDemandKw} kW</span>
              </div>

              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 text-[10px] block uppercase">Net Surplus</span>
                <span className={`font-bold text-sm ${selectedTomorrowPoint.netSurplusKw > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {selectedTomorrowPoint.netSurplusKw > 0 ? `+${selectedTomorrowPoint.netSurplusKw} kW` : '0 kW'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Three Prominent Capability Cards: 🔮 Solar Forecast, ⚡ Opportunity Window, 🩺 PV Health Sentinel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Capability 1: 🔮 Solar Forecast */}
        <div 
          onClick={() => onNavigate('forecast')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform">
                  🔮
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    Solar Forecast
                  </h4>
                  <p className="text-[11px] text-slate-500">Core Capability 01 · Predict</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="py-3.5 space-y-2 text-xs">
              <p className="text-slate-600 text-xs leading-relaxed">
                Machine-learning generation curves with P10–P90 confidence intervals and weather satellite irradiance models.
              </p>
              
              <div className="pt-2 space-y-1.5">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Tomorrow Peak Generation:</span>
                  <strong className="font-mono text-slate-900">{tomorrowForecast.summary.peakSolarKw} kW</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Projected 24h Yield:</span>
                  <strong className="font-mono text-amber-700">{tomorrowForecast.summary.predictedTotalYieldKwh.toLocaleString()} kWh</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Forecast Accuracy:</span>
                  <strong className="font-mono text-emerald-700">97.2% Clear Sky Confidence</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:text-amber-800">
            <span>Explore Multi-Day Horizons & Confidence Bands</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Capability 2: ⚡ Opportunity Window */}
        <div 
          onClick={() => onNavigate('opportunity-windows')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform">
                  ⚡
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Opportunity Window
                  </h4>
                  <p className="text-[11px] text-slate-500">Core Capability 02 · Optimize</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="py-3.5 space-y-2 text-xs">
              <p className="text-slate-600 text-xs leading-relaxed">
                Automated scheduling and smart clean-power dispatch for EV fleets, HVAC pre-cooling, and BESS storage.
              </p>

              <div className="pt-2 space-y-1.5">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Current Optimal Window:</span>
                  <strong className="font-mono text-emerald-700">{nextOpportunity.windowStart} – {nextOpportunity.windowEnd}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Target Load Dispatch:</span>
                  <strong className="text-slate-900 truncate max-w-[160px]">{nextOpportunity.targetLoadName}</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Est. Shift Savings Today:</span>
                  <strong className="font-mono text-slate-900">${(flexibleLoads.reduce((s, l) => s + l.estimatedCostSavings, 0)).toFixed(2)} / day</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
            <span>Schedule & Dispatch Flexible Loads</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Capability 3: 🩺 PV Health Sentinel */}
        <div 
          onClick={() => onNavigate('health-sentinel')}
          className="p-5 bg-white rounded-xl border border-slate-200 hover:border-red-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-lg shadow-2xs group-hover:scale-105 transition-transform">
                  🩺
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                    PV Health Sentinel
                  </h4>
                  <p className="text-[11px] text-slate-500">Core Capability 03 · Detect</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-red-700 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="py-3.5 space-y-2 text-xs">
              <p className="text-slate-600 text-xs leading-relaxed">
                Continuous string-level telemetry comparison to detect soiling, open circuit faults, and component degradation.
              </p>

              <div className="pt-2 space-y-1.5">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Detected Discrepancies:</span>
                  <strong className="font-mono text-amber-600 font-semibold">{healthStatus.activeAnomaliesCount} Flagged</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Today's Production Deficit:</span>
                  <strong className="font-mono text-red-600">-{healthStatus.todayLossKwh} kWh (-${healthStatus.todayLossUsd})</strong>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Diagnostic Matrix:</span>
                  <strong className="font-mono text-slate-900">{healthStatus.nominalStringsCount} / {healthStatus.totalStringsCount} String Health</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-800 group-hover:text-red-700">
            <span>Inspect Array Strings & Resolve Faults</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
