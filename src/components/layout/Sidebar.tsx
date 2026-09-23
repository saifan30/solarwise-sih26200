import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Sparkles, 
  ShieldAlert, 
  BarChart3, 
  Settings, 
  SunMedium, 
  ChevronRight,
  Zap,
  Building2,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { NavigationTab, SiteLocation } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  sites: SiteLocation[];
  activeSite: SiteLocation;
  onSelectSite: (site: SiteLocation) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  sites,
  activeSite,
  onSelectSite,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [siteDropdownOpen, setSiteDropdownOpen] = React.useState(false);

  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string; category?: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'forecast', label: 'Solar & Load Forecast', icon: TrendingUp, category: 'Core Capabilities', badge: 'Predict' },
    { id: 'opportunity-windows', label: 'Opportunity Windows', icon: Sparkles, badge: 'Optimize' },
    { id: 'health-sentinel', label: 'PV Health Sentinel', icon: ShieldAlert, badge: 'Detect' },
    { id: 'analytics', label: 'Yield & Performance', icon: BarChart3, category: 'Intelligence & Insights' },
    { id: 'settings', label: 'System Configuration', icon: Settings, category: 'Administration' },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
            <SunMedium className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white tracking-tight text-base">SolarWise</span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">Clean Energy Intelligence</p>
          </div>
        </div>
        <button 
          onClick={onCloseMobile} 
          className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Site Selector Picker */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="relative">
          <button
            type="button"
            onClick={() => setSiteDropdownOpen(!siteDropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-left bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors group"
          >
            <div className="min-w-0 flex-1 mr-2">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-xs font-medium text-slate-200 truncate block">
                  {activeSite.name}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 tabular-nums font-mono mt-0.5">
                {activeSite.installedCapacityKwp} kWp · {activeSite.timezone}
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1">
              {activeSite.status === 'nominal' ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Nominal" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-500" title="Warning" />
              )}
              <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${siteDropdownOpen ? 'rotate-90' : ''}`} />
            </div>
          </button>

          {siteDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-850 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-30">
              <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Select Active Installation
              </div>
              {sites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => {
                    onSelectSite(site);
                    setSiteDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 transition-colors ${
                    site.id === activeSite.id ? 'bg-slate-800/80 text-white' : 'text-slate-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-medium truncate">{site.name}</p>
                    <p className="text-[11px] text-slate-400 tabular-nums">{site.installedCapacityKwp} kWp capacity</p>
                  </div>
                  {site.status === 'nominal' ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Nominal
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Alert
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Platform Views
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded text-xs tracking-wider ${
                      isActive ? 'bg-amber-500/20 text-amber-200' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Grid Status Card */}
        <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 text-[11px]">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Real-time Inverter Link
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Live</span>
          </div>
          <div className="flex items-baseline justify-between pt-1 text-slate-200">
            <span className="text-[11px] text-slate-400">Current Output:</span>
            <span className="text-xs font-semibold tabular-nums font-mono text-amber-300">384.2 kW</span>
          </div>
          <div className="flex items-baseline justify-between pt-0.5 text-slate-200">
            <span className="text-[11px] text-slate-400">Self-Consumption:</span>
            <span className="text-xs font-medium tabular-nums font-mono text-emerald-400">56.8%</span>
          </div>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>SolarWise Engine</span>
          <span className="font-mono text-[10px] text-slate-400">v2.4.0</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Predict · Detect · Optimize</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 z-20">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs transition-opacity" 
            onClick={onCloseMobile} 
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
