import React, { useState, useMemo } from 'react';
import { 
  Sun, 
  Zap, 
  TrendingUp, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  Layers, 
  BarChart3, 
  Info, 
  Sliders, 
  CloudSun,
  Activity,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { SiteLocation, ForecastDataPoint } from '../../types';
import { generateDayForecastReport } from '../../data/energyEngine';

interface ForecastPageProps {
  activeSite: SiteLocation;
  forecast24h?: ForecastDataPoint[];
}

export const ForecastPage: React.FC<ForecastPageProps> = ({
  activeSite,
}) => {
  // Day selection: 'today' | 'tomorrow' | 'dayAfter'
  const [selectedDayKey, setSelectedDayKey] = useState<'today' | 'tomorrow' | 'dayAfter'>('tomorrow');
  
  // Chart visual options
  const [showConfidenceBands, setShowConfidenceBands] = useState<boolean>(true);
  const [chartMode, setChartMode] = useState<'combined' | 'solar-only' | 'demand-only' | 'surplus-deficit'>('combined');
  
  // Interactive Hour Scrubber / Inspector (default 12:00 PM noon)
  const [hoveredHour, setHoveredHour] = useState<number>(12);

  // Compute rich forecast report dynamically based on active site and selected forecast day
  const report = useMemo(() => {
    return generateDayForecastReport(activeSite, selectedDayKey);
  }, [activeSite, selectedDayKey]);

  const activeHourlyPoint = report.hourly.find(p => p.hour === hoveredHour) || report.hourly[12];

  // Maximum scale for SVG chart (with headroom)
  const maxScaleKw = Math.max(
    report.peakSolarKw, 
    report.peakDemandKw, 
    activeSite.installedCapacityKwp
  ) * 1.08;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Predict Mission Banner */}
      <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-900 border border-amber-500/20 rounded font-semibold text-[11px] uppercase tracking-wider">
              Core Capability 01 · Predict
            </span>
            <span className="text-slate-300">·</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[11px]">
              Demo Plant Data · Physics Irradiance & Load Model
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-medium">
              Site: <strong className="text-slate-800">{activeSite.name.split('(')[0]}</strong>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            Solar Generation & Electricity Demand Forecast
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Predictive machine-learning trajectory estimating 24-hour solar PV output, facility demand profiles, and clean solar surplus.
          </p>
        </div>

        {/* Day Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setSelectedDayKey('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              selectedDayKey === 'today'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today (Sep 23)
          </button>
          <button
            type="button"
            onClick={() => setSelectedDayKey('tomorrow')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              selectedDayKey === 'tomorrow'
                ? 'bg-white text-amber-900 shadow-2xs ring-1 ring-amber-500/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tomorrow (Sep 24)
          </button>
          <button
            type="button"
            onClick={() => setSelectedDayKey('dayAfter')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              selectedDayKey === 'dayAfter'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Friday (Sep 25)
          </button>
        </div>
      </div>

      {/* 2. Forecast Summary Intelligent Card (Requirement 4) */}
      <div className="p-4 sm:p-5 bg-linear-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 border border-amber-200/80 rounded-xl shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Automated Forecast Summary & Dispatch Insight ({report.dateLabel})
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              "{report.summaryHeadline}"
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
              {report.summaryDescription}
            </p>
          </div>

          <div className="p-3 bg-white/90 border border-amber-200/60 rounded-lg shrink-0 text-xs space-y-1 max-w-xs shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
              💡 Recommended Optimization
            </span>
            <p className="text-slate-800 font-medium text-[11px] leading-tight">
              {report.recommendedAction}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Primary Metrics Grid: Solar Forecast vs Demand Forecast vs Surplus */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Solar Generation Forecast (Requirement 1) */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Total Solar Generation
            </span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-700">
              {report.totalSolarKwh.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">kWh</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Peak Output:</span>
            <strong className="font-mono text-slate-900">
              {report.peakSolarKw} kW @ {report.peakSolarTime}
            </strong>
          </div>
        </div>

        {/* Metric 2: Solar Confidence & Reliability (Requirement 1) */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Forecast Confidence
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-700">
              {report.confidencePercent}%
            </span>
            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase">
              {report.confidenceRating}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Weather Outlook:</span>
            <span className="text-slate-700 font-medium truncate max-w-[150px]" title={report.weatherOutlook}>
              {report.weatherOutlook.split('·')[0]}
            </span>
          </div>
        </div>

        {/* Metric 3: Electricity Demand Forecast (Requirement 2) */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Expected Daily Demand
            </span>
            <Zap className="w-4 h-4 text-slate-700" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {report.totalDemandKwh.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">kWh</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Peak Demand:</span>
            <strong className="font-mono text-slate-900">
              {report.peakDemandKw} kW @ {report.peakDemandTime}
            </strong>
          </div>
        </div>

        {/* Metric 4: Net Clean Solar Surplus (Requirement 3) */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Net Clean Solar Surplus
            </span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-700">
              +{report.totalSurplusKwh.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">kWh</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Max Instant Surplus:</span>
            <strong className="font-mono text-emerald-700">+{report.peakSurplusKw} kW</strong>
          </div>
        </div>
      </div>

      {/* 4. Combined Forecast Chart (Requirement 3) */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Combined 24-Hour Solar & Demand Forecast Chart
              </h3>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
                {report.dateLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simultaneous visualization of predicted solar generation, expected building load, and clean energy surplus bands.
            </p>
          </div>

          {/* Chart Filter and Display Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setChartMode('combined')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  chartMode === 'combined'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Combined
              </button>
              <button
                type="button"
                onClick={() => setChartMode('solar-only')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  chartMode === 'solar-only'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Solar Only
              </button>
              <button
                type="button"
                onClick={() => setChartMode('demand-only')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  chartMode === 'demand-only'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Demand Only
              </button>
              <button
                type="button"
                onClick={() => setChartMode('surplus-deficit')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  chartMode === 'surplus-deficit'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Surplus / Deficit
              </button>
            </div>

            {/* Confidence Band Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-700 select-none">
              <input
                type="checkbox"
                checked={showConfidenceBands}
                onChange={(e) => setShowConfidenceBands(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
              />
              <span>P10–P90 Band</span>
            </label>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-medium text-slate-600">
            {(chartMode === 'combined' || chartMode === 'solar-only') && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-amber-500 border border-amber-600" />
                <span>Predicted Solar Generation (kW)</span>
              </div>
            )}
            {(chartMode === 'combined' || chartMode === 'demand-only') && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-slate-800" />
                <span>Expected Facility Demand (kW)</span>
              </div>
            )}
            {(chartMode === 'combined' || chartMode === 'surplus-deficit') && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-emerald-500/40 border border-emerald-600" />
                <span className="text-emerald-800">Clean Solar Surplus (Solar &gt; Demand)</span>
              </div>
            )}
            {chartMode === 'surplus-deficit' && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-slate-400/30 border border-slate-500" />
                <span className="text-slate-600">Grid Deficit (Demand &gt; Solar)</span>
              </div>
            )}
            {showConfidenceBands && (
              <div className="flex items-center gap-2 text-amber-800">
                <span className="w-3 h-2 rounded-xs bg-amber-400/20 border border-amber-300" />
                <span>Confidence Envelope (P10–P90)</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500">
            Hover or click on any hour to inspect exact kW metrics
          </div>
        </div>

        {/* Interactive SVG Combined Graph */}
        <div className="relative w-full h-72 sm:h-80 select-none">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 880 260" preserveAspectRatio="none">
            <defs>
              {/* Solar Gradient Fill */}
              <linearGradient id="predSolarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
              </linearGradient>

              {/* Surplus Clean Energy Gradient */}
              <linearGradient id="predSurplusGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
              </linearGradient>

              {/* Deficit Gradient */}
              <linearGradient id="predDeficitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#64748b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#64748b" stopOpacity="0.05" />
              </linearGradient>

              {/* Confidence Band Gradient */}
              <linearGradient id="predConfidenceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.05" />
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

            {/* Base Zero Axis */}
            <line x1="45" y1="230" x2="860" y2="230" stroke="#cbd5e1" strokeWidth="1.2" />

            {/* Confidence Envelope (P10 to P90 polygon) */}
            {showConfidenceBands && (chartMode === 'combined' || chartMode === 'solar-only') && (() => {
              const upperPoints = report.hourly.map((p, i) => {
                const x = 50 + (i / 23) * 800;
                const y = 230 - (p.upperConfidenceKw / 520) * 210;
                return `${x},${y}`;
              });
              const lowerPoints = [...report.hourly].reverse().map((p, i) => {
                const origIndex = 23 - i;
                const x = 50 + (origIndex / 23) * 800;
                const y = 230 - (p.lowerConfidenceKw / 520) * 210;
                return `${x},${y}`;
              });
              const polyString = [...upperPoints, ...lowerPoints].join(' ');
              return <polygon points={polyString} fill="url(#predConfidenceGrad)" />;
            })()}

            {/* Solar Surplus Area Fill (Where Solar > Demand) */}
            {(chartMode === 'combined' || chartMode === 'surplus-deficit') && (() => {
              // Construct surplus polygon
              const surplusPoints: string[] = [];
              report.hourly.forEach((p, i) => {
                const x = 50 + (i / 23) * 800;
                if (p.solarKw >= p.demandKw) {
                  const ySolar = 230 - (p.solarKw / 520) * 210;
                  surplusPoints.push(`${x},${ySolar}`);
                }
              });
              // Reverse along demand line for surplus section
              [...report.hourly].reverse().forEach((p, i) => {
                const origIndex = 23 - i;
                const x = 50 + (origIndex / 23) * 800;
                if (p.solarKw >= p.demandKw) {
                  const yDemand = 230 - (p.demandKw / 520) * 210;
                  surplusPoints.push(`${x},${yDemand}`);
                }
              });

              if (surplusPoints.length > 2) {
                return <polygon points={surplusPoints.join(' ')} fill="url(#predSurplusGrad)" />;
              }
              return null;
            })()}

            {/* Solar Generation Curve & Area */}
            {(chartMode === 'combined' || chartMode === 'solar-only') && (() => {
              const solarAreaPath = report.hourly.reduce((acc, p, i) => {
                const x = 50 + (i / 23) * 800;
                const y = 230 - (p.solarKw / 520) * 210;
                return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }, '') + ` L 850 230 L 50 230 Z`;

              const solarLinePath = report.hourly.reduce((acc, p, i) => {
                const x = 50 + (i / 23) * 800;
                const y = 230 - (p.solarKw / 520) * 210;
                return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }, '');

              return (
                <g>
                  {chartMode === 'solar-only' && <path d={solarAreaPath} fill="url(#predSolarGrad)" />}
                  <path d={solarLinePath} fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              );
            })()}

            {/* Expected Facility Demand Curve Line */}
            {(chartMode === 'combined' || chartMode === 'demand-only' || chartMode === 'surplus-deficit') && (() => {
              const demandLinePath = report.hourly.reduce((acc, p, i) => {
                const x = 50 + (i / 23) * 800;
                const y = 230 - (p.demandKw / 520) * 210;
                return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }, '');

              return (
                <path d={demandLinePath} fill="none" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 2" />
              );
            })()}

            {/* Interactive Vertical Hover Scrubber Columns */}
            {report.hourly.map((p, i) => {
              const x = 50 + (i / 23) * 800;
              const isHovered = hoveredHour === p.hour;
              const ySolar = 230 - (p.solarKw / 520) * 210;
              const yDemand = 230 - (p.demandKw / 520) * 210;

              return (
                <g 
                  key={p.time} 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredHour(p.hour)}
                  onClick={() => setHoveredHour(p.hour)}
                >
                  <rect x={x - 16} y="15" width="32" height="235" fill="transparent" />

                  {isHovered && (
                    <g>
                      <line x1={x} y1="15" x2={x} y2="230" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                      <circle cx={x} cy={ySolar} r="5" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
                      <circle cx={x} cy={yDemand} r="4.5" fill="#1e293b" stroke="#ffffff" strokeWidth="2" />
                    </g>
                  )}
                </g>
              );
            })}

            {/* Time labels along the bottom X-axis */}
            {report.hourly.map((p, i) => {
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

        {/* 5. Detailed Hour Scrubber Tooltip / Readout Bar (Requirement 1, 2, 3, 5) */}
        {activeHourlyPoint && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <div>
                <span className="font-bold text-slate-900 text-sm">
                  Inspecting Hour: <span className="font-mono text-amber-700">{activeHourlyPoint.time}</span> ({report.dateLabel})
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Condition: {activeHourlyPoint.weatherCondition} · Irradiance: {activeHourlyPoint.irradianceWm2} W/m²
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 font-mono text-slate-800">
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 text-[10px] block uppercase">Predicted Solar</span>
                <span className="font-bold text-amber-700 text-sm">
                  {activeHourlyPoint.solarKw} kW
                </span>
                <span className="text-[10px] text-slate-400 block font-normal">
                  ({activeHourlyPoint.lowerConfidenceKw} – {activeHourlyPoint.upperConfidenceKw} kW)
                </span>
              </div>

              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 text-[10px] block uppercase">Facility Demand</span>
                <span className="font-bold text-slate-900 text-sm">
                  {activeHourlyPoint.demandKw} kW
                </span>
                <span className="text-[10px] text-slate-400 block font-normal">
                  Base + Dynamic HVAC
                </span>
              </div>

              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-500 text-[10px] block uppercase">Net Energy Flow</span>
                <span className={`font-bold text-sm ${activeHourlyPoint.netSurplusKw > 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {activeHourlyPoint.netSurplusKw > 0 ? `+${activeHourlyPoint.netSurplusKw} kW Surplus` : `-${activeHourlyPoint.netDeficitKw} kW Deficit`}
                </span>
                <span className="text-[10px] text-slate-400 block font-normal">
                  {activeHourlyPoint.netSurplusKw > 0 ? 'Clean Energy Export' : 'Grid Utility Draw'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Hourly Forecast Grid & Dispatch Interval Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Hourly Forecast Telemetry Matrix ({report.dateLabel})
            </h3>
            <p className="text-[11px] text-slate-500">
              Click on any row to highlight and inspect that interval.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span>24 Intervals</span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-semibold">
              {report.hourly.filter(p => p.netSurplusKw > 0).length} Surplus Hours
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Time Interval</th>
                <th className="px-4 py-2.5 text-right">Predicted Solar (kW)</th>
                <th className="px-4 py-2.5 text-right">P10 – P90 Interval</th>
                <th className="px-4 py-2.5 text-right">Expected Demand (kW)</th>
                <th className="px-4 py-2.5 text-right">Net Clean Surplus (kW)</th>
                <th className="px-4 py-2.5 text-right">Irradiance (W/m²)</th>
                <th className="px-4 py-2.5 text-center">Opportunity Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {report.hourly.map((point) => {
                const isSelected = hoveredHour === point.hour;
                const isSurplus = point.netSurplusKw > 0;
                const isPrime = point.netSurplusKw > 120;

                return (
                  <tr 
                    key={point.time}
                    onClick={() => setHoveredHour(point.hour)}
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-amber-50/80 font-semibold' 
                        : isPrime
                        ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-2 font-medium text-slate-900 flex items-center gap-2">
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />}
                      <span>{point.time}</span>
                    </td>
                    <td className="px-4 py-2 text-right text-amber-700 font-bold">
                      {point.solarKw > 0 ? `${point.solarKw.toFixed(1)} kW` : '—'}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-500 text-[11px]">
                      {point.solarKw > 0 ? `${point.lowerConfidenceKw} – ${point.upperConfidenceKw} kW` : '—'}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-900">
                      {point.demandKw.toFixed(1)} kW
                    </td>
                    <td className="px-4 py-2 text-right">
                      {isSurplus ? (
                        <span className="text-emerald-700 font-bold">+{point.netSurplusKw.toFixed(1)} kW</span>
                      ) : (
                        <span className="text-slate-400">-{point.netDeficitKw.toFixed(1)} kW (Grid)</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-600">
                      {point.irradianceWm2 > 0 ? `${point.irradianceWm2}` : '0'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {isPrime ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-sans text-[10px] font-bold">
                          🌟 Prime Surplus
                        </span>
                      ) : isSurplus ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-sans text-[10px] font-medium">
                          Clean Window
                        </span>
                      ) : point.solarKw > 0 ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded font-sans text-[10px]">
                          Solar Fed
                        </span>
                      ) : (
                        <span className="text-slate-400 font-sans text-[10px]">
                          Night / Standby
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
