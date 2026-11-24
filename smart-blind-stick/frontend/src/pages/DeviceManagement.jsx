import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Wifi, 
  Battery, 
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  HelpCircle,
  Clock,
  Radio,
  Volume2,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Info,
  Layers,
  Wrench,
  Zap,
  Cable,
  Hash
} from 'lucide-react';
import { useDevice } from '../context/DeviceContext';
import { api } from '../services/api';

export default function DeviceManagement() {
  const { 
    appMode,
    deviceState, 
    backendHealthData,
    fetchBackendData 
  } = useDevice();

  const [componentsData, setComponentsData] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const fetchHardwareData = async () => {
    setIsLoading(true);
    try {
      if (appMode === 'LIVE') {
        const res = await api.getHardwareComponents();
        if (res.success && res.components) {
          setComponentsData(res);
        }
      }
    } catch (err) {
      console.warn('Could not fetch hardware components:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHardwareData();
    const interval = setInterval(fetchHardwareData, 6000);
    return () => clearInterval(interval);
  }, [appMode]);

  // Fallback default list matching exact inventory if backend hasn't responded yet
  const rawComponents = componentsData?.components || [
    {
      id: 'mcu-esp32',
      name: 'ESP32 DevKit V1',
      category: 'Processing & Core Logic',
      quantity: 1,
      purpose: 'Main microcontroller and communication unit',
      monitoringType: 'Bidirectional Telemetry & Heartbeat',
      status: deviceState.status === 'OFFLINE' ? 'OFFLINE' : 'ONLINE',
      statusReason: deviceState.status === 'OFFLINE' ? 'ESP32 offline or awaiting heartbeat' : 'Active telemetry streaming',
      isPassive: false,
      lastUpdated: deviceState.lastSeen,
    },
    {
      id: 'sensor-ultrasonic-front',
      name: 'Ultrasonic Sensor (Front)',
      category: 'Obstacle Detection',
      quantity: 1,
      purpose: 'Front forward corridor obstacle detection (HC-SR04, Trig 23 / Echo 22)',
      monitoringType: 'Active Telemetry Distance Stream',
      status: deviceState.status === 'OFFLINE' ? 'UNKNOWN' : (deviceState.sensors?.frontDistance < 28 ? 'WARNING' : 'ONLINE'),
      statusReason: deviceState.status === 'OFFLINE' ? 'Awaiting distance telemetry' : `Clearance: ${deviceState.sensors?.frontDistance || 0} cm`,
      isPassive: false,
      lastUpdated: deviceState.lastSeen,
    },
    {
      id: 'sensor-ultrasonic-left',
      name: 'Ultrasonic Sensor (Left)',
      category: 'Obstacle Detection',
      quantity: 1,
      purpose: 'Left shoulder 45° obstacle detection (HC-SR04, Trig 19 / Echo 18)',
      monitoringType: 'Active Telemetry Distance Stream',
      status: deviceState.status === 'OFFLINE' ? 'UNKNOWN' : (deviceState.sensors?.leftDistance < 28 ? 'WARNING' : 'ONLINE'),
      statusReason: deviceState.status === 'OFFLINE' ? 'Awaiting distance telemetry' : `Clearance: ${deviceState.sensors?.leftDistance || 0} cm`,
      isPassive: false,
      lastUpdated: deviceState.lastSeen,
    },
    {
      id: 'sensor-ultrasonic-right',
      name: 'Ultrasonic Sensor (Right)',
      category: 'Obstacle Detection',
      quantity: 1,
      purpose: 'Right shoulder 45° obstacle detection (HC-SR04, Trig 5 / Echo 17)',
      monitoringType: 'Active Telemetry Distance Stream',
      status: deviceState.status === 'OFFLINE' ? 'UNKNOWN' : (deviceState.sensors?.rightDistance < 28 ? 'WARNING' : 'ONLINE'),
      statusReason: deviceState.status === 'OFFLINE' ? 'Awaiting distance telemetry' : `Clearance: ${deviceState.sensors?.rightDistance || 0} cm`,
      isPassive: false,
      lastUpdated: deviceState.lastSeen,
    },
    {
      id: 'sensor-moisture',
      name: 'Moisture Detection Sensor',
      category: 'Environmental Hazard',
      quantity: 1,
      purpose: 'Water and puddle detection on walkway (ADC1 GPIO 34)',
      monitoringType: 'Active Telemetry Binary & ADC Stream',
      status: deviceState.status === 'OFFLINE' ? 'UNKNOWN' : (deviceState.sensors?.waterDetected ? 'WARNING' : 'ONLINE'),
      statusReason: deviceState.sensors?.waterDetected ? 'Surface moisture detected' : 'Dry walkway confirmed',
      isPassive: false,
      lastUpdated: deviceState.lastSeen,
    },
    {
      id: 'sensor-mpu6050',
      name: 'MPU6050 6-Axis IMU',
      category: 'Motion & Orientation',
      quantity: 1,
      purpose: 'Motion dynamics, orientation angles, and fall impact detection (I2C SDA 21 / SCL 19)',
      monitoringType: 'Active Telemetry 6-Axis Stream',
      status: deviceState.status === 'OFFLINE' ? 'UNKNOWN' : (deviceState.sensors?.fallDetected ? 'WARNING' : 'ONLINE'),
      statusReason: deviceState.status === 'OFFLINE' ? 'Awaiting I2C motion stream' : `Dynamic state: ${deviceState.movementStatus || 'Active Walking'}`,
      isPassive: false,
      lastUpdated: deviceState.lastSeen,
    },
    {
      id: 'audio-mp3-tf-16p',
      name: 'MP3-TF-16P V3.0 (DFPlayer Mini)',
      category: 'Audio Feedback',
      quantity: 1,
      purpose: 'Audio playback and voice alerts for obstacle, water, and fall warnings (UART2 RX 16 / TX 4)',
      monitoringType: 'UART Command State (Unidirectional)',
      status: deviceState.status === 'OFFLINE' ? 'OFFLINE' : 'ONLINE',
      statusReason: deviceState.status === 'OFFLINE' ? 'Host MCU offline' : 'UART2 audio commands initialized',
      isPassive: false,
      lastUpdated: deviceState.lastSeen,
    },
    {
      id: 'audio-speaker',
      name: 'Speaker (16Ω, 0.25W)',
      category: 'Audio Output',
      quantity: 1,
      purpose: '16Ω, 0.25W physical acoustic sound output connected to MP3-TF-16P module',
      monitoringType: 'Analog Transducer (No Digital Return Channel)',
      status: 'NOT MONITORED',
      statusReason: 'Passive analog speaker has no return digital communication channel.',
      isPassive: true,
      lastUpdated: null,
    },
    {
      id: 'comm-sim900a',
      name: 'SIM900A GSM Module',
      category: 'Emergency Communication',
      quantity: 1,
      purpose: 'Direct emergency SMS and autonomous outgoing voice calls via UART AT commands',
      monitoringType: 'Cellular AT Interface (Firmware Pending)',
      status: 'NOT CONFIGURED',
      statusReason: 'SIM900A UART driver integration scheduled for next phase. No cellular telemetry yet.',
      isPassive: false,
      lastUpdated: null,
    },
    {
      id: 'power-source',
      name: 'Power Bank',
      category: 'Power Supply',
      quantity: 1,
      purpose: 'Portable power supply providing system 5V DC rail',
      monitoringType: 'Direct DC Rail (No Battery Resistor Divider Detected)',
      status: 'NOT MONITORED',
      statusReason: 'ESP32 circuit has no resistor voltage divider wired to an ADC pin for power measurement.',
      isPassive: false,
      lastUpdated: null,
    },
    {
      id: 'passive-breadboard',
      name: 'Breadboard',
      category: 'Prototyping Framework',
      quantity: 1,
      purpose: 'Prototype circuit assembly and rail distribution',
      monitoringType: 'Physical Passive Component',
      status: 'NOT MONITORED',
      statusReason: 'Physical circuit board with no digital feedback.',
      isPassive: true,
      lastUpdated: null,
    },
    {
      id: 'passive-resistors',
      name: 'Resistors (1kΩ and 2kΩ)',
      category: 'Circuit Electronics',
      quantity: '1kΩ & 2kΩ (As required)',
      purpose: 'Signal conditioning, pull-ups, and voltage divider levels',
      monitoringType: 'Passive Circuit Components',
      status: 'NOT MONITORED',
      statusReason: 'Passive electronic components with no telemetry channel.',
      isPassive: true,
      lastUpdated: null,
    },
    {
      id: 'passive-cables',
      name: 'Connecting Cables',
      category: 'Wiring & Interconnects',
      quantity: 'As required',
      purpose: 'Electrical jumper and point-to-point connections between sensor modules',
      monitoringType: 'Passive Interconnects',
      status: 'NOT MONITORED',
      statusReason: 'Physical copper wiring with no software telemetry.',
      isPassive: true,
      lastUpdated: null,
    },
  ];

  const summary = componentsData?.summary || {
    totalComponents: rawComponents.length,
    onlineCount: rawComponents.filter(c => c.status === 'ONLINE').length,
    warningCount: rawComponents.filter(c => c.status === 'WARNING').length,
    offlineCount: rawComponents.filter(c => c.status === 'OFFLINE').length,
    notMonitoredCount: rawComponents.filter(c => c.status === 'NOT MONITORED').length,
    notConfiguredCount: rawComponents.filter(c => c.status === 'NOT CONFIGURED').length,
    unknownCount: rawComponents.filter(c => c.status === 'UNKNOWN').length,
  };

  const filteredComponents = rawComponents.filter(c => {
    if (filterCategory !== 'ALL' && c.category !== filterCategory) return false;
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ONLINE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#0F9D85]/15 text-[#0F9D85] flex items-center space-x-1 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ONLINE</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#F59E0B]/15 text-[#F59E0B] flex items-center space-x-1 shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>WARNING</span>
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#EF4444]/15 text-[#EF4444] flex items-center space-x-1 shrink-0">
            <XCircle className="w-3.5 h-3.5" />
            <span>OFFLINE</span>
          </span>
        );
      case 'NOT MONITORED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-500 flex items-center space-x-1 shrink-0">
            <Layers className="w-3.5 h-3.5" />
            <span>NOT MONITORED</span>
          </span>
        );
      case 'NOT CONFIGURED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#3B82F6]/15 text-[#3B82F6] flex items-center space-x-1 shrink-0">
            <Wrench className="w-3.5 h-3.5" />
            <span>NOT CONFIGURED</span>
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-600 flex items-center space-x-1 shrink-0">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>UNKNOWN</span>
          </span>
        );
    }
  };

  const getComponentIcon = (id) => {
    if (id.includes('esp32')) return <Cpu className="w-5 h-5 text-[#0F9D85]" />;
    if (id.includes('ultrasonic')) return <Radio className="w-5 h-5 text-[#3B82F6]" />;
    if (id.includes('moisture')) return <Zap className="w-5 h-5 text-[#0F9D85]" />;
    if (id.includes('mpu6050')) return <Sliders className="w-5 h-5 text-[#F59E0B]" />;
    if (id.includes('mp3')) return <Volume2 className="w-5 h-5 text-[#0F9D85]" />;
    if (id.includes('speaker')) return <Volume2 className="w-5 h-5 text-slate-500" />;
    if (id.includes('sim900a')) return <Radio className="w-5 h-5 text-[#3B82F6]" />;
    if (id.includes('power')) return <Battery className="w-5 h-5 text-slate-500" />;
    if (id.includes('breadboard')) return <Layers className="w-5 h-5 text-slate-500" />;
    if (id.includes('resistors')) return <Hash className="w-5 h-5 text-slate-500" />;
    if (id.includes('cables')) return <Cable className="w-5 h-5 text-slate-500" />;
    return <Cpu className="w-5 h-5 text-slate-500" />;
  };

  const categories = ['ALL', ...new Set(rawComponents.map(c => c.category))];
  const statuses = ['ALL', 'ONLINE', 'WARNING', 'OFFLINE', 'NOT MONITORED', 'NOT CONFIGURED', 'UNKNOWN'];

  return (
    <div className="space-y-6">
      {/* Transparency Banner */}
      <div className="p-3.5 px-4 rounded-2xl bg-[#0F9D85]/10 border border-[#0F9D85]/20 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#0F9D85] gap-2">
        <div className="flex items-center space-x-2 font-semibold">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            {appMode === 'LIVE' ? (
              <>
                <strong className="font-bold">VERIFIED COMPONENT TELEMETRY:</strong> Statuses are derived from live sensor readings and heartbeats. Passive components are accurately marked as not monitored.
              </>
            ) : (
              <>
                <strong className="font-bold">DEMO MODE:</strong> Simulating inventory status for design and integration validation.
              </>
            )}
          </span>
        </div>
        <button
          onClick={() => { fetchBackendData(); fetchHardwareData(); }}
          className="flex items-center space-x-1 font-bold bg-white text-[#172B4D] px-2.5 py-1 rounded-lg border border-[#E2E8F0] text-[11px] shadow-2xs hover:bg-slate-50 cursor-pointer self-end sm:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] tracking-tight">
              Hardware Components
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F9D85]/10 text-[#0F9D85]">
              Physical Inventory
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B778C] mt-1 font-medium">
            Production hardware bill-of-materials, connection types, and real-time operational health checks
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-bold text-[#6B778C]">
          <span>Node: <strong className="text-[#172B4D]">{deviceState.deviceId || 'BLINDSTICK001'}</strong></span>
          <span>•</span>
          <span>Heartbeat: <strong className={deviceState.status === 'OFFLINE' ? 'text-[#EF4444]' : 'text-[#0F9D85]'}>{deviceState.status}</strong></span>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs">
          <div className="text-[11px] font-bold text-[#6B778C] uppercase tracking-wider">Total Items</div>
          <div className="text-2xl font-black text-[#172B4D] mt-1">{summary.totalComponents}</div>
          <div className="text-[10px] text-[#6B778C] mt-0.5">Physical parts</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs">
          <div className="text-[11px] font-bold text-[#0F9D85] uppercase tracking-wider">Online</div>
          <div className="text-2xl font-black text-[#0F9D85] mt-1">{summary.onlineCount}</div>
          <div className="text-[10px] text-[#6B778C] mt-0.5">Telemetry active</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs">
          <div className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-wider">Warning</div>
          <div className="text-2xl font-black text-[#F59E0B] mt-1">{summary.warningCount}</div>
          <div className="text-[10px] text-[#6B778C] mt-0.5">Threshold tripped</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs">
          <div className="text-[11px] font-bold text-[#EF4444] uppercase tracking-wider">Offline</div>
          <div className="text-2xl font-black text-[#EF4444] mt-1">{summary.offlineCount}</div>
          <div className="text-[10px] text-[#6B778C] mt-0.5">No heartbeat</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs">
          <div className="text-[11px] font-bold text-[#3B82F6] uppercase tracking-wider">Pending Setup</div>
          <div className="text-2xl font-black text-[#3B82F6] mt-1">{summary.notConfiguredCount}</div>
          <div className="text-[10px] text-[#6B778C] mt-0.5">SIM900A driver</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unmonitored</div>
          <div className="text-2xl font-black text-slate-600 mt-1">{summary.notMonitoredCount}</div>
          <div className="text-[10px] text-[#6B778C] mt-0.5">Passive electronics</div>
        </div>
      </div>

      {/* Status Legend & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="font-bold text-[#172B4D]">Legend:</span>
          <span className="px-2 py-0.5 rounded-full bg-[#0F9D85]/10 text-[#0F9D85] font-bold">ONLINE: Verified Telemetry</span>
          <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] font-bold">WARNING: Hazard / Obstacle</span>
          <span className="px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] font-bold">OFFLINE: Stale/Dropped</span>
          <span className="px-2 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] font-bold">NOT CONFIGURED: Pending Driver</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">NOT MONITORED: Passive Hardware</span>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] text-[#172B4D] focus:outline-none"
          >
            {statuses.map(st => (
              <option key={st} value={st}>Status: {st}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] text-[#172B4D] focus:outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>Category: {cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Hardware Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredComponents.map((comp) => {
          return (
            <div 
              key={comp.id}
              className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Top header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
                      {getComponentIcon(comp.id)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#172B4D] text-sm leading-snug">{comp.name}</h3>
                      <span className="text-[11px] text-[#6B778C] font-semibold">{comp.category}</span>
                    </div>
                  </div>
                  {getStatusBadge(comp.status)}
                </div>

                {/* Purpose and details */}
                <p className="text-xs text-[#6B778C] font-medium mt-3 leading-relaxed">
                  {comp.purpose}
                </p>

                {/* Status Explanation Reason Box */}
                <div className="mt-3 p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0]/80 text-[11px]">
                  <div className="font-bold text-[#172B4D] flex items-center space-x-1.5 mb-0.5">
                    <Info className="w-3.5 h-3.5 text-[#0F9D85]" />
                    <span>Status Diagnostic</span>
                  </div>
                  <p className="text-[#6B778C] leading-snug">{comp.statusReason}</p>
                </div>
              </div>

              {/* Bottom metadata footer */}
              <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] font-semibold text-[#6B778C]">
                <div className="flex items-center space-x-1">
                  <span>Quantity:</span>
                  <strong className="text-[#172B4D]">{comp.quantity}</strong>
                </div>

                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-[#6B778C]" />
                  <span>
                    {comp.lastUpdated 
                      ? new Date(comp.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Passive'
                    }
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
