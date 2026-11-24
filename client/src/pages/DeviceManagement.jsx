import React from 'react';
import { 
  Cpu, 
  Wifi, 
  Battery, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Volume2, 
  Eye, 
  Droplet,
  Info,
  ShieldCheck,
  FileCode,
  Sparkles
} from 'lucide-react';
import { useDevice } from '../context/DeviceContext';

export default function DeviceManagement() {
  const { deviceState, isDeviceOnline, setIsDeviceOnline } = useDevice();
  const { sensorHealth } = deviceState;

  return (
    <div className="space-y-6">
      {/* Explicit DEMO DATA Notice */}
      <div className="p-3.5 px-4 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-between text-xs text-[#3B82F6]">
        <div className="flex items-center space-x-2 font-semibold">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            <strong className="font-bold">DEMO ENVIRONMENT:</strong> ESP32 hardware diagnostics, battery level, and component health values are simulated.
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-[#3B82F6]/30">
          PROFILES (MOCK)
        </span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] tracking-tight">
              Device Management & Hardware Diagnostics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F9D85]/10 text-[#0F9D85]">
              ESP32 Node
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B778C] mt-1 font-medium">
            Physical sensor component health, communication diagnostics, firmware telemetry, and battery power
          </p>
        </div>

        <button
          onClick={() => setIsDeviceOnline(!isDeviceOnline)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
            isDeviceOnline
              ? 'bg-[#0F9D85]/10 border-[#0F9D85]/30 text-[#0F9D85]'
              : 'bg-slate-100 border-slate-300 text-slate-600'
          }`}
        >
          {isDeviceOnline ? 'Toggle to Offline Demo' : 'Reconnect (Online)'}
        </button>
      </div>

      {/* Device Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
            <div>
              <span className="text-xs font-black text-[#0F9D85] uppercase tracking-wider">Device Profile</span>
              <h3 className="text-lg font-black text-[#172B4D]">{deviceState.deviceName}</h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 ${
              isDeviceOnline ? 'bg-[#0F9D85]/15 text-[#0F9D85]' : 'bg-slate-100 text-slate-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isDeviceOnline ? 'bg-[#0F9D85] animate-ping' : 'bg-slate-400'}`} />
              <span>{isDeviceOnline ? 'ACTIVE (SIMULATED)' : 'OFFLINE'}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0]">
              <span className="text-[10px] font-black text-[#6B778C] uppercase tracking-wider">ESP32 ID</span>
              <div className="text-sm font-extrabold text-[#172B4D] mt-1 font-mono">{deviceState.deviceId}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0]">
              <span className="text-[10px] font-black text-[#6B778C] uppercase tracking-wider">Connection</span>
              <div className="text-sm font-extrabold text-[#0F9D85] mt-1">
                {isDeviceOnline ? 'Connected' : 'Disconnected'}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0]">
              <span className="text-[10px] font-black text-[#6B778C] uppercase tracking-wider">Battery</span>
              <div className="text-sm font-extrabold text-[#172B4D] mt-1">
                {deviceState.batteryLevel}% (Simulated)
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0]">
              <span className="text-[10px] font-black text-[#6B778C] uppercase tracking-wider">Last Sync</span>
              <div className="text-xs font-extrabold text-[#172B4D] mt-1">
                {new Date(deviceState.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Sensor Health Check List */}
          <div>
            <h4 className="text-xs font-black text-[#6B778C] uppercase tracking-wider mb-3">
              Integrated Sensor Health Diagnostic (7 Subsystems)
            </h4>
            <div className="space-y-2.5">
              {sensorHealth.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0]">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] text-[#0F9D85] flex items-center justify-center shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#172B4D]">{s.name}</div>
                      <div className="text-[11px] text-[#6B778C] font-medium">{s.spec}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-[#172B4D]">{s.health}%</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F9D85]/15 text-[#0F9D85] flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0F9D85]" />
                      <span>{s.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pinout and Architecture Reference */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h4 className="text-xs font-black text-[#6B778C] uppercase tracking-wider">ESP32 Pinout Allocation</h4>
              <FileCode className="w-4 h-4 text-[#6B778C]" />
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2.5 rounded-xl bg-[#F7F9FC]">
                <span className="text-[#6B778C]">Front HC-SR04:</span>
                <span className="font-bold text-[#0F9D85]">Trig: 23, Echo: 22</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-[#F7F9FC]">
                <span className="text-[#6B778C]">Left HC-SR04:</span>
                <span className="font-bold text-[#0F9D85]">Trig: 19, Echo: 18</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-[#F7F9FC]">
                <span className="text-[#6B778C]">Right HC-SR04:</span>
                <span className="font-bold text-[#0F9D85]">Trig: 5, Echo: 17</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-[#F7F9FC]">
                <span className="text-[#6B778C]">MPU6050 (I2C):</span>
                <span className="font-bold text-[#0F9D85]">SDA: 21, SCL: 19</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-[#F7F9FC]">
                <span className="text-[#6B778C]">Moisture Sensor:</span>
                <span className="font-bold text-[#0F9D85]">GPIO 34 (ADC1)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-[#F7F9FC]">
                <span className="text-[#6B778C]">DFPlayer Mini:</span>
                <span className="font-bold text-[#0F9D85]">TX: 16, RX: 4</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0F9D85]/10 rounded-2xl p-6 border border-[#0F9D85]/20 space-y-2.5">
            <div className="flex items-center space-x-2 text-[#0F9D85] font-extrabold text-sm">
              <ShieldCheck className="w-5 h-5 text-[#0F9D85]" />
              <span>SmartGuard Architecture</span>
            </div>
            <p className="text-xs text-[#172B4D] font-medium leading-relaxed">
              Designed as a comprehensive assistive device delivering spatial protection via triple ultrasonic sensing, ground liquid detection, MPU6050 fall monitoring, and remote guardian alerting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
