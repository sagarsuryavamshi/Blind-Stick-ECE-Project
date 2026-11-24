import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Flame, 
  Droplet, 
  Eye, 
  Radio, 
  Info,
  Clock,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { useDevice } from '../context/DeviceContext';

export default function ActivityHistory() {
  const { 
    appMode,
    timeline, 
    fetchBackendData 
  } = useDevice();

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTimeline = timeline.filter(item => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getEventVisuals = (category, type) => {
    if (category === 'Fall Events' || type === 'FALL_DETECTED') {
      return { icon: Flame, badgeBg: 'bg-[#EF4444]/15', text: 'text-[#EF4444]', border: 'border-[#EF4444]/30' };
    }
    if (category === 'Water Detections' || type === 'WATER_HAZARD') {
      return { icon: Droplet, badgeBg: 'bg-[#3B82F6]/15', text: 'text-[#3B82F6]', border: 'border-[#3B82F6]/30' };
    }
    if (category === 'Obstacle Detections' || type.startsWith('OBSTACLE')) {
      return { icon: Eye, badgeBg: 'bg-[#F59E0B]/15', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30' };
    }
    return { icon: Radio, badgeBg: 'bg-[#0F9D85]/15', text: 'text-[#0F9D85]', border: 'border-[#0F9D85]/30' };
  };

  return (
    <div className="space-y-6">
      {/* Transparency Banner */}
      <div className="p-3.5 px-4 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#3B82F6] gap-2">
        <div className="flex items-center space-x-2 font-semibold">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            {appMode === 'LIVE' ? (
              <>
                <strong className="font-bold">AUDIT TRAIL:</strong> Distinguishes high-frequency sensor telemetry records from permanent emergency events.
              </>
            ) : (
              <>
                <strong className="font-bold">DEMO TIMELINE:</strong> Sample event records shown for evaluation.
              </>
            )}
          </span>
        </div>
        <button
          onClick={fetchBackendData}
          className="flex items-center space-x-1 font-bold bg-white text-[#172B4D] px-2 py-0.5 rounded-lg border text-[11px] shadow-2xs hover:bg-slate-50 cursor-pointer self-end sm:self-auto"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Sync</span>
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] tracking-tight">
              Activity History & Incident Audit
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F9D85]/10 text-[#0F9D85]">
              {filteredTimeline.length} Entries
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B778C] mt-1 font-medium">
            Chronological audit of obstacle encounters, water hazards, fall impacts, and live telemetry pings
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B778C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, obstacles, or pings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] text-xs sm:text-sm focus:outline-[#0F9D85]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Sensor Telemetry', 'Obstacle Detections', 'Water Detections', 'Fall Events', 'Emergency Notifications'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0F9D85] text-white shadow-xs'
                  : 'bg-[#F7F9FC] text-[#6B778C] hover:text-[#172B4D] border border-[#E2E8F0]'
              }`}
            >
              {cat === 'ALL' ? 'All Records' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs">
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
          {filteredTimeline.length > 0 ? (
            filteredTimeline.map((item, idx) => {
              const { icon: Icon, badgeBg, text, border } = getEventVisuals(item.category, item.type);
              return (
                <div key={item.id || idx} className="relative group">
                  <div className={`absolute -left-6 sm:-left-8 top-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center -translate-x-1/2 bg-white ${border} ${text} shadow-xs`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="bg-[#F7F9FC]/70 hover:bg-[#F7F9FC] rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${badgeBg} ${text}`}>
                          {item.category}
                        </span>
                        <h4 className="text-sm font-extrabold text-[#172B4D]">{item.title}</h4>
                      </div>

                      <span className="text-xs text-[#6B778C] font-semibold">
                        {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>

                    <p className="text-xs text-[#6B778C] font-medium mt-1.5 leading-relaxed">
                      {item.description}
                    </p>

                    {item.meta && (
                      <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] flex items-center space-x-2 text-[11px] text-[#6B778C]">
                        <span className="font-bold text-[#172B4D]">Diagnostic Meta:</span>
                        <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#E2E8F0]">{item.meta}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-[#6B778C] text-sm font-medium">
              No matching activity events found for this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
