import React from 'react';
import { 
  Settings, 
  Save, 
  Check, 
  Sliders, 
  ShieldAlert, 
  Sparkles, 
  Sun, 
  DollarSign, 
  Bell, 
  Building2 
} from 'lucide-react';
import { SystemSettingsState } from '../../types';

interface SettingsPageProps {
  settings: SystemSettingsState;
  onSaveSettings: (updated: SystemSettingsState) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = React.useState<SystemSettingsState>({ ...settings });
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const handleChange = (field: keyof SystemSettingsState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <span>Platform Administration</span>
            <span aria-hidden="true">·</span>
            <span>Configuration</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
            Installation Specs & Optimization Parameters
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure system capacity, retail utility tariffs, and sentinel detection sensitivity.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: PV Array & Facility Metadata */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sun className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              1. Solar PV Array & Hardware Specifications
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Site Installation Name</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Geographic Location / Address</label>
              <input
                type="text"
                value={formData.locationAddress}
                onChange={(e) => handleChange('locationAddress', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Total DC Installed Capacity (kWp)</label>
              <input
                type="number"
                step="0.1"
                value={formData.installedCapacityKwp}
                onChange={(e) => handleChange('installedCapacityKwp', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tilt Angle (°)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.tiltAngleDeg}
                  onChange={(e) => handleChange('tiltAngleDeg', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Azimuth (° South=180)</label>
                <input
                  type="number"
                  value={formData.azimuthDeg}
                  onChange={(e) => handleChange('azimuthDeg', parseInt(e.target.value) || 180)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Electricity Utility Tariff Rates */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              2. Time-of-Use Electricity Tariffs & Feed-In Rates
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Peak Utility Rate ($/kWh)</label>
              <input
                type="number"
                step="0.01"
                value={formData.peakTariffRateUsd}
                onChange={(e) => handleChange('peakTariffRateUsd', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">Applied during 16:00 – 21:00 weekday hours</p>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Off-Peak Rate ($/kWh)</label>
              <input
                type="number"
                step="0.01"
                value={formData.offPeakTariffRateUsd}
                onChange={(e) => handleChange('offPeakTariffRateUsd', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">Standard baseline grid retail rate</p>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Feed-in / Export Credit ($/kWh)</label>
              <input
                type="number"
                step="0.01"
                value={formData.feedInTariffUsd}
                onChange={(e) => handleChange('feedInTariffUsd', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">Net metering rate for exported generation</p>
            </div>
          </div>
        </div>

        {/* Section 3: PV Health Sentinel & Optimization Policies */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              3. Detection & Dispatch Automation Thresholds
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Underperformance Discrepancy Threshold (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={formData.underperformanceAlertThresholdPercent}
                  onChange={(e) => handleChange('underperformanceAlertThresholdPercent', parseInt(e.target.value))}
                  className="w-full accent-amber-600"
                />
                <span className="font-mono font-bold text-slate-900 text-xs w-10">
                  {formData.underperformanceAlertThresholdPercent}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Flags string if actual is {formData.underperformanceAlertThresholdPercent}% below expected</p>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Min. Solar Coverage for Auto-Dispatch (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={formData.minSolarCoverageForDispatch}
                  onChange={(e) => handleChange('minSolarCoverageForDispatch', parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <span className="font-mono font-bold text-slate-900 text-xs w-10">
                  {formData.minSolarCoverageForDispatch}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Requires {formData.minSolarCoverageForDispatch}% solar power before starting flexible loads</p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoDispatchFlexibleLoads}
                onChange={(e) => handleChange('autoDispatchFlexibleLoads', e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="text-slate-800 font-medium">Enable Automated Flexible Load Dispatch</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailAlerts}
                onChange={(e) => handleChange('emailAlerts', e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span className="text-slate-800 font-medium">Email Incident Reports on Critical Faults</span>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-2xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
