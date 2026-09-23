import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './components/pages/DashboardPage';
import { ForecastPage } from './components/pages/ForecastPage';
import { OpportunityWindowsPage } from './components/pages/OpportunityWindowsPage';
import { PVHealthSentinelPage } from './components/pages/PVHealthSentinelPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { 
  NavigationTab, 
  SiteLocation, 
  RealtimeTelemetry, 
  HistoricalDataPoint,
  ForecastDataPoint, 
  TomorrowHourlyPoint,
  TomorrowSummary,
  FlexibleLoadItem, 
  PVAnomaly, 
  PVStringStatus, 
  SystemSettingsState 
} from './types';
import { 
  INITIAL_SITES, 
  INITIAL_TELEMETRY, 
  INITIAL_HISTORY_24H,
  INITIAL_FORECAST_24H, 
  INITIAL_TOMORROW_FORECAST,
  INITIAL_FLEXIBLE_LOADS, 
  INITIAL_ANOMALIES, 
  INITIAL_STRING_STATUSES, 
  INITIAL_SETTINGS 
} from './data/mockData';
import { 
  generate24HourHistory, 
  generateTomorrowForecast, 
  computeRealtimeTelemetry 
} from './data/energyEngine';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [sites, setSites] = useState<SiteLocation[]>(INITIAL_SITES);
  const [activeSite, setActiveSite] = useState<SiteLocation>(INITIAL_SITES[0]);
  
  // Shared Application State for plant telemetry, historical curves, and tomorrow predictions
  const [telemetry, setTelemetry] = useState<RealtimeTelemetry>(INITIAL_TELEMETRY);
  const [history24h, setHistory24h] = useState<HistoricalDataPoint[]>(INITIAL_HISTORY_24H);
  const [forecast24h, setForecast24h] = useState<ForecastDataPoint[]>(INITIAL_FORECAST_24H);
  const [tomorrowForecast, setTomorrowForecast] = useState<{
    hourly: TomorrowHourlyPoint[];
    summary: TomorrowSummary;
  }>(INITIAL_TOMORROW_FORECAST);

  const [flexibleLoads, setFlexibleLoads] = useState<FlexibleLoadItem[]>(INITIAL_FLEXIBLE_LOADS);
  const [anomalies, setAnomalies] = useState<PVAnomaly[]>(INITIAL_ANOMALIES);
  const [stringStatuses, setStringStatuses] = useState<PVStringStatus[]>(INITIAL_STRING_STATUSES);
  const [settings, setSettings] = useState<SystemSettingsState>(INITIAL_SETTINGS);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // When active site changes, re-simulate plant curves dynamically from math engine
  const handleSelectSite = (site: SiteLocation) => {
    setActiveSite(site);
    const newTelem = computeRealtimeTelemetry(site);
    const newHistory = generate24HourHistory(site);
    const newTomorrow = generateTomorrowForecast(site);
    
    setTelemetry(newTelem);
    setHistory24h(newHistory);
    setTomorrowForecast(newTomorrow);
  };

  // Refresh Telemetry Handler (simulates live sensor poll)
  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setTelemetry((prev) => {
        const delta = (Math.random() - 0.48) * 8;
        const newSolar = Math.max(280, Math.min(activeSite.inverterCapacityKw, prev.currentSolarKw + delta));
        const newExport = newSolar - prev.facilityDemandKw;
        return {
          ...prev,
          currentSolarKw: parseFloat(newSolar.toFixed(1)),
          netGridExportKw: parseFloat(newExport.toFixed(1)),
          isExporting: newExport >= 0,
          solarIrradianceWm2: Math.round(850 + Math.random() * 80),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      });
      setIsRefreshing(false);
    }, 600);
  };

  // Toggle Auto-dispatch on flexible loads
  const handleToggleAutoExecute = (loadId: string) => {
    setFlexibleLoads((prev) =>
      prev.map((l) => (l.id === loadId ? { ...l, autoExecute: !l.autoExecute } : l))
    );
  };

  // Dispatch / Run load now
  const handleDispatchLoad = (loadId: string) => {
    setFlexibleLoads((prev) =>
      prev.map((l) => {
        if (l.id === loadId) {
          const newStatus = l.status === 'running' ? 'scheduled' : 'running';
          return { ...l, status: newStatus };
        }
        return l;
      })
    );
  };

  // Add new flexible load asset
  const handleAddLoad = (newLoadData: Omit<FlexibleLoadItem, 'id'>) => {
    const newId = `load-${Date.now()}`;
    setFlexibleLoads((prev) => [...prev, { ...newLoadData, id: newId }]);
  };

  // Resolve PV Anomaly
  const handleResolveAnomaly = (id: string) => {
    setAnomalies((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'resolved' as const } : a))
    );
    // If it was String W-09, also update its string status to good
    setStringStatuses((prev) =>
      prev.map((s) => (s.id === 'str-9' ? { ...s, health: 'good', powerKw: 6.05, currentA: 9.4, efficiencyPercent: 99.2 } : s))
    );
  };

  // Update Settings
  const handleSaveSettings = (updated: SystemSettingsState) => {
    setSettings(updated);
    setActiveSite((prev) => ({
      ...prev,
      name: updated.siteName,
      address: updated.locationAddress,
      installedCapacityKwp: updated.installedCapacityKwp,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased selection:bg-amber-500/20 selection:text-amber-900">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        sites={sites}
        activeSite={activeSite}
        onSelectSite={handleSelectSite}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          activeSite={activeSite}
          telemetry={telemetry}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onRefreshTelemetry={handleRefreshTelemetry}
          isRefreshing={isRefreshing}
        />

        {/* Page Body Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              activeSite={activeSite}
              telemetry={telemetry}
              history24h={history24h}
              forecast24h={forecast24h}
              tomorrowForecast={tomorrowForecast}
              flexibleLoads={flexibleLoads}
              anomalies={anomalies}
              stringStatuses={stringStatuses}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'forecast' && (
            <ForecastPage
              activeSite={activeSite}
              forecast24h={forecast24h}
            />
          )}

          {currentTab === 'opportunity-windows' && (
            <OpportunityWindowsPage
              activeSite={activeSite}
              flexibleLoads={flexibleLoads}
              onToggleAutoExecute={handleToggleAutoExecute}
              onDispatchLoad={handleDispatchLoad}
              onAddLoad={handleAddLoad}
            />
          )}

          {currentTab === 'health-sentinel' && (
            <PVHealthSentinelPage
              activeSite={activeSite}
              anomalies={anomalies}
              stringStatuses={stringStatuses}
              onResolveAnomaly={handleResolveAnomaly}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage
              activeSite={activeSite}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </main>
      </div>
    </div>
  );
}
