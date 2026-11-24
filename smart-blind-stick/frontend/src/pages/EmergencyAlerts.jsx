import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PhoneCall, 
  Flame, 
  Droplet, 
  Info,
  Check,
  RefreshCw,
  MessageSquare,
  PhoneForwarded,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useDevice } from '../context/DeviceContext';
import { api } from '../services/api';

export default function EmergencyAlerts() {
  const { 
    appMode,
    alerts, 
    resolveAlert, 
    contacts, 
    triggerSimulatedEvent,
    fetchBackendData
  } = useDevice();

  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  // Emergency Notification History
  const [notificationLogs, setNotificationLogs] = useState([]);

  const fetchNotificationLogs = async () => {
    if (appMode === 'LIVE') {
      try {
        const res = await api.getNotificationHistory();
        if (res.data) setNotificationLogs(res.data);
      } catch (e) {
        console.warn('Failed to fetch notification history:', e.message);
      }
    }
  };

  useEffect(() => {
    fetchNotificationLogs();
  }, [appMode, alerts]);

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    if (filterCategory !== 'ALL' && a.category !== filterCategory && a.alertType !== filterCategory) return false;
    return true;
  });

  const activeEmergency = alerts.find(a => a.severity === 'DANGER' && a.status === 'ACTIVE');
  const primaryContact = contacts.find(c => c.isPrimary) || contacts[0];

  return (
    <div className="space-y-6">
      {/* Backend Status Transparency Banner */}
      <div className="p-3.5 px-4 rounded-2xl bg-[#0F9D85]/10 border border-[#0F9D85]/20 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#0F9D85] gap-2">
        <div className="flex items-center space-x-2 font-semibold">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            {appMode === 'LIVE' ? (
              <>
                <strong className="font-bold">SYSTEM ARCHITECTURE:</strong> Autonomous on-device emergency communication. Emergency alerts are dispatched directly via dedicated hardware.
              </>
            ) : (
              <>
                <strong className="font-bold">DEMO ENVIRONMENT:</strong> Simulating incident notifications and false-alarm workflows.
              </>
            )}
          </span>
        </div>
        <button
          onClick={() => { fetchBackendData(); fetchNotificationLogs(); }}
          className="flex items-center space-x-1 font-bold bg-white text-[#172B4D] px-2 py-0.5 rounded-lg border text-[11px] shadow-2xs hover:bg-slate-50 cursor-pointer self-end sm:self-auto"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] tracking-tight">
              Emergency Alerts & Dispatch History
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EF4444]/15 text-[#EF4444]">
              Priority Safety
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B778C] mt-1 font-medium">
            Active and historical fall alerts, moisture hazards, manual SOS dispatches, and emergency delivery tracking
          </p>
        </div>

        {/* Emergency Manual Trigger Action */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => triggerSimulatedEvent('MANUAL_SOS')}
            className="px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#dc2626] active:scale-95 text-white font-bold text-xs shadow-md shadow-[#EF4444]/25 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4 animate-bounce" />
            <span>Trigger SOS</span>
          </button>
        </div>
      </div>

      {/* Test Notification Feedback */}
      {testNotificationFeedback && (
        <div className={`p-4 rounded-xl border flex items-center space-x-2 text-xs font-bold animate-in fade-in ${
          testNotificationFeedback.type === 'SUCCESS'
            ? 'bg-[#0F9D85]/15 border-[#0F9D85]/30 text-[#0F9D85]'
            : testNotificationFeedback.type === 'ERROR'
            ? 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
            : 'bg-[#3B82F6]/15 border-[#3B82F6]/30 text-[#3B82F6]'
        }`}>
          <Sparkles className="w-4 h-4" />
          <span>{testNotificationFeedback.text}</span>
        </div>
      )}

      {/* Prominent Red Emergency Interface (If Active Emergency in Progress) */}
      {activeEmergency && (
        <div className="bg-gradient-to-r from-[#EF4444] via-rose-600 to-[#EF4444] rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-[#EF4444]/25 border border-rose-500 animate-in fade-in duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                <AlertOctagon className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white text-[#EF4444] uppercase tracking-wider">
                  ACTIVE CRITICAL EMERGENCY
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 leading-snug">
                  {activeEmergency.title || activeEmergency.alertType}
                </h2>
                <p className="text-rose-100 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
                  {activeEmergency.description}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-rose-100">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Time: {new Date(activeEmergency.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Target: {activeEmergency.recipient || primaryContact?.name || 'Primary Guardian'}</span>
                  </span>
                  <span className="flex items-center space-x-1 font-mono text-[11px] bg-white/10 px-2 py-0.5 rounded">
                    <span>Status: {activeEmergency.notificationStatus}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Caregiver Actions: Resolve or False Alarm */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={() => resolveAlert(activeEmergency._id || activeEmergency.id, 'RESOLVE')}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#172B4D] font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#0F9D85]" />
                <span>Assistance Handled (Resolve)</span>
              </button>
              <button
                onClick={() => resolveAlert(activeEmergency._id || activeEmergency.id, 'FALSE_ALARM')}
                className="px-5 py-2.5 rounded-xl bg-rose-900/60 hover:bg-rose-900/80 border border-white/30 text-white font-bold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4 text-rose-200" />
                <span>Mark False Alarm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Outbound Dispatch Audit Panel */}
      {notificationLogs.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <span className="text-xs font-black text-[#0F9D85] uppercase tracking-wider">Communication Gateway Log</span>
              <h3 className="text-base font-extrabold text-[#172B4D]">Outbound Dispatch History</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F7F9FC] border border-[#E2E8F0] text-[#172B4D]">
              {notificationLogs.length} attempts tracked
            </span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {notificationLogs.map((log) => {
              const lid = log._id || log.id;
              const isVoice = log.channel === 'VOICE';
              const isSuccess = ['delivered', 'completed', 'sent', 'answered', 'queued'].includes(log.status);

              return (
                <div key={lid} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0] gap-2 text-xs">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isVoice ? 'bg-[#3B82F6]/15 text-[#3B82F6]' : 'bg-[#0F9D85]/15 text-[#0F9D85]'
                    }`}>
                      {isVoice ? <PhoneForwarded className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-[#172B4D]">{log.recipientName}</span>
                        <span className="font-mono text-[11px] text-[#6B778C]">{log.destinationNumber}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isSuccess ? 'bg-[#0F9D85]/15 text-[#0F9D85]' : 'bg-[#EF4444]/15 text-[#EF4444]'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B778C] mt-1 line-clamp-1">{log.messageContent}</p>
                      {log.errorDetails?.message && (
                        <p className="text-[10px] text-[#EF4444] font-medium mt-0.5">
                          ⚠️ Provider notice: {log.errorDetails.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-[#6B778C] shrink-0 self-end sm:self-center">
                    {log.providerSid && <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">{log.providerSid.slice(0, 14)}...</span>}
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Bar & Event Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-extrabold text-[#172B4D]">Incident Audit Records</h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F7F9FC] border border-[#E2E8F0] text-[#172B4D]">
              {filteredAlerts.length} events
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] text-xs font-bold text-[#172B4D] focus:outline-[#0F9D85]"
            >
              <option value="ALL">All Categories</option>
              <option value="Fall Events">Fall Events</option>
              <option value="Water Detections">Water Hazard</option>
              <option value="Obstacle Detections">Obstacles</option>
              <option value="Emergency Notifications">Emergency SOS</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] text-xs font-bold text-[#172B4D] focus:outline-[#0F9D85]"
            >
              <option value="ALL">All Severities</option>
              <option value="DANGER">Critical (Red)</option>
              <option value="WARNING">Warning (Amber)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] text-xs font-bold text-[#172B4D] focus:outline-[#0F9D85]"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="RESOLVED">Resolved</option>
              <option value="FALSE_ALARM">False Alarm</option>
            </select>
          </div>
        </div>

        {/* Timeline Event List */}
        <div className="divide-y divide-[#E2E8F0]">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => {
              const aid = alert._id || alert.id;
              const typeString = alert.alertType || alert.type || 'EMERGENCY';
              return (
                <div 
                  key={aid}
                  className={`p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                    alert.status === 'ACTIVE' && alert.severity === 'DANGER'
                      ? 'bg-[#EF4444]/5'
                      : 'hover:bg-[#F7F9FC]/70'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.severity === 'DANGER'
                        ? 'bg-[#EF4444]/15 text-[#EF4444]'
                        : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                    }`}>
                      {typeString === 'FALL_DETECTED' ? (
                        <Flame className="w-5 h-5" />
                      ) : typeString === 'WATER_HAZARD' ? (
                        <Droplet className="w-5 h-5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          alert.severity === 'DANGER' ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs font-bold text-[#172B4D]">
                          {alert.title || typeString.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          alert.status === 'ACTIVE' 
                            ? 'bg-[#0F9D85]/15 text-[#0F9D85]' 
                            : alert.status === 'FALSE_ALARM'
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-[#E2E8F0] text-[#172B4D]'
                        }`}>
                          {alert.status}
                        </span>
                      </div>

                      <p className="text-xs text-[#6B778C] mt-1 font-medium leading-relaxed">
                        {alert.description}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#6B778C]">
                        <span>Time: {new Date(alert.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        <span className="font-semibold text-[#0F9D85]">{alert.notificationStatus}</span>
                        {alert.recipient && <span>• Target: {alert.recipient}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                    {alert.status === 'ACTIVE' ? (
                      <>
                        <button
                          onClick={() => resolveAlert(aid, 'RESOLVE')}
                          className="px-3 py-1.5 rounded-xl bg-[#0F9D85] hover:bg-[#0c826e] text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve</span>
                        </button>
                        <button
                          onClick={() => resolveAlert(aid, 'FALSE_ALARM')}
                          className="px-3 py-1.5 rounded-xl bg-[#F7F9FC] hover:bg-slate-200 text-[#172B4D] font-bold text-xs border border-[#E2E8F0] transition-all cursor-pointer"
                        >
                          False Alarm
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-medium text-[#6B778C] italic">
                        {alert.status === 'FALSE_ALARM' ? 'Marked False Alarm' : 'Resolved'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-[#6B778C] text-sm font-medium">
              No matching alerts found for selected filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
