import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  ShieldAlert, 
  Sliders, 
  Sun, 
  CheckCircle2, 
  Save, 
  Volume2, 
  Smartphone,
  Info
} from 'lucide-react';
import { useDevice } from '../context/DeviceContext';

export default function SettingsPage() {
  const { deviceState } = useDevice();

  // User Profile States
  const [userName, setUserName] = useState('Sarah Jenkins');
  const [userEmail, setUserEmail] = useState('sarah.j@smartguard.care');
  const [userRole, setUserRole] = useState('Primary Caregiver / Guardian');

  // Notification Preferences
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [callAlertsEnabled, setCallAlertsEnabled] = useState(true);
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(false);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);

  // Emergency Alert Preferences
  const [fallSensitivity, setFallSensitivity] = useState('HIGH');
  const [sosSpeakerVolume, setSosSpeakerVolume] = useState(26);
  const [smsCooldownSeconds, setSmsCooldownSeconds] = useState(60);

  // Device Configuration
  const [proximityWarningDistance, setProximityWarningDistance] = useState(28); // cm
  const [themeMode, setThemeMode] = useState('LIGHT');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveAll = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Explicit DEMO DATA Notice */}
      <div className="p-3.5 px-4 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-between text-xs text-[#3B82F6]">
        <div className="flex items-center space-x-2 font-semibold">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            <strong className="font-bold">FRONTEND DEMO:</strong> Preference toggles and parametric settings persist across the active session.
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-[#3B82F6]/30">
          SESSION PREFERENCES
        </span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] tracking-tight">
              Platform & Hardware Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F9D85]/10 text-[#0F9D85]">
              Configuration
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B778C] mt-1 font-medium">
            Manage guardian profile, notification channels, emergency sensitivity thresholds, and device preferences
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-5 py-2.5 rounded-xl bg-[#0F9D85] hover:bg-[#0c826e] active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-[#0F9D85]/15 border border-[#0F9D85]/30 text-[#0F9D85] flex items-center space-x-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#0F9D85]" />
          <span>All platform preferences updated and applied to SmartGuard session!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: User Profile */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E2E8F0]">
            <User className="w-5 h-5 text-[#0F9D85]" />
            <h3 className="text-base font-extrabold text-[#172B4D]">Caregiver Profile</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">Guardian Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#172B4D] focus:outline-[#0F9D85]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">Email Address</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#172B4D] focus:outline-[#0F9D85]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172B4D] mb-1">Caregiver Role</label>
              <input
                type="text"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm text-[#172B4D] focus:outline-[#0F9D85]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Notification Preferences */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E2E8F0]">
            <Bell className="w-5 h-5 text-[#3B82F6]" />
            <h3 className="text-base font-extrabold text-[#172B4D]">Notification Channels</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0]">
              <div>
                <div className="font-bold text-[#172B4D]">Immediate SMS Alerts</div>
                <div className="text-[#6B778C]">Dispatches emergency SMS to primary contact</div>
              </div>
              <input
                type="checkbox"
                checked={smsAlertsEnabled}
                onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                className="accent-[#0F9D85] w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0]">
              <div>
                <div className="font-bold text-[#172B4D]">Automated Voice Calls</div>
                <div className="text-[#6B778C]">Robocall alert for verified falls</div>
              </div>
              <input
                type="checkbox"
                checked={callAlertsEnabled}
                onChange={(e) => setCallAlertsEnabled(e.target.checked)}
                className="accent-[#0F9D85] w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0]">
              <div>
                <div className="font-bold text-[#172B4D]">Audible Browser Alerts</div>
                <div className="text-[#6B778C]">Sounds siren in dashboard tab during emergency</div>
              </div>
              <input
                type="checkbox"
                checked={soundAlertsEnabled}
                onChange={(e) => setSoundAlertsEnabled(e.target.checked)}
                className="accent-[#0F9D85] w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Alert Preferences */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E2E8F0]">
            <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
            <h3 className="text-base font-extrabold text-[#172B4D]">Emergency Alert Preferences</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#172B4D] mb-1">
                Fall Detection Sensitivity (MPU6050)
              </label>
              <select
                value={fallSensitivity}
                onChange={(e) => setFallSensitivity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-semibold text-[#172B4D] focus:outline-[#0F9D85]"
              >
                <option value="HIGH">High Sensitivity (2.2G Threshold)</option>
                <option value="BALANCED">Balanced / Medium (2.8G Threshold)</option>
                <option value="LOW">Low Sensitivity (3.5G Threshold)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between font-bold text-[#172B4D] mb-1">
                <span>Stick Speaker Volume (DFPlayer Mini):</span>
                <span className="text-[#0F9D85]">{sosSpeakerVolume} / 30</span>
              </div>
              <input
                type="range"
                min="10"
                max="30"
                value={sosSpeakerVolume}
                onChange={(e) => setSosSpeakerVolume(Number(e.target.value))}
                className="w-full accent-[#0F9D85] cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-bold text-[#172B4D] mb-1">
                SMS Duplicate Suppression Cooldown
              </label>
              <input
                type="text"
                readOnly
                value={`${smsCooldownSeconds} Seconds (Avoids telecom spam & rate-limits)`}
                className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] text-[#6B778C] font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Device Configuration & Appearance */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#E2E8F0]">
            <Sliders className="w-5 h-5 text-[#F59E0B]" />
            <h3 className="text-base font-extrabold text-[#172B4D]">Device & Appearance Settings</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-[#172B4D] mb-1">
                <span>Obstacle Warning Threshold Distance:</span>
                <span className="text-[#0F9D85]">{proximityWarningDistance} cm</span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                value={proximityWarningDistance}
                onChange={(e) => setProximityWarningDistance(Number(e.target.value))}
                className="w-full accent-[#0F9D85] cursor-pointer"
              />
              <span className="text-[11px] text-[#6B778C] mt-1 block">
                Objects closer than {proximityWarningDistance}cm sound acoustic audio beeps.
              </span>
            </div>

            <div>
              <label className="block font-bold text-[#172B4D] mb-1">Dashboard Appearance Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setThemeMode('LIGHT')}
                  className={`p-3 rounded-xl border flex items-center justify-center space-x-2 font-bold cursor-pointer transition-all ${
                    themeMode === 'LIGHT' 
                      ? 'border-[#0F9D85] bg-[#0F9D85]/10 text-[#0F9D85]' 
                      : 'border-[#E2E8F0] text-[#6B778C]'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Bright Light Mode (Default)</span>
                </button>
                <div 
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-center space-x-2 font-bold cursor-not-allowed"
                  title="Dark purple themes strictly disallowed by design guidelines"
                >
                  <span>Dark Mode (Disabled)</span>
                </div>
              </div>
              <span className="text-[10px] text-[#6B778C] mt-1 block">
                Healthcare standard: Clean, high-contrast light mode (#F7F9FC).
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
