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
  X,
  AlertCircle,
  MessageSquare,
  PhoneCall,
  Info,
  CheckCircle2
} from 'lucide-react';
import { useDevice } from '../context/DeviceContext';

export default function EmergencyContacts() {
  const { 
    appMode,
    contacts, 
    addContact, 
    updateContact, 
    deleteContact, 
    triggerTestNotification 
  } = useDevice();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [testNotificationFeedback, setTestNotificationFeedback] = useState(null);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');

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
    setRelationship(c.relationship || '');
    setPhoneNumber(c.phone || c.phoneNumber || '');
    setEmail(c.email || '');
    setIsPrimary(c.isPrimary || false);
    setNotifySms(c.receiveSMS ?? c.notifySms ?? true);
    setNotifyCall(c.receiveCalls ?? c.notifyCall ?? false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Contact name is required.');
      return;
    }

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setFormError('Please enter a valid Indian mobile number (10 digits).');
      return;
    }

    const payload = {
      name: name.trim(),
      relationship: relationship.trim() || 'Guardian',
      phone: phoneNumber.trim(),
      email: email.trim(),
      isPrimary,
      receiveSMS: notifySms,
      receiveCalls: notifyCall,
    };

    try {
      if (editingContact) {
        await updateContact(editingContact._id || editingContact.id, payload);
        setApiSuccess(`Updated details for ${name}`);
      } else {
        await addContact(payload);
        setApiSuccess(`Registered emergency contact: ${name}`);
      }
      setIsModalOpen(false);
      setTimeout(() => setApiSuccess(''), 4000);
    } catch (err) {
      setFormError(err.message || 'Error communicating with backend');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContact(id);
      setConfirmDeleteId(null);
      setApiSuccess('Emergency contact removed successfully.');
      setTimeout(() => setApiSuccess(''), 4000);
    } catch (err) {
      setApiError(err.message || 'Failed to delete contact');
      setTimeout(() => setApiError(''), 4000);
    }
  };

  const handleSetPrimary = async (c) => {
    try {
      await updateContact(c._id || c.id, { isPrimary: true });
      setApiSuccess(`${c.name} is now designated as Primary Emergency Recipient.`);
      setTimeout(() => setApiSuccess(''), 4000);
    } catch (err) {
      setApiError(err.message || 'Failed to set primary contact');
      setTimeout(() => setApiError(''), 4000);
    }
  };

  const handleTestNotification = (contact) => {
    triggerTestNotification(contact._id || contact.id);
    setTestNotificationFeedback(`Simulated SMS & Call test dispatched to ${contact.name} (${contact.phone || contact.phoneNumber})!`);
    setTimeout(() => setTestNotificationFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Backend Mode Transparency Banner */}
      <div className="p-3.5 px-4 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-between text-xs text-[#3B82F6]">
        <div className="flex items-center space-x-2 font-semibold">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            {appMode === 'LIVE' ? (
              <>
                <strong className="font-bold">DATABASE CONNECTED:</strong> Contacts are fetched and synchronized directly with the backend REST API (<code className="font-mono bg-white px-1.5 py-0.5 rounded">/api/contacts</code>).
              </>
            ) : (
              <>
                <strong className="font-bold">DEMO STATE:</strong> Managing contacts in memory for evaluation.
              </>
            )}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] tracking-tight">
              Emergency Contact Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0F9D85]/10 text-[#0F9D85]">
              {contacts.length} Registered
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B778C] mt-1 font-medium">
            Authorized caregivers receiving instantaneous alerts upon fall detection or manual SOS activation
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

      {/* Success / Error Feedback Alerts */}
      {apiSuccess && (
        <div className="p-4 rounded-xl bg-[#0F9D85]/15 border border-[#0F9D85]/30 text-[#0F9D85] flex items-center space-x-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{apiSuccess}</span>
        </div>
      )}

      {apiError && (
        <div className="p-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] flex items-center space-x-2 text-xs font-bold animate-in fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{apiError}</span>
        </div>
      )}

      {testNotificationFeedback && (
        <div className="p-4 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#3B82F6] flex items-center space-x-2 text-xs font-bold animate-in fade-in">
          <Send className="w-4 h-4" />
          <span>{testNotificationFeedback}</span>
        </div>
      )}

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {contacts.map((c) => {
          const cid = c._id || c.id;
          const displayPhone = c.phone || c.phoneNumber;
          return (
            <div 
              key={cid}
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
                      onClick={() => setConfirmDeleteId(cid)}
                      className="p-1.5 text-[#6B778C] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0]">
                    <Phone className="w-4 h-4 text-[#0F9D85] shrink-0" />
                    <span className="font-bold text-[#172B4D] font-mono tracking-wide">{displayPhone}</span>
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
                  <span className="text-[#6B778C]">Alert Preferences:</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                      (c.receiveSMS ?? c.notifySms ?? true) ? 'bg-[#0F9D85]/15 text-[#0F9D85]' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <MessageSquare className="w-3 h-3" />
                      <span>SMS</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                      (c.receiveCalls ?? c.notifyCall ?? false) ? 'bg-[#3B82F6]/15 text-[#3B82F6]' : 'bg-slate-100 text-slate-400'
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
                    onClick={() => handleSetPrimary(c)}
                    className="text-xs font-bold text-[#6B778C] hover:text-[#0F9D85] transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Set Primary</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-[#0F9D85] flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D85]" />
                    <span>Primary Target</span>
                  </span>
                )}

                <button
                  onClick={() => handleTestNotification(c)}
                  className="px-3 py-1.5 rounded-xl bg-[#0F9D85]/10 hover:bg-[#0F9D85]/20 text-[#0F9D85] text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Test Notification</span>
                </button>
              </div>

              {/* Confirm Delete Overlay */}
              {confirmDeleteId === cid && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-2xl p-5 flex flex-col items-center justify-center text-center z-10 animate-in fade-in duration-150">
                  <AlertCircle className="w-8 h-8 text-[#EF4444] mb-2" />
                  <h4 className="text-sm font-bold text-[#172B4D]">Delete {c.name}?</h4>
                  <p className="text-xs text-[#6B778C] mt-1 max-w-xs font-medium">
                    {c.isPrimary ? 'This is the primary contact. Another guardian will be assigned automatically.' : 'This contact will be permanently removed from emergency broadcasts.'}
                  </p>
                  <div className="mt-4 flex items-center space-x-3">
                    <button
                      onClick={() => handleDelete(cid)}
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
          );
        })}
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
                <label className="block text-xs font-bold text-[#172B4D] mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="guardian@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-[#0F9D85]"
                />
              </div>

              {/* Notification Preferences */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#172B4D] mb-1.5">Notification Channels</label>
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
                  Designate as primary emergency contact
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
