import React, { useState } from 'react';
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  AlertOctagon, 
  Activity, 
  ChevronDown,
  Info,
  Database,
  Radio,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useDevice } from '../context/DeviceContext';

export default function TopNav({ isCollapsed, activeTabTitle, onTriggerSOS }) {
  const { 
    appMode,
    setAppMode,
    deviceState, 
    isSocketConnected,
    isBackendHealthy,
    backendHealthData,
    alerts 
  } = useDevice();

  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeAlertCount = alerts.filter(a => a.status === 'ACTIVE').length;
  const isOnline = deviceState.status !== 'OFFLINE';

  return (
    <header 
      className={`fixed top-0 right-0 h-20 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] z-20 transition-all duration-300 ease-in-out px-4 sm:px-8 flex items-center justify-between ${
        isCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Dynamic Page Title & Mode Tag */}
      <div>
        <div className="flex items-center space-x-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#172B4D] tracking-tight">
            {activeTabTitle}
          </h2>

          {/* Mode Badge with toggle */}
          <button
            onClick={() => setAppMode(appMode === 'LIVE' ? 'DEMO' : 'LIVE')}
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              appMode === 'LIVE'
                ? 'bg-[#0F9D85]/15 text-[#0F9D85] border-[#0F9D85]/30 hover:bg-[#0F9D85]/25'
                : 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30 hover:bg-[#F59E0B]/25'
            }`}
            title="Click to switch between Live Backend Mode and Simulated Demo Mode"
          >
            <span className={`w-2 h-2 rounded-full ${appMode === 'LIVE' ? 'bg-[#0F9D85] animate-ping' : 'bg-[#F59E0B]'}`} />
            <span>{appMode === 'LIVE' ? 'LIVE BACKEND MODE' : 'DEMO DATA MODE'}</span>
            <span className="text-[10px] opacity-75 font-normal underline ml-1">Switch</span>
          </button>
        </div>
        <p className="text-xs text-[#6B778C] font-medium hidden sm:block">
          SmartGuard — Intelligent Mobility. Safer Independence.
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Backend & Database Health Pill */}
        <div 
          className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#F7F9FC] border border-[#E2E8F0] text-[11px] font-semibold text-[#172B4D]"
          title={backendHealthData?.database?.note || 'Backend state'}
        >
          <Database className={`w-3.5 h-3.5 ${isBackendHealthy ? 'text-[#0F9D85]' : 'text-slate-400'}`} />
          <span>DB: {backendHealthData?.database?.connected ? 'Atlas' : 'In-Memory (Dev)'}</span>
        </div>

        {/* ESP32 Hardware Connection Badge */}
        <div 
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
            !isOnline
              ? 'bg-slate-100 border-slate-200 text-slate-500'
              : deviceState.status === 'EMERGENCY'
              ? 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
              : 'bg-[#0F9D85]/15 border-[#0F9D85]/30 text-[#0F9D85]'
          }`}
          title={isOnline ? 'ESP32 active communication confirmed' : 'No telemetry received in last 20 seconds'}
        >
          <span className="relative flex h-2 w-2">
            {isOnline && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                deviceState.status === 'EMERGENCY' ? 'bg-[#EF4444]' : 'bg-[#0F9D85]'
              }`} />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              !isOnline ? 'bg-slate-400' : deviceState.status === 'EMERGENCY' ? 'bg-[#EF4444]' : 'bg-[#0F9D85]'
            }`} />
          </span>
          <span className="hidden sm:inline">ESP32:</span>
          <span>{isOnline ? `${deviceState.status}` : 'OFFLINE'}</span>
        </div>

        {/* SOS Emergency Trigger Button */}
        <button
          onClick={onTriggerSOS}
          className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#dc2626] active:scale-95 text-white font-bold text-xs shadow-md shadow-[#EF4444]/25 transition-all cursor-pointer"
        >
          <AlertOctagon className="w-3.5 h-3.5 animate-bounce" />
          <span>Manual SOS</span>
        </button>

        {/* Notification Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationPopup(!showNotificationPopup)}
            className="p-2 rounded-xl text-[#6B778C] hover:text-[#172B4D] hover:bg-[#F7F9FC] transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {activeAlertCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {activeAlertCount}
              </span>
            )}
          </button>

          {showNotificationPopup && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-3 z-50 animate-in fade-in duration-150">
              <div className="px-4 pb-2 border-b border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#172B4D]">Live Notifications</span>
                  <span className="text-[10px] text-[#0F9D85] font-bold block">{appMode === 'LIVE' ? 'Connected to Backend' : 'Demo Feed'}</span>
                </div>
                <span className="text-[11px] text-[#6B778C] font-semibold">{alerts.length} logged</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#F7F9FC] px-2 py-1">
                {alerts.slice(0, 8).map((a) => (
                  <div key={a._id || a.id} className="p-2.5 hover:bg-[#F7F9FC] rounded-xl transition-colors">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        a.severity === 'DANGER' ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                      }`}>
                        {(a.alertType || a.type || 'ALERT').replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-[#6B778C] font-medium">
                        {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#172B4D] mt-1">{a.title || a.alertType}</div>
                    <div className="text-[11px] text-[#6B778C] line-clamp-1 mt-0.5">{a.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 pl-2 border-l border-[#E2E8F0] cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#0F9D85] text-white font-black flex items-center justify-center text-xs shadow-xs">
              SJ
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-[#172B4D] leading-tight">Sarah Jenkins</div>
              <div className="text-[10px] text-[#6B778C] font-medium">Caregiver Admin</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B778C] hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2 z-50 animate-in fade-in duration-150">
              <div className="p-2 border-b border-[#E2E8F0]">
                <div className="text-xs font-bold text-[#172B4D]">Sarah Jenkins</div>
                <div className="text-[11px] text-[#6B778C]">sarah.j@smartguard.care</div>
              </div>
              <div className="py-1 text-xs text-[#172B4D]">
                <div className="px-3 py-2 rounded-lg hover:bg-[#F7F9FC] font-medium cursor-pointer">Guardian Settings</div>
                <div className="px-3 py-2 rounded-lg hover:bg-[#F7F9FC] font-medium cursor-pointer">MongoDB Atlas Config</div>
                <div className="px-3 py-2 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 font-bold cursor-pointer">Sign Out</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
