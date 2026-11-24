import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  AlertTriangle, 
  Users, 
  History, 
  Cpu, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Radio,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, alertsCount }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live', label: 'Live Monitoring', icon: Activity, badge: 'Live Radar' },
    { id: 'emergency', label: 'Emergency Alerts', icon: AlertTriangle, alertBadge: alertsCount > 0 ? alertsCount : null },
    { id: 'contacts', label: 'Emergency Contacts', icon: Users },
    { id: 'history', label: 'Activity History', icon: History },
    { id: 'device', label: 'Device Management', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen bg-white border-r border-[#E2E8F0] z-30 transition-all duration-300 ease-in-out flex flex-col shadow-xs ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-[#E2E8F0]">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F9D85] flex items-center justify-center text-white shadow-md shadow-[#0F9D85]/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="font-extrabold text-[#172B4D] text-lg leading-tight tracking-tight">SmartGuard</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#0F9D85]/10 text-[#0F9D85]">
                  PRO
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#6B778C] tracking-tight">Intelligent Mobility</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-10 h-10 rounded-xl bg-[#0F9D85] flex items-center justify-center text-white shadow-md shadow-[#0F9D85]/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg text-[#6B778C] hover:text-[#172B4D] hover:bg-[#F7F9FC] transition-colors cursor-pointer ${
            isCollapsed ? 'hidden' : 'block'
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center transition-all duration-200 rounded-xl font-semibold text-sm group cursor-pointer ${
                isCollapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-2.5'
              } ${
                isActive
                  ? 'bg-[#0F9D85]/10 text-[#0F9D85] shadow-xs border border-[#0F9D85]/20'
                  : 'text-[#6B778C] hover:text-[#172B4D] hover:bg-[#F7F9FC]'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon 
                className={`w-5 h-5 transition-colors shrink-0 ${
                  isActive ? 'text-[#0F9D85]' : 'text-[#6B778C] group-hover:text-[#172B4D]'
                } ${isCollapsed ? '' : 'mr-3'}`} 
              />
              
              {!isCollapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}

              {!isCollapsed && item.badge && (
                <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0F9D85]/15 text-[#0F9D85]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D85] animate-pulse mr-1"></span>
                  {item.badge}
                </span>
              )}

              {!isCollapsed && item.alertBadge && (
                <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20 animate-pulse">
                  {item.alertBadge} SOS
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapsed expand toggle */}
      {isCollapsed && (
        <div className="p-3 border-t border-[#E2E8F0] flex justify-center">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-lg text-[#6B778C] hover:text-[#172B4D] hover:bg-[#F7F9FC] cursor-pointer"
            title="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Assistive Tech Tagline Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F7F9FC]/60">
          <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#172B4D]">
              <Sparkles className="w-3.5 h-3.5 text-[#0F9D85]" />
              <span>SmartGuard Assistive</span>
            </div>
            <p className="text-[11px] text-[#6B778C] mt-1 leading-snug">
              Intelligent Mobility. Safer Independence.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
