import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Star, 
  Send, 
  Trash2, 
  Edit3, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Check, 
  X,
  AlertCircle,
  MessageSquare,
  PhoneCall,
  Info
} from 'lucide-react';
import { useDevice } from '../context/DeviceContext';

export default function EmergencyContacts() {
  const { contacts, addContact, updateContact, deleteContact, triggerTestNotification } = useDevice();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [testNotificationFeedback, setTestNotificationFeedback] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyCall, setNotifyCall] = useState(true);
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setEditingContact(null);
    setName('');
    setRelationship('Parent / Primary Guardian');
    setPhoneNumber('+91 98765 00000');
    setEmail('');
    setIsPrimary(contacts.length === 0);
    setNotifySms(true);
    setNotifyCall(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingContact(c);
    setName(c.name);
    setRelationship(c.relationship);
    setPhoneNumber(c.phoneNumber);
    setEmail(c.email || '');
    setIsPrimary(c.isPrimary || false);
    setNotifySms(c.notifySms ?? true);
    setNotifyCall(c.notifyCall ?? false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Contact name is required.');
      return;
    }

    // Format & validate Indian mobile number
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setFormError('Please enter a valid Indian mobile number (10 digits).');
      return;
    }

    const formattedPhone = cleanDigits.length === 10 
      ? `+91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`
      : `+91 ${cleanDigits.slice(-10, -5)} ${cleanDigits.slice(-5)}`;

    if (editingContact) {
      updateContact(editingContact.id, {
        name,
        relationship,
        phoneNumber: formattedPhone,
        rawPhone: `+91${cleanDigits.slice(-10)}`,
        email,
        isPrimary,
        notifySms,
        notifyCall
      });
    } else {
      addContact({
        name,
        relationship,
        phoneNumber: formattedPhone,
        rawPhone: `+91${cleanDigits.slice(-10)}`,
        email,
        isPrimary,
        notifySms,
        notifyCall
      });
    }

    setIsModalOpen(false);
  };

  const handleTestNotification = (contact) => {
    triggerTestNotification(contact.id);
    setTestNotificationFeedback(`Simulated SMS & Call test dispatched to ${contact.name} (${contact.phoneNumber})!`);
    setTimeout(() => setTestNotificationFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Explicit DEMO DATA Banner */}
      <div className="p-3.5 px-4 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-between text-xs text-[#3B82F6]">
        <div className="flex items-center space-x-2 font-semibold">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            <strong className="font-bold">FRONTEND DEMO:</strong> Contacts are stored in local frontend state. SMS and call notifications are simulated for UI verification.
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-[#3B82F6]/30">
          LOCAL STATE
        </span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] tracking-tight">
              Emergency Contact Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F9D85]/10 text-[#0F9D85]">
              {contacts.length} Contacts Configured
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B778C] mt-1 font-medium">
            Authorized guardians receiving immediate notifications upon fall detection or manual SOS activation
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#0F9D85] hover:bg-[#0c826e] active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Emergency Contact</span>
        </button>
      </div>

      {/* Test Notification Feedback Alert */}
      {testNotificationFeedback && (
        <div className="p-4 rounded-xl bg-[#0F9D85]/15 border border-[#0F9D85]/30 text-[#0F9D85] flex items-center space-x-2 text-xs font-bold animate-in fade-in">
          <Send className="w-4 h-4 text-[#0F9D85]" />
          <span>{testNotificationFeedback}</span>
        </div>
      )}

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {contacts.map((c) => (
          <div 
            key={c.id}
            className={`bg-white rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
              c.isPrimary 
                ? 'border-[#0F9D85] ring-2 ring-[#0F9D85]/15 shadow-sm' 
                : 'border-[#E2E8F0] hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div>
              {/* Top Contact Row */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-[#172B4D] text-base">{c.name}</h3>
                    {c.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#0F9D85]/15 text-[#0F9D85] flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-[#0F9D85] text-[#0F9D85]" />
                        <span>Primary</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#0F9D85] mt-0.5 block">{c.relationship}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1.5 text-[#6B778C] hover:text-[#172B4D] hover:bg-[#F7F9FC] rounded-lg transition-colors cursor-pointer"
                    title="Edit Contact"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(c.id)}
                    className="p-1.5 text-[#6B778C] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0]">
                  <Phone className="w-4 h-4 text-[#0F9D85] shrink-0" />
                  <span className="font-bold text-[#172B4D] font-mono tracking-wide">{c.phoneNumber}</span>
                </div>
                {c.email && (
                  <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0]">
                    <Mail className="w-4 h-4 text-[#6B778C] shrink-0" />
                    <span className="truncate text-[#6B778C] font-medium">{c.email}</span>
                  </div>
                )}
              </div>

              {/* Notification Preferences */}
              <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] font-bold">
                <span className="text-[#6B778C]">Channels:</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                    c.notifySms ? 'bg-[#0F9D85]/15 text-[#0F9D85]' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <MessageSquare className="w-3 h-3" />
                    <span>SMS</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                    c.notifyCall ? 'bg-[#3B82F6]/15 text-[#3B82F6]' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <PhoneCall className="w-3 h-3" />
                    <span>Call</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
              {!c.isPrimary ? (
                <button
                  onClick={() => updateContact(c.id, { isPrimary: true })}
                  className="text-xs font-bold text-[#6B778C] hover:text-[#0F9D85] transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Set as Primary</span>
                </button>
              ) : (
                <span className="text-[11px] font-bold text-[#0F9D85] flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D85]" />
                  <span>Default Target</span>
                </span>
              )}

              <button
                onClick={() => handleTestNotification(c)}
                className="px-3 py-1.5 rounded-xl bg-[#0F9D85]/10 hover:bg-[#0F9D85]/20 text-[#0F9D85] text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>Test Alert</span>
              </button>
            </div>

            {/* Delete Confirmation Step */}
            {confirmDeleteId === c.id && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-2xl p-5 flex flex-col items-center justify-center text-center z-10 animate-in fade-in duration-150">
                <AlertCircle className="w-8 h-8 text-[#EF4444] mb-2" />
                <h4 className="text-sm font-bold text-[#172B4D]">Remove {c.name}?</h4>
                <p className="text-xs text-[#6B778C] mt-1 max-w-xs font-medium">
                  {c.isPrimary ? 'This is the primary guardian. Another contact will be assigned primary.' : 'This person will no longer receive emergency alerts.'}
                </p>
                <div className="mt-4 flex items-center space-x-3">
                  <button
                    onClick={() => {
                      deleteContact(c.id);
                      setConfirmDeleteId(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#EF4444] hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-3 py-1.5 rounded-xl bg-[#F7F9FC] hover:bg-slate-200 text-[#172B4D] font-bold text-xs border border-[#E2E8F0] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E2E8F0] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-base font-extrabold text-[#172B4D]">
                {editingContact ? 'Edit Emergency Contact' : 'Register New Contact'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#6B778C] hover:text-[#172B4D] hover:bg-[#F7F9FC]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-bold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-[#0F9D85]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Father, Mother, Sibling, Caretaker"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-[#0F9D85]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">
                  Indian Mobile Number (+91) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] font-mono text-sm focus:outline-[#0F9D85]"
                />
                <span className="text-[11px] text-[#6B778C] mt-1 block">
                  Format: 10-digit Indian mobile number prefixed with +91.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="contact@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-[#0F9D85]"
                />
              </div>

              {/* Notification Channel Preferences */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#172B4D] mb-1.5">Notification Preferences</label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-[#E2E8F0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifySms}
                      onChange={(e) => setNotifySms(e.target.checked)}
                      className="accent-[#0F9D85]"
                    />
                    <span className="font-bold text-[#172B4D]">Instant SMS</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-[#E2E8F0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyCall}
                      onChange={(e) => setNotifyCall(e.target.checked)}
                      className="accent-[#0F9D85]"
                    />
                    <span className="font-bold text-[#172B4D]">Voice Call</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="modalPrimary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="accent-[#0F9D85] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="modalPrimary" className="text-xs font-bold text-[#172B4D] cursor-pointer">
                  Set as primary emergency recipient
                </label>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F7F9FC] hover:bg-slate-200 text-[#172B4D] text-xs font-bold border border-[#E2E8F0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F9D85] hover:bg-[#0c826e] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingContact ? 'Save Changes' : 'Register Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
