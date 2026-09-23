import React from 'react';
import { 
  Menu, 
  RefreshCw, 
  Bell, 
  Download, 
  Sun, 
  CloudSun, 
  Check,
  Building2,
  Calendar,
  Layers
} from 'lucide-react';
import { NavigationTab, SiteLocation, RealtimeTelemetry } from '../../types';

interface HeaderProps {
  currentTab: NavigationTab;
  activeSite: SiteLocation;
  telemetry: RealtimeTelemetry;
  onOpenMobileMenu: () => void;
  onRefreshTelemetry: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  activeSite,
  telemetry,
  onOpenMobileMenu,
  onRefreshTelemetry,
  isRefreshing = false,
}) => {
  const [showNotificationModal, setShowNotificationModal] = React.useState(false);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  const getPageInfo = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Executive Overview', section: 'System Telemetry', desc: 'Real-time generation, facility demand & core optimization triggers' };
      case 'forecast':
        return { title: 'Solar & Demand Forecast', section: 'Predict Capability', desc: '24h/7d solar irradiance predictions and facility load forecasting' };
      case 'opportunity-windows':
        return { title: 'Opportunity Windows', section: 'Optimize Capability', desc: 'Automated clean-energy dispatch windows for flexible loads' };
      case 'health-sentinel':
        return { title: 'PV Health Sentinel', section: 'Detect Capability', desc: 'String-level underperformance detection and loss diagnostics' };
      case 'analytics':
        return { title: 'Yield & Performance Analytics', section: 'Insights', desc: 'Self-sufficiency breakdown, financial yields, and PR metrics' };
      case 'settings':
        return { title: 'System Configuration', section: 'Administration', desc: 'Array metadata, tariffs, flexible assets, and alert sensitivity' };
    }
  };

  const info = getPageInfo(currentTab);

  const handleExport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between transition-colors shadow-2xs">
      {/* Left zone: Mobile toggle & Breadcrumb Trail */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="hidden sm:inline-block">{activeSite.name.split('(')[0]}</span>
            <span className="hidden sm:inline-block" aria-hidden="true">/</span>
            <span className="text-amber-700 font-semibold">{info.section}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
            {info.title}
          </h1>
        </div>
      </div>

      {/* Right zone: Live environmental telemetry + Action buttons */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Environmental Summary Bar (Weather & Irradiance) */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1 text-amber-700 font-medium">
            <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-mono tabular-nums">{telemetry.solarIrradianceWm2} W/m²</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1 text-slate-600">
            <CloudSun className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-mono tabular-nums">{telemetry.ambientTempC}°C ambient</span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="text-[11px] text-slate-500">
            Updated <span className="font-mono tabular-nums">{telemetry.timestamp}</span>
          </div>
        </div>

        {/* Refresh Action */}
        <button
          type="button"
          onClick={onRefreshTelemetry}
          title="Refresh real-time data"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors relative"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotificationModal(!showNotificationModal)}
            title="System notifications"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          </button>

          {showNotificationModal && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-40">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-semibold text-slate-900">Active System Alerts</span>
                <span className="text-[11px] font-mono text-amber-600">2 Active</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-amber-50/70 border border-amber-200/60 rounded-lg text-amber-900">
                  <p className="font-medium text-xs">Opportunity Window Active</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">High solar surplus (+195 kW). EV Fleet charging recommended now.</p>
                </div>
                <div className="p-2 bg-red-50/70 border border-red-200/60 rounded-lg text-red-900">
                  <p className="font-medium text-xs">String W-09 Underperformance</p>
                  <p className="text-[11px] text-red-700 mt-0.5">Open circuit condition detected on Main Rooftop West.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Data Button */}
        <button
          type="button"
          onClick={handleExport}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs whitespace-nowrap"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-semibold">Exported</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Telemetry</span>
            </>
          )}
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-medium flex items-center justify-center font-mono">
            OP
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-medium text-slate-900 leading-tight">Energy Lead</p>
            <p className="text-[10px] text-slate-500">Facility Operations</p>
          </div>
        </div>
      </div>
    </header>
  );
};
