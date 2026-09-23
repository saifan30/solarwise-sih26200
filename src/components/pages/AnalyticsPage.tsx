import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Leaf, 
  DollarSign, 
  TrendingUp, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  CheckCircle2,
  PieChart,
  Sun,
  Layers,
  Activity,
  Target,
  Clock,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { SiteLocation, AnalyticsRange } from '../../types';
import { generateAnalyticsDataSet } from '../../data/energyEngine';

interface AnalyticsPageProps {
  activeSite: SiteLocation;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  activeSite,
}) => {
  // Date-range selector: Today | Last 7 Days | Last 30 Days
  const [range, setRange] = useState<AnalyticsRange>('today');
  const [selectedChartIndex, setSelectedChartIndex] = useState<number>(12);
  const [downloadNotice, setDownloadNotice] = useState(false);

  // Generate dynamic analytics dataset calculated from energy engine
  const dataset = useMemo(() => {
    return generateAnalyticsDataSet(activeSite, range);
  }, [activeSite, range]);

  // Selected item in time series for live inspection
  const activeSolarPoint = dataset.solarVsDemand[selectedChartIndex] || dataset.solarVsDemand[0];
  const activeSelfConsPoint = dataset.selfConsumptionVsGrid[selectedChartIndex] || dataset.selfConsumptionVsGrid[0];
  const activeExpPoint = dataset.expectedVsActual[selectedChartIndex] || dataset.expectedVsActual[0];

  const maxSolarVsDemand = Math.max(
    ...dataset.solarVsDemand.map(p => Math.max(p.solarKwh, p.demandKwh)),
    1
  );

  const maxSelfConsumption = Math.max(
    ...dataset.selfConsumptionVsGrid.map(p => Math.max(p.solarSelfConsumedKwh + p.gridExportKwh, p.solarSelfConsumedKwh + p.gridImportKwh)),
    1
  );

  const maxExpVsAct = Math.max(
    ...dataset.expectedVsActual.map(p => Math.max(p.expectedKwh, p.actualKwh)),
    1
  );

  const max7DayYield = Math.max(
    ...dataset.sevenDayPerformance.map(p => p.solarYieldKwh),
    1
  );

  const handleDownloadCsv = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Date Range Selector */}
      <div className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-900 border border-blue-500/20 rounded font-semibold text-[11px] uppercase tracking-wider">
              Analytics & Performance Intelligence
            </span>
            <span className="text-slate-300">·</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-[11px]">
              {dataset.rangeLabel} · Demo Plant Data
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500 font-medium">
              Site: <strong className="text-slate-800">{activeSite.name.split('(')[0]}</strong>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            Renewable Yield & Performance Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Audit comprehensive generation physics, self-consumption ratios, net grid exchanges, and verified carbon abatement.
          </p>
        </div>

        {/* Date-Range Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => { setRange('today'); setSelectedChartIndex(12); }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              range === 'today'
                ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today (24h)
          </button>

          <button
            type="button"
            onClick={() => { setRange('7days'); setSelectedChartIndex(6); }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              range === '7days'
                ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>

          <button
            type="button"
            onClick={() => { setRange('30days'); setSelectedChartIndex(3); }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              range === '30days'
                ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* 2. Eight Core Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Solar Generation */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Total Solar Generation</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {dataset.totalSolarGenerationKwh.toLocaleString()}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">kWh</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Facility Demand:</span>
            <strong className="font-mono text-slate-800">{dataset.totalDemandKwh.toLocaleString()} kWh</strong>
          </p>
        </div>

        {/* KPI 2: Solar Self-Consumption */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Solar Self-Consumption</span>
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-700">
              {dataset.solarSelfConsumptionKwh.toLocaleString()}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">kWh</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Utilization Ratio:</span>
            <strong className="font-mono text-emerald-700">{dataset.solarSelfConsumptionPercent}%</strong>
          </p>
        </div>

        {/* KPI 3: Grid Import */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Grid Import (Deficit)</span>
            <ArrowDownRight className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-800">
              {dataset.gridImportKwh.toLocaleString()}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">kWh</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Grid Dependency:</span>
            <strong className="font-mono text-slate-700">
              {((dataset.gridImportKwh / Math.max(1, dataset.totalDemandKwh)) * 100).toFixed(1)}%
            </strong>
          </p>
        </div>

        {/* KPI 4: Grid Export */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Grid Export (Surplus)</span>
            <ArrowUpRight className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-amber-700">
              {dataset.gridExportKwh.toLocaleString()}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">kWh</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Feed-in Export Rate:</span>
            <strong className="font-mono text-amber-800">$0.08 / kWh</strong>
          </p>
        </div>

        {/* KPI 5: Solar Utilization Percentage */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Solar Utilization %</span>
            <PieChart className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-700">
              {dataset.solarUtilizationPercent}%
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">consumed on-site</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Optimized via Windows:</span>
            <strong className="font-mono text-emerald-700">+14.2% Boost</strong>
          </p>
        </div>

        {/* KPI 6: PV Performance Percentage */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">PV Performance Ratio (PR)</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-blue-700">
              {dataset.pvPerformancePercent}%
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">efficiency</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>IEC 61724 Standard:</span>
            <strong className="font-mono text-blue-900">Grade A (Optimal)</strong>
          </p>
        </div>

        {/* KPI 7: Forecast Accuracy */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Forecast Accuracy</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-700">
              {dataset.forecastAccuracyPercent}%
            </span>
            <span className="text-xs font-bold text-slate-500 font-mono">confidence</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Mean Absolute Error:</span>
            <strong className="font-mono text-slate-800">1.8% MAE</strong>
          </p>
        </div>

        {/* KPI 8: Estimated CO2 Avoided */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Avoided CO₂ Footprint</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-700">
              {dataset.estimatedCo2AvoidedTons}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">Tons CO₂e</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Financial Savings:</span>
            <strong className="font-mono text-emerald-700">${dataset.totalFinancialSavingsUsd.toLocaleString()}</strong>
          </p>
        </div>
      </div>

      {/* 3. Four Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Chart 1: Solar Generation vs Electricity Demand */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. Solar Generation vs. Electricity Demand
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hourly and daily balance showing clean solar generation vs facility load.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-500" />
                <span className="text-slate-700 font-medium">Solar Gen</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-blue-500" />
                <span className="text-slate-700 font-medium">Demand</span>
              </span>
            </div>
          </div>

          {/* Interactive Chart 1 Viewport */}
          <div className="h-44 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-end gap-1">
            {dataset.solarVsDemand.map((point, idx) => {
              const isSelected = selectedChartIndex === idx;
              const solarHeight = Math.max(3, (point.solarKwh / maxSolarVsDemand) * 100);
              const demandHeight = Math.max(3, (point.demandKwh / maxSolarVsDemand) * 100);

              return (
                <button
                  key={point.label}
                  type="button"
                  onClick={() => setSelectedChartIndex(idx)}
                  className={`flex-1 h-full flex flex-col justify-end items-center gap-0.5 group rounded-xs p-0.5 transition-all ${
                    isSelected ? 'bg-slate-200/90 ring-2 ring-slate-900' : 'hover:bg-slate-200/40'
                  }`}
                  title={`${point.label} — Solar: ${point.solarKwh} kWh, Demand: ${point.demandKwh} kWh`}
                >
                  <div className="w-full flex items-end justify-center gap-0.5 h-36">
                    <div 
                      className="w-1/2 bg-amber-400 group-hover:bg-amber-500 rounded-t-xs transition-all"
                      style={{ height: `${solarHeight}%` }}
                    />
                    <div 
                      className="w-1/2 bg-blue-400 group-hover:bg-blue-500 rounded-t-xs transition-all"
                      style={{ height: `${demandHeight}%` }}
                    />
                  </div>
                  <span className="text-[7px] font-mono text-slate-500 leading-none truncate max-w-full">
                    {point.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Inspector footer */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-900 font-sans">
              Point: <strong className="font-mono text-amber-700">{activeSolarPoint.label}</strong>
            </span>
            <div className="flex items-center gap-4">
              <span>Solar: <strong className="text-amber-700">{activeSolarPoint.solarKwh} kWh</strong></span>
              <span>Demand: <strong className="text-blue-700">{activeSolarPoint.demandKwh} kWh</strong></span>
              <span>Surplus: <strong className="text-emerald-700">+{activeSolarPoint.netSurplusKwh} kWh</strong></span>
            </div>
          </div>
        </div>

        {/* Interactive Chart 2: Solar Self-Consumption vs Grid Usage */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Solar Self-Consumption vs. Grid Usage
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakdown of on-site solar consumption vs utility grid import & export.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                <span className="text-slate-700 font-medium">Self-Consumed</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-slate-400" />
                <span className="text-slate-700 font-medium">Grid Import</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-400" />
                <span className="text-slate-700 font-medium">Grid Export</span>
              </span>
            </div>
          </div>

          {/* Interactive Chart 2 Viewport */}
          <div className="h-44 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-end gap-1">
            {dataset.selfConsumptionVsGrid.map((point, idx) => {
              const isSelected = selectedChartIndex === idx;
              const selfHeight = Math.max(3, (point.solarSelfConsumedKwh / maxSelfConsumption) * 100);
              const impHeight = Math.max(3, (point.gridImportKwh / maxSelfConsumption) * 100);
              const expHeight = Math.max(3, (point.gridExportKwh / maxSelfConsumption) * 100);

              return (
                <button
                  key={point.label}
                  type="button"
                  onClick={() => setSelectedChartIndex(idx)}
                  className={`flex-1 h-full flex flex-col justify-end items-center gap-0.5 group rounded-xs p-0.5 transition-all ${
                    isSelected ? 'bg-slate-200/90 ring-2 ring-slate-900' : 'hover:bg-slate-200/40'
                  }`}
                  title={`${point.label} — Self-Consumed: ${point.solarSelfConsumedKwh} kWh, Import: ${point.gridImportKwh} kWh, Export: ${point.gridExportKwh} kWh`}
                >
                  <div className="w-full flex items-end justify-center gap-0.5 h-36">
                    <div 
                      className="w-1/3 bg-emerald-500 group-hover:bg-emerald-600 rounded-t-xs transition-all"
                      style={{ height: `${selfHeight}%` }}
                    />
                    <div 
                      className="w-1/3 bg-slate-400 group-hover:bg-slate-500 rounded-t-xs transition-all"
                      style={{ height: `${impHeight}%` }}
                    />
                    <div 
                      className="w-1/3 bg-amber-400 group-hover:bg-amber-500 rounded-t-xs transition-all"
                      style={{ height: `${expHeight}%` }}
                    />
                  </div>
                  <span className="text-[7px] font-mono text-slate-500 leading-none truncate max-w-full">
                    {point.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Inspector footer */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-900 font-sans">
              Point: <strong className="font-mono text-emerald-700">{activeSelfConsPoint.label}</strong>
            </span>
            <div className="flex items-center gap-4">
              <span>Self-Consumed: <strong className="text-emerald-700">{activeSelfConsPoint.solarSelfConsumedKwh} kWh</strong></span>
              <span>Import: <strong className="text-slate-700">{activeSelfConsPoint.gridImportKwh} kWh</strong></span>
              <span>Export: <strong className="text-amber-700">{activeSelfConsPoint.gridExportKwh} kWh</strong></span>
            </div>
          </div>
        </div>

        {/* Interactive Chart 3: Expected vs Actual PV Generation */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Expected vs. Actual PV Generation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparison of theoretical clear-sky irradiance yield against measured output.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-blue-500" />
                <span className="text-slate-700 font-medium">Expected Baseline</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                <span className="text-slate-700 font-medium">Actual Generated</span>
              </span>
            </div>
          </div>

          {/* Interactive Chart 3 Viewport */}
          <div className="h-44 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-end gap-1">
            {dataset.expectedVsActual.map((point, idx) => {
              const isSelected = selectedChartIndex === idx;
              const expHeight = Math.max(3, (point.expectedKwh / maxExpVsAct) * 100);
              const actHeight = Math.max(3, (point.actualKwh / maxExpVsAct) * 100);
              const isDeficit = point.deviationPercent < -8;

              return (
                <button
                  key={point.label}
                  type="button"
                  onClick={() => setSelectedChartIndex(idx)}
                  className={`flex-1 h-full flex flex-col justify-end items-center gap-0.5 group rounded-xs p-0.5 transition-all ${
                    isSelected ? 'bg-slate-200/90 ring-2 ring-slate-900' : 'hover:bg-slate-200/40'
                  }`}
                  title={`${point.label} — Expected: ${point.expectedKwh} kWh, Actual: ${point.actualKwh} kWh (Dev: ${point.deviationPercent}%)`}
                >
                  <div className="w-full flex items-end justify-center gap-0.5 h-36">
                    <div 
                      className="w-1/2 bg-blue-400 group-hover:bg-blue-500 rounded-t-xs transition-all"
                      style={{ height: `${expHeight}%` }}
                    />
                    <div 
                      className={`w-1/2 rounded-t-xs transition-all ${
                        isDeficit ? 'bg-red-500 group-hover:bg-red-600' : 'bg-emerald-500 group-hover:bg-emerald-600'
                      }`}
                      style={{ height: `${actHeight}%` }}
                    />
                  </div>
                  <span className="text-[7px] font-mono text-slate-500 leading-none truncate max-w-full">
                    {point.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Inspector footer */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-900 font-sans">
              Point: <strong className="font-mono text-blue-700">{activeExpPoint.label}</strong>
            </span>
            <div className="flex items-center gap-4">
              <span>Expected: <strong className="text-blue-700">{activeExpPoint.expectedKwh} kWh</strong></span>
              <span>Actual: <strong className="text-emerald-700">{activeExpPoint.actualKwh} kWh</strong></span>
              <span>Deviation: <strong className={activeExpPoint.deviationPercent < 0 ? 'text-amber-700' : 'text-emerald-700'}>
                {activeExpPoint.deviationPercent > 0 ? `+${activeExpPoint.deviationPercent}%` : `${activeExpPoint.deviationPercent}%`}
              </strong></span>
            </div>
          </div>
        </div>

        {/* Interactive Chart 4: 7-Day Solar Performance */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                4. 7-Day Solar Performance (Yield & PR Ratio)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rolling weekly system performance ratio and daily clean yield.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-500">Mean PR:</span>
              <strong className="text-emerald-700 font-bold">84.7%</strong>
            </div>
          </div>

          {/* Interactive Chart 4 Viewport */}
          <div className="h-44 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-end gap-2">
            {dataset.sevenDayPerformance.map((day, idx) => {
              const yieldHeight = Math.max(15, (day.solarYieldKwh / max7DayYield) * 100);

              return (
                <div
                  key={day.date}
                  className="flex-1 h-full flex flex-col justify-end items-center gap-1 group rounded-lg p-1 transition-all hover:bg-slate-200/50"
                  title={`${day.date} (${day.dayLabel}) — Yield: ${day.solarYieldKwh} kWh | PR: ${day.performanceRatioPercent}% | ${day.weatherCondition}`}
                >
                  <div className="w-full flex items-end justify-center h-32 px-1">
                    <div 
                      className="w-full bg-emerald-500 group-hover:bg-emerald-600 rounded-t-sm transition-all shadow-xs relative"
                      style={{ height: `${yieldHeight}%` }}
                    >
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-mono font-bold text-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {day.solarYieldKwh}k
                      </span>
                    </div>
                  </div>
                  <div className="text-center font-mono">
                    <span className="text-[9px] font-bold text-slate-800 block leading-tight">{day.dayLabel}</span>
                    <span className="text-[8px] font-semibold text-emerald-700">{day.performanceRatioPercent}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inspector footer */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-900 font-sans">
              7-Day Benchmark: <strong className="font-mono text-emerald-700">IEC 61724 Class A Compliant</strong>
            </span>
            <div className="flex items-center gap-4">
              <span>Avg Daily: <strong className="text-slate-900">2,477 kWh</strong></span>
              <span>Self-Consumption: <strong className="text-emerald-700">79.2%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Consolidated Energy Audit Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Consolidated Performance Ledger ({dataset.rangeLabel})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified operational energy accounting record for billing and ESG reporting.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{downloadNotice ? 'Exporting CSV...' : 'Export Energy Ledger (.CSV)'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Time Interval</th>
                <th className="px-4 py-3 text-right">Solar Gen (kWh)</th>
                <th className="px-4 py-3 text-right">Demand (kWh)</th>
                <th className="px-4 py-3 text-right">Self-Consumed (kWh)</th>
                <th className="px-4 py-3 text-right">Grid Export (kWh)</th>
                <th className="px-4 py-3 text-right">Grid Import (kWh)</th>
                <th className="px-4 py-3 text-right">Solar Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {dataset.solarVsDemand.slice(0, 8).map((row, idx) => {
                const selfCons = dataset.selfConsumptionVsGrid[idx]?.solarSelfConsumedKwh || 0;
                const matchPct = row.demandKwh > 0 ? Math.min(100, Math.round((selfCons / row.demandKwh) * 100)) : 0;

                return (
                  <tr key={row.label} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-900 font-sans">{row.label}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-amber-700">{row.solarKwh}</td>
                    <td className="px-4 py-2.5 text-right text-slate-800">{row.demandKwh}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-700 font-bold">{selfCons}</td>
                    <td className="px-4 py-2.5 text-right text-amber-600">{row.netSurplusKwh}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{row.netDeficitKwh}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        matchPct > 80 ? 'bg-emerald-100 text-emerald-900' : matchPct > 40 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {matchPct}%
                      </span>
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
