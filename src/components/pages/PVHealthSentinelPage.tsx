import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Zap, 
  DollarSign, 
  Sun,
  CloudRain,
  Thermometer, 
  Info,
  Wrench,
  Sliders,
  Layers,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Sparkles,
  HelpCircle,
  Eye,
  Check,
  Search
} from 'lucide-react';
import { 
  SiteLocation, 
  PVAnomaly, 
  PVStringStatus, 
  PVDemoScenario, 
  HourlyExpectedVsActualPoint,
  DayPerformanceRecord
} from '../../types';
import { generatePVHealthSentinelReport } from '../../data/energyEngine';

interface PVHealthSentinelPageProps {
  activeSite: SiteLocation;
  anomalies: PVAnomaly[];
  stringStatuses: PVStringStatus[];
  onResolveAnomaly: (id: string) => void;
}

export const PVHealthSentinelPage: React.FC<PVHealthSentinelPageProps> = ({
  activeSite,
  anomalies,
  stringStatuses,
  onResolveAnomaly,
}) => {
  // Demo Scenario Selector (Requirement 7)
  const [selectedScenario, setSelectedScenario] = useState<PVDemoScenario>('persistent-underperformance');
  
  // Interactive Chart View Mode: 'hourly' | 'daily7d'
  const [chartViewMode, setChartViewMode] = useState<'hourly' | 'daily7d'>('hourly');
  
  // Interactive selected hour / day for inspector
  const [selectedHour, setSelectedHour] = useState<number>(13);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6); // Default today (Day 7)
  
  // Selected String for deep hardware inspection
  const [selectedStringId, setSelectedStringId] = useState<string | null>('str-9'); // String W-09

  // Generate dynamic report based on selected scenario
  const report = useMemo(() => {
    return generatePVHealthSentinelReport(activeSite, selectedScenario);
  }, [activeSite, selectedScenario]);

  // Selected hour data point
  const activeHourlyPoint: HourlyExpectedVsActualPoint = 
    report.hourly24h.find(h => h.hour === selectedHour) || report.hourly24h[13];

  // Selected day data point
  const activeDayRecord: DayPerformanceRecord = 
    report.history7d[selectedDayIndex] || report.history7d[6];

  // Selected string
  const activeString = stringStatuses.find(s => s.id === selectedStringId) || stringStatuses[8];

  // Max value for hourly chart scaling
  const maxHourlyExpected = Math.max(...report.hourly24h.map(h => h.expectedKw), 1);
  const maxDailyExpected = Math.max(...report.history7d.map(d => d.expectedKwh), 1);

  return (
    <div className="space-y-6">
      {/* 1. Top Mission Header & Core Capability: DETECT */}
      <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-900 border border-amber-500/20 rounded font-semibold text-[11px] uppercase tracking-wider">
              Core Capability 03 · Detect
            </span>
            <span className="text-slate-300">·</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[11px]">
              PV Health Sentinel · Telemetry Diagnostics
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-medium">
              Site: <strong className="text-slate-800">{activeSite.name.split('(')[0]}</strong>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            Expected vs. Actual Generation Anomaly Sentinel
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Detects persistent PV underperformance across multiple observation cycles by cross-referencing expected physics models with live inverter telemetry and irradiance sensors.
          </p>
        </div>

        {/* Demo Scenario Switcher (Requirement 7) */}
        <div className="p-1.5 bg-slate-100 rounded-xl border border-slate-200 shrink-0 self-start lg:self-auto">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-0.5 mb-1 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-slate-600" />
            <span>Demo Test Scenarios (Live Switcher)</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-1">
            <button
              type="button"
              onClick={() => setSelectedScenario('nominal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-left sm:text-center ${
                selectedScenario === 'nominal'
                  ? 'bg-white text-emerald-900 shadow-xs border border-emerald-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              1. Normal Performance
            </button>

            <button
              type="button"
              onClick={() => setSelectedScenario('weather-reduced')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-left sm:text-center ${
                selectedScenario === 'weather-reduced'
                  ? 'bg-white text-amber-900 shadow-xs border border-amber-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              2. Weather Reduction
            </button>

            <button
              type="button"
              onClick={() => setSelectedScenario('persistent-underperformance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-left sm:text-center ${
                selectedScenario === 'persistent-underperformance'
                  ? 'bg-white text-red-900 shadow-xs border border-red-300 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              3. Persistent Underperformance
            </button>
          </div>
        </div>
      </div>

      {/* 2. PV Performance Overview Metrics (Requirement 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Expected Generation */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Expected Yield (Today)</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {report.todayExpectedKwh.toLocaleString()}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">kWh</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Theoretical Clear-Sky Yield
          </p>
        </div>

        {/* Actual Generation */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Actual Yield (Today)</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
              report.todayDeviationPercent < -15 ? 'text-red-600' : report.todayDeviationPercent < -5 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {report.todayActualKwh.toLocaleString()}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">kWh</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Delivered Inverter AC Energy
          </p>
        </div>

        {/* Performance Deviation % */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Performance Deviation</span>
            {report.todayDeviationPercent < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
              report.todayDeviationPercent < -15 ? 'text-red-600' : report.todayDeviationPercent < -3 ? 'text-amber-600' : 'text-emerald-700'
            }`}>
              {report.todayDeviationPercent > 0 ? `+${report.todayDeviationPercent}%` : `${report.todayDeviationPercent}%`}
            </span>
            <span className="text-xs font-mono text-slate-500">
              ({report.todayDeviationKwh > 0 ? `+${report.todayDeviationKwh}` : report.todayDeviationKwh} kWh)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Variance vs baseline model
          </p>
        </div>

        {/* Plant Health Status */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Plant Health Status</span>
            <Activity className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-3 h-3 rounded-full shrink-0 ${
              report.healthBadgeSeverity === 'warning'
                ? 'bg-red-500 animate-pulse'
                : report.healthBadgeSeverity === 'advisory'
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`} />
            <span className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {report.plantHealthStatus.split('/')[0]}
            </span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Health Ratio: <strong className="text-slate-800">{report.healthScorePercent}%</strong>
          </p>
        </div>

        {/* 7-Day Performance Trend Indicator */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">7-Day Health Trend</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          {/* Mini 7-day spark bars */}
          <div className="flex items-end gap-1.5 h-8 mt-1">
            {report.history7d.map((d, i) => {
              const heightPct = Math.max(20, Math.min(100, (d.actualKwh / d.expectedKwh) * 100));
              const barColor = d.deviationPercent < -15 ? 'bg-red-500' : d.deviationPercent < -5 ? 'bg-amber-400' : 'bg-emerald-500';
              return (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.actualKwh} kWh (${d.deviationPercent}%)`}
                  className={`flex-1 rounded-xs transition-all ${barColor} ${
                    selectedDayIndex === i ? 'ring-2 ring-slate-900' : 'opacity-85 hover:opacity-100'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Mean Deficit:</span>
            <strong className="font-mono text-slate-800">{report.meanMultiDayDeviationPercent}%</strong>
          </p>
        </div>
      </div>

      {/* 3. Section 3: Persistence Detection Evaluator (Requirement 3) */}
      <div className={`p-5 sm:p-6 rounded-xl border transition-all ${
        report.isPersistentUnderperformance
          ? 'bg-red-50/60 border-red-300 shadow-2xs'
          : selectedScenario === 'weather-reduced'
          ? 'bg-amber-50/60 border-amber-300 shadow-2xs'
          : 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              {report.isPersistentUnderperformance ? (
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              ) : selectedScenario === 'weather-reduced' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Persistence Evaluation: {report.persistenceHeadline}
              </h3>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed max-w-4xl">
              {report.persistenceSummary}
            </p>

            {/* Persistence Streak Sequence Indicator (Matching Requirement 3 Example) */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">Multi-Period Tracking:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {report.history7d.slice(0, 5).map((day, idx) => (
                  <span
                    key={day.date}
                    className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold border ${
                      day.deviationPercent < -15
                        ? 'bg-red-100 text-red-900 border-red-300 font-bold'
                        : day.deviationPercent < -5
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    Day {idx + 1}: {day.deviationPercent > 0 ? `+${day.deviationPercent}%` : `${day.deviationPercent}%`}
                  </span>
                ))}
              </div>

              <span className="text-slate-400 text-xs mx-1">→</span>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                report.isPersistentUnderperformance
                  ? 'bg-red-600 text-white shadow-xs'
                  : selectedScenario === 'weather-reduced'
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {report.isPersistentUnderperformance 
                  ? 'Persistent Underperformance Confirmed' 
                  : selectedScenario === 'weather-reduced' 
                  ? 'Transient Weather Event (No Fault)' 
                  : 'Nominal Clear-Sky Yield'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-white/90 rounded-lg border border-slate-200 shrink-0 text-xs space-y-1 font-mono">
            <div className="text-[10px] uppercase font-bold text-slate-500">Persistence Decision Engine</div>
            <div className="text-slate-800">Observation Window: <strong>7 Consecutive Days</strong></div>
            <div className="text-slate-800">Tolerance Band: <strong>±3.0% clear-sky</strong></div>
            <div className="text-slate-800">Streak Length: <strong>{report.consecutiveDeficitDays} deficit periods</strong></div>
          </div>
        </div>
      </div>

      {/* 4. Section 2: Expected vs Actual Interactive Chart (Requirement 2) */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                2. Expected vs. Actual Generation Trajectory
              </h3>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[10px]">
                {chartViewMode === 'hourly' ? "Today's 24-Hour Telemetry" : '7-Day Historical Daily Yield'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare theoretical physical output against real-time inverter generation and click any point to inspect exact deviations.
            </p>
          </div>

          {/* Toggle between 24-Hour & 7-Day Chart */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setChartViewMode('hourly')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                chartViewMode === 'hourly'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              24-Hour Hourly Trajectory
            </button>
            <button
              type="button"
              onClick={() => setChartViewMode('daily7d')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                chartViewMode === 'daily7d'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7-Day Daily Yield Comparison
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-blue-500 rounded-full" />
              <span className="text-slate-700 font-semibold">Expected Generation (Baseline Model)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`w-3.5 h-1 rounded-full ${
                report.isPersistentUnderperformance ? 'bg-red-500' : 'bg-emerald-500'
              }`} />
              <span className="text-slate-700 font-semibold">Actual Generation (Telemetry)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-100 border border-red-300 rounded-xs" />
              <span className="text-slate-600">Generation Deficit (Loss)</span>
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            {chartViewMode === 'hourly' ? `Selected Hour: ${activeHourlyPoint.time}` : `Selected Day: ${activeDayRecord.date}`}
          </span>
        </div>

        {/* Chart Viewport */}
        {chartViewMode === 'hourly' ? (
          /* 24-Hour Hourly Dual Bar/Area Visualizer */
          <div className="space-y-2">
            <div className="grid grid-cols-24 gap-1 h-44 bg-slate-50 p-2 rounded-xl border border-slate-200 items-end">
              {report.hourly24h.map((point) => {
                const isSelected = selectedHour === point.hour;
                const expHeight = Math.max(4, (point.expectedKw / maxHourlyExpected) * 100);
                const actHeight = Math.max(4, (point.actualKw / maxHourlyExpected) * 100);
                const isDeficit = point.deviationKw < -5;

                return (
                  <button
                    key={point.hour}
                    type="button"
                    onClick={() => setSelectedHour(point.hour)}
                    className={`col-span-1 h-full flex flex-col justify-end items-center gap-0.5 group relative transition-all rounded-xs ${
                      isSelected ? 'bg-slate-200/80 ring-2 ring-slate-900' : 'hover:bg-slate-200/40'
                    }`}
                  >
                    {/* Dual columns for Expected vs Actual */}
                    <div className="w-full flex items-end justify-center gap-0.5 h-36 px-0.5">
                      {/* Expected Column (Blue) */}
                      <div
                        className="w-1/2 bg-blue-400/80 rounded-t-xs transition-all group-hover:bg-blue-500"
                        style={{ height: `${expHeight}%` }}
                        title={`Expected: ${point.expectedKw} kW`}
                      />

                      {/* Actual Column (Green / Red) */}
                      <div
                        className={`w-1/2 rounded-t-xs transition-all ${
                          isDeficit ? 'bg-red-500 group-hover:bg-red-600' : 'bg-emerald-500 group-hover:bg-emerald-600'
                        }`}
                        style={{ height: `${actHeight}%` }}
                        title={`Actual: ${point.actualKw} kW (Dev: ${point.deviationPercent}%)`}
                      />
                    </div>

                    <span className="text-[8px] font-mono font-bold text-slate-500 leading-none pt-1">
                      {point.hour}h
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Hourly Inspector Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-amber-600 shadow-2xs">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-sm">
                    Hour Telemetry Inspector: <span className="font-mono text-blue-700">{activeHourlyPoint.time}</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Irradiance: <strong>{activeHourlyPoint.irradianceWm2} W/m²</strong> · Ambient Temp: <strong>{activeHourlyPoint.ambientTempC}°C</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono sm:flex sm:items-center sm:gap-4">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase">Expected Solar</span>
                  <span className="font-bold text-blue-700 text-sm">{activeHourlyPoint.expectedKw} kW</span>
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase">Actual Delivered</span>
                  <span className={`font-bold text-sm ${activeHourlyPoint.deviationPercent < -15 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {activeHourlyPoint.actualKw} kW
                  </span>
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase">Deviation</span>
                  <span className={`font-bold text-sm ${activeHourlyPoint.deviationPercent < -15 ? 'text-red-600' : activeHourlyPoint.deviationPercent < -3 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {activeHourlyPoint.deviationPercent > 0 ? `+${activeHourlyPoint.deviationPercent}%` : `${activeHourlyPoint.deviationPercent}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 7-Day History Chart */
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-2 h-44 bg-slate-50 p-3 rounded-xl border border-slate-200 items-end">
              {report.history7d.map((day, idx) => {
                const isSelected = selectedDayIndex === idx;
                const expHeight = Math.max(10, (day.expectedKwh / maxDailyExpected) * 100);
                const actHeight = Math.max(10, (day.actualKwh / maxDailyExpected) * 100);
                const isUnderperforming = day.deviationPercent < -10;

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`col-span-1 h-full flex flex-col justify-end items-center gap-1 group rounded-lg p-1 transition-all ${
                      isSelected ? 'bg-slate-200/90 ring-2 ring-slate-900' : 'hover:bg-slate-200/50'
                    }`}
                  >
                    <div className="w-full flex items-end justify-center gap-1 h-32 px-1">
                      {/* Expected */}
                      <div
                        className="w-1/2 bg-blue-400/80 rounded-t-xs transition-all group-hover:bg-blue-500"
                        style={{ height: `${expHeight}%` }}
                        title={`Expected: ${day.expectedKwh} kWh`}
                      />

                      {/* Actual */}
                      <div
                        className={`w-1/2 rounded-t-xs transition-all ${
                          isUnderperforming ? 'bg-red-500 group-hover:bg-red-600' : 'bg-emerald-500 group-hover:bg-emerald-600'
                        }`}
                        style={{ height: `${actHeight}%` }}
                        title={`Actual: ${day.actualKwh} kWh`}
                      />
                    </div>

                    <div className="text-center font-mono">
                      <span className="text-[10px] font-bold text-slate-800 block leading-tight">{day.dayLabel}</span>
                      <span className={`text-[9px] font-bold ${day.deviationPercent < -15 ? 'text-red-600' : 'text-slate-500'}`}>
                        {day.deviationPercent > 0 ? `+${day.deviationPercent}%` : `${day.deviationPercent}%`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 7-Day Selected Inspector */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm">
                  Daily Inspector: <span className="font-mono text-slate-900">{activeDayRecord.date}</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Weather: <strong>{activeDayRecord.weatherCondition}</strong> · Irradiance Peak: <strong>{activeDayRecord.irradianceWm2} W/m²</strong>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono sm:flex sm:items-center sm:gap-4">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase">Expected Yield</span>
                  <span className="font-bold text-blue-700 text-sm">{activeDayRecord.expectedKwh} kWh</span>
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase">Actual Yield</span>
                  <span className={`font-bold text-sm ${activeDayRecord.deviationPercent < -15 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {activeDayRecord.actualKwh} kWh
                  </span>
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block uppercase">Daily Deficit</span>
                  <span className={`font-bold text-sm ${activeDayRecord.deviationPercent < -15 ? 'text-red-600' : 'text-slate-700'}`}>
                    {activeDayRecord.deviationPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Section 5: PV Performance Alert Card (Requirement 5) */}
      <div className={`p-5 sm:p-6 rounded-xl border transition-all ${
        report.alert.severity === 'warning' || report.alert.severity === 'critical'
          ? 'bg-red-50/70 border-red-300 shadow-sm'
          : report.alert.severity === 'advisory'
          ? 'bg-amber-50/70 border-amber-300 shadow-sm'
          : 'bg-emerald-50/70 border-emerald-300 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                report.alert.severity === 'warning'
                  ? 'bg-red-600 text-white shadow-xs'
                  : report.alert.severity === 'advisory'
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {report.alert.severity === 'warning' ? 'Critical PV Alert' : report.alert.severity === 'advisory' ? 'System Advisory' : 'Nominal Health'}
              </span>

              <h4 className="text-base sm:text-lg font-bold text-slate-900">
                {report.alert.headline}
              </h4>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {report.alert.body}
            </p>

            {/* Alert Card Breakdown Table (Requirement 5) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-mono pt-1">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Detection Date/Time</span>
                <strong className="text-slate-900">{report.alert.detectionDateTime}</strong>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Expected vs Actual</span>
                <strong className="text-slate-900">{report.todayExpectedKwh} vs {report.todayActualKwh} kWh</strong>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block uppercase font-sans">Persistent Deviation</span>
                <strong className={report.todayDeviationPercent < -15 ? 'text-red-600' : 'text-emerald-700'}>
                  {report.alert.deviationLabel}
                </strong>
              </div>
            </div>

            {/* Recommended Investigation Box (Requirement 5) */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex items-start gap-2.5 shadow-2xs">
              <Wrench className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold block mb-0.5">Recommended Investigation:</strong>
                <p className="text-slate-700 leading-relaxed">{report.alert.recommendedInvestigation}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Section 4: Probable Contributors Matrix (Requirement 4) */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>4. Root-Cause Telemetry & Probable Contributors</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[10px]">
                Physics & Meteorological Sensor Cross-Check
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluates environmental sensor data to determine plausible root causes without making unfounded hardware failure claims.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {report.contributors.map((c) => {
            const isHigh = c.probability === 'High';
            const isMod = c.probability === 'Moderate';

            return (
              <div
                key={c.id}
                className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                  isHigh
                    ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-400/20 shadow-2xs'
                    : isMod
                    ? 'bg-slate-50 border-slate-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{c.name}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    isHigh
                      ? 'bg-amber-500 text-white'
                      : isMod
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.probability} Probability
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {c.description}
                </p>

                <div className="p-2 bg-white rounded-md border border-slate-200 text-[11px] text-slate-700 font-mono">
                  <span className="text-slate-400 uppercase text-[9px] block">Sensor Evidence:</span>
                  {c.evidence}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Section 6: 7-Day Performance History Table (Requirement 6) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              6. 7-Day Performance Observation Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical multi-period record used by SolarWise to verify persistence criteria.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Observation Period: Sep 17 – Sep 23, 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Expected Yield</th>
                <th className="py-3 px-4">Actual Yield</th>
                <th className="py-3 px-4">Deviation</th>
                <th className="py-3 px-4">Solar Irradiance (GHI)</th>
                <th className="py-3 px-4">Weather Context</th>
                <th className="py-3 px-4">Sentinel Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {report.history7d.map((row, idx) => {
                const isDeficit = row.deviationPercent < -15;
                const isSelected = selectedDayIndex === idx;

                return (
                  <tr
                    key={row.date}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-slate-100/80 font-bold' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {row.date}
                    </td>

                    <td className="py-3 px-4 text-blue-700 whitespace-nowrap">
                      {row.expectedKwh.toLocaleString()} kWh
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {row.actualKwh.toLocaleString()} kWh
                    </td>

                    <td className={`py-3 px-4 font-bold whitespace-nowrap ${
                      isDeficit ? 'text-red-600' : row.deviationPercent < -5 ? 'text-amber-600' : 'text-emerald-700'
                    }`}>
                      {row.deviationPercent > 0 ? `+${row.deviationPercent}%` : `${row.deviationPercent}%`}
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {row.irradianceWm2} W/m²
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-sans text-xs whitespace-nowrap">
                      {row.weatherCondition}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-sans uppercase ${
                        row.status === 'Persistent Underperformance'
                          ? 'bg-red-100 text-red-900 border border-red-300'
                          : row.status === 'Weather Reduced'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          row.status === 'Persistent Underperformance' ? 'bg-red-600' : row.status === 'Weather Reduced' ? 'bg-amber-500' : 'bg-emerald-600'
                        }`} />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. String Array Diagnostic Matrix (Deep Engineering Inspection) */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Array & String Hardware Inspection Matrix</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[10px]">
                16 DC Strings Across 3 Inverter Clusters
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click individual strings to cross-reference current, open circuit voltage, and module performance ratios.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Nominal (&gt;95%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600 font-medium">Soiling / Shade</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-slate-600 font-medium">Open Circuit / Fault</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
          {stringStatuses.map((str) => {
            const isSelected = selectedStringId === str.id;
            return (
              <button
                key={str.id}
                type="button"
                onClick={() => setSelectedStringId(str.id)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  str.health === 'fault'
                    ? 'bg-red-50/70 border-red-300 text-red-950'
                    : str.health === 'degraded'
                    ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
                } ${isSelected ? 'ring-2 ring-slate-900 shadow-xs' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold">{str.name}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    str.health === 'fault' ? 'bg-red-600' : str.health === 'degraded' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                </div>
                <div className="mt-1.5 font-mono tabular-nums text-xs">
                  <strong>{str.powerKw.toFixed(2)}</strong> <span className="text-[10px] text-slate-500">kW</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                  {str.efficiencyPercent.toFixed(0)}% eff.
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected String Diagnostic Readout */}
        {activeString && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-semibold text-slate-900 font-sans">
                Inspecting: <strong className="font-mono text-amber-700">{activeString.name}</strong> ({activeString.inverterId})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-700">
              <div>DC Voltage: <strong className="text-slate-900">{activeString.voltageV} V</strong></div>
              <div>String Current: <strong className="text-slate-900">{activeString.currentA} A</strong></div>
              <div>Delivered Output: <strong className="text-slate-900">{activeString.powerKw} kW</strong></div>
              <div>Expected Baseline: <span className="text-slate-500">{activeString.expectedPowerKw} kW</span></div>
              <div>Status: <strong className={activeString.health === 'fault' ? 'text-red-600' : activeString.health === 'degraded' ? 'text-amber-600' : 'text-emerald-600'}>{activeString.health.toUpperCase()}</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
