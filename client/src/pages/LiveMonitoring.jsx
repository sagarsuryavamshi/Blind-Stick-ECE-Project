import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Droplets, 
  Compass, 
  Volume2, 
  RefreshCw, 
  Info,
  Radio,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useDevice } from '../context/DeviceContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function LiveMonitoring() {
  const { deviceState, isSimulatingLiveWalk, setIsSimulatingLiveWalk, triggerSimulatedEvent } = useDevice();
  const [telemetryHistory, setTelemetryHistory] = useState([]);

  // Collect rolling live stream chart
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTelemetryHistory(prev => {
      const next = [...prev, {
        time: timestamp,
        front: deviceState.sensors.frontDistance,
        left: deviceState.sensors.leftDistance,
        right: deviceState.sensors.rightDistance,
      }];
      if (next.length > 20) next.shift();
      return next;
    });
  }, [deviceState.sensors.frontDistance, deviceState.sensors.leftDistance, deviceState.sensors.rightDistance]);

  const { frontDistance, leftDistance, rightDistance, waterDetected, fallDetected, movementStatus, accel, gyro } = deviceState.sensors;

  // Clear visual color states: Green, Amber, Red
  const getDistanceState = (dist) => {
    if (dist < 28) return { 
      text: 'text-[#EF4444]', 
      bg: 'bg-[#EF4444]', 
      badgeBg: 'bg-[#EF4444]/15',
      badgeText: 'text-[#EF4444]',
      border: 'border-[#EF4444]', 
      label: 'CRITICAL CLOSE (RED)' 
    };
    if (dist < 55) return { 
      text: 'text-[#F59E0B]', 
      bg: 'bg-[#F59E0B]', 
      badgeBg: 'bg-[#F59E0B]/15',
      badgeText: 'text-[#F59E0B]',
      border: 'border-[#F59E0B]', 
      label: 'CAUTION ZONE (AMBER)' 
    };
    return { 
      text: 'text-[#0F9D85]', 
      bg: 'bg-[#0F9D85]', 
      badgeBg: 'bg-[#0F9D85]/15',
      badgeText: 'text-[#0F9D85]',
      border: 'border-[#0F9D85]', 
      label: 'CLEAR PATH (GREEN)' 
    };
  };

  const frontState = getDistanceState(frontDistance);
  const leftState = getDistanceState(leftDistance);
  const rightState = getDistanceState(rightDistance);

  return (
    <div className="space-y-6">
      {/* Explicit DEMO DATA Notification */}
      <div className="p-3.5 px-4 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-between text-xs text-[#3B82F6]">
        <div className="flex items-center space-x-2 font-semibold">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            <strong className="font-bold">SIMULATED RADAR DATA:</strong> The readings below represent generated walking telemetry. Real ESP32 integration will map to these exact state models.
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-[#3B82F6]/30">
          DEMO MODE
        </span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] tracking-tight">
              Live Spatial Radar & Orientation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F9D85]/10 text-[#0F9D85] flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F9D85] animate-ping" />
              <span>Real-Time Stream</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B778C] mt-1 font-medium">
            3-Way Ultrasonic obstacle positioning (Front, Left, Right) with MPU6050 6-Axis motion diagnostics
          </p>
        </div>

        <button
          onClick={() => setIsSimulatingLiveWalk(!isSimulatingLiveWalk)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center space-x-2 cursor-pointer ${
            isSimulatingLiveWalk 
              ? 'bg-[#0F9D85]/15 border-[#0F9D85]/30 text-[#0F9D85]' 
              : 'bg-[#F7F9FC] border-[#E2E8F0] text-[#6B778C] hover:text-[#172B4D]'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingLiveWalk ? 'animate-spin text-[#0F9D85]' : ''}`} />
          <span>{isSimulatingLiveWalk ? 'Pause Walking Simulator' : 'Resume Walking Simulator'}</span>
        </button>
      </div>

      {/* Visual Blind Stick Sensor Layout (Showing the 3 Directions) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
          <div>
            <h2 className="text-base font-extrabold text-[#172B4D]">
              Visual Blind Stick Sensor Layout (3-Directional Field)
            </h2>
            <p className="text-xs text-[#6B778C] font-medium">
              Transducer angles: Front (0° forward path), Left (45° lateral), Right (45° lateral)
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0] text-[#172B4D]">
            HC-SR04 Trio
          </span>
        </div>

        {/* Radar Graphic Field */}
        <div className="mt-8 flex flex-col items-center justify-center relative min-h-[400px] bg-gradient-to-b from-[#F7F9FC] to-white rounded-3xl border border-[#E2E8F0] p-6 overflow-hidden">
          {/* Concentric Distance Rings */}
          <div className="absolute w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] rounded-full border border-dashed border-[#CBD5E1] pointer-events-none" />
          <div className="absolute w-[260px] h-[260px] sm:w-[320px] sm:h-[320px] rounded-full border border-dashed border-[#CBD5E1] pointer-events-none" />
          <div className="absolute w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] rounded-full border border-dashed border-[#94A3B8] pointer-events-none" />

          {/* Central Blind Stick Hardware Representation */}
          <div className="relative z-10 w-28 h-28 rounded-3xl bg-gradient-to-tr from-[#172B4D] to-[#253858] text-white flex flex-col items-center justify-center shadow-xl border-4 border-white">
            <Compass className="w-8 h-8 text-[#0F9D85] animate-pulse-subtle" />
            <span className="text-xs font-black mt-1">SmartGuard</span>
            <span className="text-[9px] text-[#CBD5E1] font-mono">ESP32 Core</span>
          </div>

          {/* FRONT SENSOR (0° - Top) */}
          <div className="absolute top-4 sm:top-6 flex flex-col items-center z-10">
            <div className={`px-4 py-2.5 rounded-2xl bg-white border-2 shadow-md transition-all ${frontState.border}`}>
              <div className="text-[10px] font-black text-[#6B778C] uppercase tracking-wider text-center">
                Front Sensor (0°)
              </div>
              <div className="flex items-baseline justify-center space-x-1 mt-0.5">
                <span className={`text-3xl font-black ${frontState.text}`}>{frontDistance}</span>
                <span className="text-xs font-bold text-[#6B778C]">cm</span>
              </div>
              <div className={`text-[10px] font-black text-center mt-0.5 ${frontState.badgeBg} ${frontState.badgeText} px-2 py-0.5 rounded-md`}>
                {frontState.label}
              </div>
            </div>
            <div className={`w-1.5 h-12 sm:h-20 mt-2 rounded-full ${
              frontDistance < 28 ? 'bg-[#EF4444] animate-pulse' : 'bg-[#0F9D85]/40'
            }`} />
          </div>

          {/* LEFT SENSOR (45° - Left) */}
          <div className="absolute left-3 sm:left-10 flex flex-col items-center z-10">
            <div className={`px-4 py-2.5 rounded-2xl bg-white border-2 shadow-md transition-all ${leftState.border}`}>
              <div className="text-[10px] font-black text-[#6B778C] uppercase tracking-wider text-center">
                Left Sensor (45°)
              </div>
              <div className="flex items-baseline justify-center space-x-1 mt-0.5">
                <span className={`text-3xl font-black ${leftState.text}`}>{leftDistance}</span>
                <span className="text-xs font-bold text-[#6B778C]">cm</span>
              </div>
              <div className={`text-[10px] font-black text-center mt-0.5 ${leftState.badgeBg} ${leftState.badgeText} px-2 py-0.5 rounded-md`}>
                {leftState.label}
              </div>
            </div>
          </div>

          {/* RIGHT SENSOR (45° - Right) */}
          <div className="absolute right-3 sm:right-10 flex flex-col items-center z-10">
            <div className={`px-4 py-2.5 rounded-2xl bg-white border-2 shadow-md transition-all ${rightState.border}`}>
              <div className="text-[10px] font-black text-[#6B778C] uppercase tracking-wider text-center">
                Right Sensor (45°)
              </div>
              <div className="flex items-baseline justify-center space-x-1 mt-0.5">
                <span className={`text-3xl font-black ${rightState.text}`}>{rightDistance}</span>
                <span className="text-xs font-bold text-[#6B778C]">cm</span>
              </div>
              <div className={`text-[10px] font-black text-center mt-0.5 ${rightState.badgeBg} ${rightState.badgeText} px-2 py-0.5 rounded-md`}>
                {rightState.label}
              </div>
            </div>
          </div>
        </div>

        {/* Animated Distance Progress Bars */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 border-t border-[#E2E8F0]">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-[#172B4D]">Front Proximity Clearance</span>
              <span className={frontState.text}>{frontDistance} cm</span>
            </div>
            <div className="w-full bg-[#E2E8F0] h-3 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${frontState.bg}`}
                style={{ width: `${Math.min(100, (frontDistance / 200) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-[#172B4D]">Left Shoulder Clearance</span>
              <span className={leftState.text}>{leftDistance} cm</span>
            </div>
            <div className="w-full bg-[#E2E8F0] h-3 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${leftState.bg}`}
                style={{ width: `${Math.min(100, (leftDistance / 200) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-[#172B4D]">Right Shoulder Clearance</span>
              <span className={rightState.text}>{rightDistance} cm</span>
            </div>
            <div className="w-full bg-[#E2E8F0] h-3 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${rightState.bg}`}
                style={{ width: `${Math.min(100, (rightDistance / 200) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Moisture Sensor, Movement Status & Fall Detection States */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Water Detection Status */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#6B778C] uppercase tracking-wider">Moisture Status</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              waterDetected ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'bg-[#0F9D85]/15 text-[#0F9D85]'
            }`}>
              {waterDetected ? 'HAZARD ACTIVE' : 'DRY GROUND'}
            </span>
          </div>

          <div className={`p-4 rounded-xl border flex items-center space-x-3.5 ${
            waterDetected ? 'bg-[#EF4444]/10 border-[#EF4444]/30' : 'bg-[#F7F9FC] border-[#E2E8F0]'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              waterDetected ? 'bg-[#EF4444] text-white' : 'bg-[#3B82F6] text-white'
            }`}>
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#172B4D]">
                {waterDetected ? 'Puddle Hazard Detected!' : 'Normal Dry Pavement'}
              </h4>
              <p className="text-xs text-[#6B778C] mt-0.5">
                {waterDetected ? 'Speaker cue track 3 active.' : 'Probe conductivity nominal.'}
              </p>
            </div>
          </div>
        </div>

        {/* Movement Status (MPU6050) */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#6B778C] uppercase tracking-wider">Movement State</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#3B82F6]/15 text-[#3B82F6]">
              MPU6050
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0]">
            <div className="text-xs text-[#6B778C] font-semibold">User Motion Dynamics</div>
            <div className="text-lg font-black text-[#172B4D] mt-1">{movementStatus}</div>
            <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[10px] text-center">
              <div className="bg-white p-1.5 rounded-lg border border-[#E2E8F0]">
                <span className="text-[#6B778C] block">X</span>
                <span className="font-bold text-[#172B4D]">{accel?.x ?? '0.04'}g</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-[#E2E8F0]">
                <span className="text-[#6B778C] block">Y</span>
                <span className="font-bold text-[#172B4D]">{accel?.y ?? '0.09'}g</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-[#E2E8F0]">
                <span className="text-[#6B778C] block">Z</span>
                <span className="font-bold text-[#172B4D]">{accel?.z ?? '9.81'}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fall Detection Status */}
        <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <span className="text-xs font-bold text-[#6B778C] uppercase tracking-wider">Fall Detection</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              fallDetected ? 'bg-[#EF4444] text-white animate-pulse' : 'bg-[#0F9D85]/15 text-[#0F9D85]'
            }`}>
              {fallDetected ? 'CRITICAL FALL' : 'STABLE'}
            </span>
          </div>

          <div className={`p-4 rounded-xl border flex items-center space-x-3.5 ${
            fallDetected ? 'bg-[#EF4444] text-white border-[#EF4444]' : 'bg-[#F7F9FC] border-[#E2E8F0]'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              fallDetected ? 'bg-white text-[#EF4444]' : 'bg-[#0F9D85] text-white'
            }`}>
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h4 className={`text-sm font-bold ${fallDetected ? 'text-white' : 'text-[#172B4D]'}`}>
                {fallDetected ? 'Fall Impact Registered!' : 'Vertical Incline Normal'}
              </h4>
              <p className={`text-xs mt-0.5 ${fallDetected ? 'text-white/80' : 'text-[#6B778C]'}`}>
                {fallDetected ? 'Auto-SMS triggered to contacts.' : 'Free-fall algorithm running.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rolling Real-time Sensor Distance Graph */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E2E8F0]">
          <div>
            <h3 className="text-base font-extrabold text-[#172B4D]">Live Rolling Distance Streams</h3>
            <p className="text-xs text-[#6B778C] font-medium">Last 20 polling frames across all three transducers (cm)</p>
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
            <LineChart data={telemetryHistory}>
              <XAxis dataKey="time" stroke="#6B778C" fontSize={10} tickLine={false} />
              <YAxis stroke="#6B778C" fontSize={10} tickLine={false} unit="cm" domain={[0, 180]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', borderColor: '#E2E8F0' }}
              />
              <Line type="monotone" dataKey="front" stroke="#0F9D85" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="left" stroke="#3B82F6" strokeWidth={2} dot={false} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="right" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
