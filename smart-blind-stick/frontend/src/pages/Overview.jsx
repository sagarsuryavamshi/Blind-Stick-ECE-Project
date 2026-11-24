import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Radio, 
  Droplet, 
  BatteryMedium, 
  Clock, 
  Activity, 
  ArrowUpRight,
  Eye,
  CheckCircle2,
  Info,
  Database,
  RefreshCw
} from 'lucide-react';
import { useDevice } from '../context/DeviceContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Overview({ onNavigate }) {
  const { 
    appMode,
    deviceState, 
    alerts, 
    activitySeries, 
    isBackendHealthy,
    backendHealthData,
    triggerSimulatedEvent,
    fetchBackendData
  } = useDevice();

  const isOnline = deviceState.status !== 'OFFLINE';
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');

  // Calculate obstacle and danger stats
  const totalAlertsCount = alerts.length;
  const isBatteryAvailable = deviceState.batteryLevel !== null && deviceState.batteryLevel !== undefined;

  const getSafetyCardState = () => {
    if (!isOnline) {
      return {
        bg: 'bg-slate-50 border-slate-200',
        textColor: 'text-slate-700',
        dotColor: 'bg-slate-400',
        title: 'DEVICE OFFLINE',
        sub: 'ESP32 has not communicated in over 20 seconds. Last known telemetry preserved.'
      };
    }
    if (deviceState.status === 'EMERGENCY' || deviceState.sensors.fallDetected) {
      return {
        bg: 'bg-[#EF4444]/10 border-[#EF4444]/30',
        textColor: 'text-[#EF4444]',
        dotColor: 'bg-[#EF4444]',
        title: 'CRITICAL EMERGENCY ACTIVE',
        sub: 'Fall impact or manual SOS in progress. Immediate caregiver assistance advised.'
      };
    }
    if (deviceState.sensors.waterDetected || deviceState.sensors.frontDistance < 28) {
      return {
        bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/30',
        textColor: 'text-[#F59E0B]',
        dotColor: 'bg-[#F59E0B]',
        title: 'WARNING LEVEL: HAZARD DETECTED',
        sub: 'Obstacle in close buffer or surface water puddle detected on path.'
      };
    }
    return {
      bg: 'bg-[#0F9D85]/10 border-[#0F9D85]/30',
      textColor: 'text-[#0F9D85]',
      dotColor: 'bg-[#0F9D85]',
      title: 'ALL SYSTEMS SAFE & CLEAR',
      sub: 'Path unobstructed • Normal orientation • Hardware active'
    };
  };

  const safety = getSafetyCardState();

  return (
    <div className="space-y-6">
      {/* Mode Transparency Banner */}
      <div className={`p-3.5 px-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 ${
        appMode === 'LIVE'
          ? 'bg-[#0F9D85]/10 border-[#0F9D85]/30 text-[#0F9D85]'
          : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
      }`}>
        <div className="flex items-center space-x-2 font-semibold">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            {appMode === 'LIVE' ? (
              <>
                <strong className="font-bold">LIVE MODE ACTIVE:</strong> Connected to Node.js backend ({backendHealthData?.database?.connected ? 'MongoDB Atlas Persistent Storage' : 'In-Memory Development Mode'}). Telemetry updates in real-time via Socket.IO.
              </>
            ) : (
              <>
                <strong className="font-bold">DEMO MODE ACTIVE:</strong> Generating simulated walking distance and tilt variations for evaluation.
              </>
            )}
          </span>
        </div>
        <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
          <button 
            onClick={fetchBackendData}
            className="flex items-center space-x-1 font-bold bg-white px-2 py-0.5 rounded-lg border text-[11px] shadow-2xs hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 text-[#172B4D]" />
            <span className="text-[#172B4D]">Sync</span>
          </button>
        </div>
      </div>

      {/* Welcome Heading */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] tracking-tight">
              Guardian Control Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F9D85]/10 text-[#0F9D85]">
              Active Supervision
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B778C] mt-1 font-medium">
            Monitoring Smart Stick node: <span className="font-bold text-[#172B4D]">BLINDSTICK001</span> (SmartGuard Pro v2)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('live')}
            className="px-4 py-2 rounded-xl bg-[#0F9D85] hover:bg-[#0c826e] text-white font-bold text-xs transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Live Radar View</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Large Visual Safety-Status Card */}
      <div className={`p-6 sm:p-7 rounded-2xl border transition-all ${safety.bg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck className={`w-8 h-8 ${safety.textColor}`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${safety.dotColor} animate-pulse`} />
                <span className={`text-xs font-black uppercase tracking-wider ${safety.textColor}`}>
                  Safety Diagnostic
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#172B4D] mt-0.5 leading-tight">
                {safety.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#6B778C] font-medium mt-1">
                {safety.sub}
              </p>
            </div>
          </div>

          {/* Quick Interactive Hardware / Simulation Triggers */}
          <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-white flex flex-wrap items-center gap-2 self-start md:self-auto">
            <span className="text-[11px] font-bold text-[#6B778C] mr-1">Triggers:</span>
            <button
              onClick={() => triggerSimulatedEvent('FALL')}
              className="px-2.5 py-1 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] text-xs font-bold transition-all cursor-pointer"
            >
              Test Fall
            </button>
            <button
              onClick={() => triggerSimulatedEvent('WATER')}
              className="px-2.5 py-1 rounded-lg bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 text-[#3B82F6] text-xs font-bold transition-all cursor-pointer"
            >
              Test Water
            </button>
            <button
              onClick={() => triggerSimulatedEvent('RESET_HAZARDS')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#172B4D] text-xs font-bold transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Connection Status */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs hover:border-[#0F9D85]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B778C] uppercase tracking-wider">Smart Stick Status</span>
            <div className="w-8 h-8 rounded-xl bg-[#0F9D85]/10 text-[#0F9D85] flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className={`text-2xl font-black ${isOnline ? 'text-[#0F9D85]' : 'text-slate-400'}`}>
              {isOnline ? deviceState.status : 'OFFLINE'}
            </span>
            <span className="text-xs font-bold text-[#6B778C]">20s threshold</span>
          </div>
          <div className="mt-2 text-xs text-[#6B778C] flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-[#6B778C]" />
            <span>
              Last seen: {deviceState.lastSeen ? new Date(deviceState.lastSeen).toLocaleTimeString() : 'Awaiting sync'}
            </span>
          </div>
        </div>

        {/* Total Obstacles / Telemetry */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs hover:border-[#3B82F6]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B778C] uppercase tracking-wider">Obstacle Clearance</span>
            <div className="w-8 h-8 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#172B4D]">{deviceState.sensors.frontDistance}</span>
            <span className="text-xs font-bold text-[#6B778C]">cm forward</span>
          </div>
          <div className="mt-2 text-xs text-[#0F9D85] font-semibold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{deviceState.sensors.frontDistance < 28 ? 'Caution close object' : 'Path guidance nominal'}</span>
          </div>
        </div>

        {/* Total Emergency Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs hover:border-[#EF4444]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B778C] uppercase tracking-wider">Emergency Incidents</span>
            <div className="w-8 h-8 rounded-xl bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-black text-[#172B4D]">{totalAlertsCount}</span>
            <span className="text-xs font-bold text-[#EF4444]">{activeAlerts.length} active</span>
          </div>
          <div className="mt-2 text-xs text-[#6B778C]">
            {activeAlerts.length > 0 ? '⚠️ Caregiver verification needed' : 'All incidents resolved'}
          </div>
        </div>

        {/* Battery Power */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs hover:border-[#0F9D85]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B778C] uppercase tracking-wider">Battery Power</span>
            <div className="w-8 h-8 rounded-xl bg-[#0F9D85]/10 text-[#0F9D85] flex items-center justify-center">
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            {isBatteryAvailable ? (
              <>
                <span className="text-2xl font-black text-[#172B4D]">{deviceState.batteryLevel}%</span>
                <span className="text-xs font-bold text-[#0F9D85]">Li-ion 3.7V</span>
              </>
            ) : (
              <>
                <span className="text-lg font-black text-slate-400">Not Measured</span>
                <span className="text-[10px] text-slate-400">ESP32 USB Direct</span>
              </>
            )}
          </div>
          <div className="mt-3 w-full bg-[#E2E8F0] rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                isBatteryAvailable && deviceState.batteryLevel > 30 ? 'bg-[#0F9D85]' : 'bg-[#EF4444]'
              }`}
              style={{ width: `${isBatteryAvailable ? deviceState.batteryLevel : 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sensor Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider">
            Live Sensory Telemetry
          </h3>
          <span className="text-xs text-[#6B778C] font-medium">Socket.IO real-time stream</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Front Ultrasonic */}
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs hover:border-[#0F9D85]/40 transition-all">
            <div className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider">Front Distance (0°)</div>
            <div className="mt-2 flex items-baseline space-x-1">
              <span className={`text-2xl font-black ${
                deviceState.sensors.frontDistance < 28 ? 'text-[#EF4444]' : 'text-[#172B4D]'
              }`}>
                {deviceState.sensors.frontDistance}
              </span>
              <span className="text-xs font-bold text-[#6B778C]">cm</span>
            </div>
            <div className={`mt-1 text-[11px] font-bold ${
              deviceState.sensors.frontDistance < 28 ? 'text-[#EF4444]' : 'text-[#0F9D85]'
            }`}>
              {deviceState.sensors.frontDistance < 28 ? 'Proximity Alert' : 'Forward Clear'}
            </div>
          </div>

          {/* Left Ultrasonic */}
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs hover:border-[#0F9D85]/40 transition-all">
            <div className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider">Left Distance (45°)</div>
            <div className="mt-2 flex items-baseline space-x-1">
              <span className={`text-2xl font-black ${
                deviceState.sensors.leftDistance < 24 ? 'text-[#F59E0B]' : 'text-[#172B4D]'
              }`}>
                {deviceState.sensors.leftDistance}
              </span>
              <span className="text-xs font-bold text-[#6B778C]">cm</span>
            </div>
            <div className={`mt-1 text-[11px] font-bold ${
              deviceState.sensors.leftDistance < 24 ? 'text-[#F59E0B]' : 'text-[#0F9D85]'
            }`}>
              {deviceState.sensors.leftDistance < 24 ? 'Wall / Pillar' : 'Left Clear'}
            </div>
          </div>

          {/* Right Ultrasonic */}
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs hover:border-[#0F9D85]/40 transition-all">
            <div className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider">Right Distance (45°)</div>
            <div className="mt-2 flex items-baseline space-x-1">
              <span className={`text-2xl font-black ${
                deviceState.sensors.rightDistance < 24 ? 'text-[#F59E0B]' : 'text-[#172B4D]'
              }`}>
                {deviceState.sensors.rightDistance}
              </span>
              <span className="text-xs font-bold text-[#6B778C]">cm</span>
            </div>
            <div className={`mt-1 text-[11px] font-bold ${
              deviceState.sensors.rightDistance < 24 ? 'text-[#F59E0B]' : 'text-[#0F9D85]'
            }`}>
              {deviceState.sensors.rightDistance < 24 ? 'Right Proximity' : 'Right Clear'}
            </div>
          </div>

          {/* Moisture Sensor */}
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs hover:border-[#3B82F6]/40 transition-all">
            <div className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider">Moisture Sensor</div>
            <div className="mt-2 flex items-baseline space-x-1">
              <span className="text-xl font-black text-[#172B4D]">
                {deviceState.sensors.waterDetected ? 'HAZARD' : 'DRY'}
              </span>
            </div>
            <div className={`mt-1 text-[11px] font-bold ${
              deviceState.sensors.waterDetected ? 'text-[#EF4444]' : 'text-[#0F9D85]'
            }`}>
              {deviceState.sensors.waterDetected ? 'Liquid Submersion' : 'Dry Pavement'}
            </div>
          </div>

          {/* MPU6050 Motion */}
          <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-2xs hover:border-[#0F9D85]/40 transition-all">
            <div className="text-[10px] font-bold text-[#6B778C] uppercase tracking-wider">MPU6050 Motion</div>
            <div className="mt-2 flex items-baseline space-x-1">
              <span className="text-base font-black text-[#172B4D] truncate">
                {deviceState.sensors.movementStatus}
              </span>
            </div>
            <div className="mt-1 text-[11px] font-bold text-[#0F9D85]">
              {deviceState.sensors.fallDetected ? '⚠️ IMPACT TILT' : 'Orientation Nominal'}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Trends Area Chart */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-base font-extrabold text-[#172B4D]">Sensor Activity Over Time</h3>
            <p className="text-xs text-[#6B778C] font-medium">Obstacle distance trajectory across forward walking vectors (cm)</p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-bold">
            <span className="flex items-center space-x-1.5 text-[#0F9D85]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F9D85]"></span>
              <span>Front</span>
            </span>
            <span className="flex items-center space-x-1.5 text-[#3B82F6]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
              <span>Left</span>
            </span>
            <span className="flex items-center space-x-1.5 text-[#F59E0B]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
              <span>Right</span>
            </span>
          </div>
        </div>

        <div className="h-64 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activitySeries}>
              <defs>
                <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F9D85" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0F9D85" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#6B778C" fontSize={11} tickLine={false} />
              <YAxis stroke="#6B778C" fontSize={11} tickLine={false} unit="cm" domain={[0, 160]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '12px', 
                  borderColor: '#E2E8F0', 
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              />
              <Area type="monotone" dataKey="front" stroke="#0F9D85" strokeWidth={2.5} fillOpacity={1} fill="url(#primaryGrad)" />
              <Area type="monotone" dataKey="left" stroke="#3B82F6" strokeWidth={2} fillOpacity={0} />
              <Area type="monotone" dataKey="right" stroke="#F59E0B" strokeWidth={2} strokeDasharray="4 4" fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
