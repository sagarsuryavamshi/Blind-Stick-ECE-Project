import React, { useState } from 'react';
import { 
  Bell, 
  Wifi, 
  WifiOff, 
  ShieldAlert, 
  AlertOctagon, 
  Activity, 
  Sparkles, 
  ChevronDown,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useDevice } from '../context/DeviceContext';

export default function TopNav({ isCollapsed, activeTabTitle, onTriggerSOS }) {
  const { 
    deviceState, 
    isDeviceOnline, 
    setIsDeviceOnline,
    isSimulatingLiveWalk, 
    setIsSimulatingLiveWalk,
    alerts 
  } = useDevice();

  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeAlertCount = alerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <header 
      className={`fixed top-0 right-0 h-20 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] z-20 transition-all duration-300 ease-in-out px-4 sm:px-8 flex items-center justify-between ${
        isCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Dynamic Page Title & Product Tagline */}
      <div>
        <div className="flex items-center space-x-3">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#172B4D] tracking-tight">
            {activeTabTitle}
          </h2>
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 uppercase tracking-wider">
            DEMO DATA MODE
          </span>
        </div>
        <p className="text-xs text-[#6B778C] font-medium hidden sm:block">
          SmartGuard — Intelligent Mobility. Safer Independence.
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Toggle Live Walking Simulation */}
        <button
          onClick={() => setIsSimulatingLiveWalk(!isSimulatingLiveWalk)}
          className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            isSimulatingLiveWalk
              ? 'bg-[#0F9D85]/10 border-[#0F9D85]/30 text-[#0F9D85]'
              : 'bg-[#F7F9FC] border-[#E2E8F0] text-[#6B778C] hover:text-[#172B4D]'
          }`}
          title="Toggle realistic frontend walking data generator"
        >
          <Activity className={`w-3.5 h-3.5 ${isSimulatingLiveWalk ? 'text-[#0F9D85] animate-pulse' : 'text-[#6B778C]'}`} />
          <span>{isSimulatingLiveWalk ? 'Simulated Walk Active' : 'Start Walk Sim'}</span>
        </button>

        {/* Device Online/Offline Interactive Toggle */}
        <button
          onClick={() => setIsDeviceOnline(!isDeviceOnline)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer ${
            !isDeviceOnline
              ? 'bg-slate-100 border-slate-200 text-slate-500'
              : deviceState.status === 'EMERGENCY'
              ? 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
              : 'bg-[#0F9D85]/15 border-[#0F9D85]/30 text-[#0F9D85]'
          }`}
          title="Click to toggle simulated connection state (Online / Offline)"
        >
          <span className="relative flex h-2 w-2">
            {isDeviceOnline && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                deviceState.status === 'EMERGENCY' ? 'bg-[#EF4444]' : 'bg-[#0F9D85]'
              }`} />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              !isDeviceOnline ? 'bg-slate-400' : deviceState.status === 'EMERGENCY' ? 'bg-[#EF4444]' : 'bg-[#0F9D85]'
            }`} />
          </span>
          <span className="hidden sm:inline">ESP32:</span>
          <span>{isDeviceOnline ? 'Online (BLINDSTICK001)' : 'Offline'}</span>
        </button>

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
                  <span className="text-xs font-bold text-[#172B4D]">Demo Notifications</span>
                  <span className="text-[10px] text-[#F59E0B] font-bold block">Simulated Feed</span>
                </div>
                <span className="text-[11px] text-[#6B778C] font-semibold">{alerts.length} logged</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#F7F9FC] px-2 py-1">
                {alerts.map((a) => (
                  <div key={a.id} className="p-2.5 hover:bg-[#F7F9FC] rounded-xl transition-colors">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        a.severity === 'DANGER' ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                      }`}>
                        {a.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-[#6B778C] font-medium">
                        {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#172B4D] mt-1">{a.title}</div>
                    <div className="text-[11px] text-[#6B778C] line-clamp-1 mt-0.5">{a.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 pl-2 border-l border-[#E2E8F0] cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#0F9D85] text-white font-black flex items-center justify-center text-xs shadow-xs">
              SG
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-[#172B4D] leading-tight">Sarah Jenkins</div>
              <div className="text-[10px] text-[#6B778C] font-medium">Guardian Admin</div>
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
                <div className="px-3 py-2 rounded-lg hover:bg-[#F7F9FC] font-medium cursor-pointer">Guardian Preferences</div>
                <div className="px-3 py-2 rounded-lg hover:bg-[#F7F9FC] font-medium cursor-pointer">Help & Documentation</div>
                <div className="px-3 py-2 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 font-bold cursor-pointer">Sign Out</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
