import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Overview from './pages/Overview';
import LiveMonitoring from './pages/LiveMonitoring';
import EmergencyAlerts from './pages/EmergencyAlerts';
import EmergencyContacts from './pages/EmergencyContacts';
import ActivityHistory from './pages/ActivityHistory';
import DeviceManagement from './pages/DeviceManagement';
import SettingsPage from './pages/SettingsPage';
import { DeviceProvider, useDevice } from './context/DeviceContext';
import { AlertOctagon, X, PhoneCall, CheckCircle2, ShieldCheck } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  const { 
    deviceState, 
    contacts, 
    alerts, 
    triggerSimulatedEvent, 
    toastNotification, 
    setToastNotification 
  } = useDevice();

  const handleConfirmSOS = () => {
    triggerSimulatedEvent('MANUAL_SOS');
    setIsSosModalOpen(false);
    setActiveTab('emergency');
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Overview Dashboard';
      case 'live': return 'Live Monitoring Radar';
      case 'emergency': return 'Emergency Alert System';
      case 'contacts': return 'Emergency Contacts';
      case 'history': return 'Activity & Audit History';
      case 'device': return 'Device Management';
      case 'settings': return 'Platform Settings';
      default: return 'SmartGuard Dashboard';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview onNavigate={setActiveTab} />;
      case 'live': return <LiveMonitoring />;
      case 'emergency': return <EmergencyAlerts />;
      case 'contacts': return <EmergencyContacts />;
      case 'history': return <ActivityHistory />;
      case 'device': return <DeviceManagement />;
      case 'settings': return <SettingsPage />;
      default: return <Overview onNavigate={setActiveTab} />;
    }
  };

  const activeAlertCount = alerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex font-sans selection:bg-[#0F9D85] selection:text-white">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
        alertsCount={activeAlertCount}
      />

      {/* Main Container */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Top Navbar */}
        <TopNav 
          isCollapsed={isSidebarCollapsed} 
          activeTabTitle={getTabTitle()}
          onTriggerSOS={() => setIsSosModalOpen(true)} 
        />

        {/* Global Floating Toast for Emergency / Test Events */}
        {toastNotification && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] p-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  toastNotification.severity === 'DANGER' 
                    ? 'bg-[#EF4444]/15 text-[#EF4444]' 
                    : toastNotification.severity === 'WARNING'
                    ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                    : 'bg-[#0F9D85]/15 text-[#0F9D85]'
                }`}>
                  <AlertOctagon className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black text-[#6B778C] uppercase tracking-wider">
                      {toastNotification.type}
                    </span>
                    <span className="text-[10px] text-[#6B778C]">{toastNotification.time}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-[#172B4D] mt-0.5">{toastNotification.title}</h4>
                  <p className="text-xs text-[#6B778C] mt-0.5">{toastNotification.message}</p>
                </div>
              </div>
              <button 
                onClick={() => setToastNotification(null)}
                className="text-[#6B778C] hover:text-[#172B4D] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 mt-20 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>

        {/* Professional Healthcare Footer */}
        <footer className="py-5 px-8 border-t border-[#E2E8F0] bg-white/70 text-center sm:flex sm:justify-between sm:items-center text-xs text-[#6B778C]">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <span className="font-extrabold text-[#172B4D]">SmartGuard</span>
            <span>— Intelligent Mobility. Safer Independence.</span>
          </div>
          <div className="mt-2 sm:mt-0 font-medium text-[#6B778C]">
            Phase 1: High-Fidelity Frontend Evaluation • React & Tailwind CSS
          </div>
        </footer>
      </div>

      {/* Manual SOS Trigger Modal */}
      {isSosModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-rose-100 text-center animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/15 text-[#EF4444] mx-auto flex items-center justify-center mb-4">
              <AlertOctagon className="w-9 h-9 animate-bounce" />
            </div>

            <h3 className="text-xl font-black text-[#172B4D]">Transmit Emergency SOS Broadcast?</h3>
            <p className="text-xs text-[#6B778C] mt-2 font-medium leading-relaxed">
              This will activate simulated high-priority notifications to registered emergency contacts and sound the stick's 16Ω DFPlayer siren:
            </p>

            <div className="mt-4 p-3.5 rounded-2xl bg-[#F7F9FC] border border-[#E2E8F0] text-left text-xs space-y-1">
              <div className="flex items-center space-x-2 font-extrabold text-[#172B4D]">
                <PhoneCall className="w-4 h-4 text-[#0F9D85]" />
                <span>Primary Contact: {contacts.find(c => c.isPrimary)?.name || 'Guardian'}</span>
              </div>
              <div className="text-[#6B778C] font-mono pl-6">
                {contacts.find(c => c.isPrimary)?.phoneNumber || '+91 98765 43210'}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsSosModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F7F9FC] hover:bg-slate-200 text-[#172B4D] font-bold text-xs border border-[#E2E8F0] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSOS}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#EF4444] hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-[#EF4444]/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Confirm & Trigger SOS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <DeviceProvider>
      <MainApp />
    </DeviceProvider>
  );
}
