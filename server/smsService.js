// SMS Service supporting MSG91 / Fast2SMS with Mock fallback and comprehensive logging
const axios = require('axios');

class SmsService {
  constructor() {
    this.provider = process.env.SMS_GATEWAY_PROVIDER || 'mock_msg91';
    this.authKey = process.env.MSG91_AUTH_KEY || '';
    this.senderId = process.env.MSG91_SENDER_ID || 'BLNDST';
    this.templateId = process.env.MSG91_TEMPLATE_ID || '';
    this.enabled = process.env.SMS_ENABLED === 'true';
  }

  /**
   * Send Emergency SMS to recipient
   * @param {Object} params
   * @param {string} params.phoneNumber - e.g. "+919876543210" or "9876543210"
   * @param {string} params.contactName - Name of emergency contact
   * @param {string} params.eventType - 'FALL_DETECTED' | 'WATER_HAZARD' | 'MANUAL_SOS' | 'TEST_ALERT'
   * @param {string} params.deviceId - e.g. "BLINDSTICK001"
   * @param {string} params.locationText - Optional coordinates/location summary
   */
  async sendEmergencySms({ phoneNumber, contactName, eventType, deviceId = 'BLINDSTICK001', locationText = 'Home/Near Navigating area' }) {
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    
    // Normalize phone number for India
    let formattedPhone = phoneNumber.replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) {
        formattedPhone = '+91' + formattedPhone;
      }
    }
    const cleanNumberForApi = formattedPhone.replace('+', '');

    let alertMessage = '';
    if (eventType === 'FALL_DETECTED') {
      alertMessage = `[EMERGENCY ALERT] Fall detected on Smart Stick (${deviceId}) for your ward at ${timestamp}. Immediate attention required. Location: ${locationText}.`;
    } else if (eventType === 'WATER_HAZARD') {
      alertMessage = `[HAZARD ALERT] Deep water hazard detected by Smart Stick (${deviceId}) at ${timestamp}. User may need guidance.`;
    } else if (eventType === 'MANUAL_SOS') {
      alertMessage = `[CRITICAL SOS] Emergency SOS triggered by user on Smart Stick (${deviceId}) at ${timestamp}! Please call or reach immediately.`;
    } else if (eventType === 'TEST_ALERT') {
      alertMessage = `[TEST MSG] Smart Blind Stick system test to ${contactName} at ${timestamp}. Status: ALL SYSTEMS OPERATIONAL.`;
    } else {
      alertMessage = `[ALERT] Smart Stick (${deviceId}) safety event: ${eventType} at ${timestamp}.`;
    }

    console.log(`\n================= [OUTBOUND SMS GATEWAY] =================`);
    console.log(`Provider: ${this.provider}`);
    console.log(`Recipient: ${contactName} (${formattedPhone})`);
    console.log(`Event: ${eventType}`);
    console.log(`Message: "${alertMessage}"`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`==========================================================\n`);

    // If configured with real MSG91 Auth Key (non-mock), perform real API dispatch
    if (this.provider === 'msg91' && this.authKey && !this.authKey.includes('mock')) {
      try {
        const response = await axios.post(
          'https://control.msg91.com/api/v5/flow/',
          {
            template_id: this.templateId,
            sender: this.senderId,
            short_url: '0',
            mobiles: cleanNumberForApi,
            var1: contactName,
            var2: eventType,
            var3: deviceId,
            var4: timestamp
          },
          {
            headers: {
              authkey: this.authKey,
              'content-type': 'application/json'
            },
            timeout: 8000
          }
        );
        return {
          success: true,
          provider: 'msg91',
          gatewayMessageId: response.data?.message || 'MSG91_SENT_' + Date.now(),
          recipient: formattedPhone,
          message: alertMessage,
          status: 'DELIVERED',
          timestamp: new Date().toISOString()
        };
      } catch (err) {
        console.error('MSG91 Dispatch Error:', err.response?.data || err.message);
        return {
          success: false,
          provider: 'msg91',
          recipient: formattedPhone,
          message: alertMessage,
          status: 'FAILED',
          error: err.response?.data?.message || err.message,
          timestamp: new Date().toISOString()
        };
      }
    }

    // High fidelity simulated gateway with realistic messageId & delivery confirmation
    const mockMessageId = 'SMS_' + Math.random().toString(36).substring(2, 10).toUpperCase() + '_' + Date.now();
    return {
      success: true,
      provider: 'mock_msg91_gateway',
      gatewayMessageId: mockMessageId,
      recipient: formattedPhone,
      message: alertMessage,
      status: 'DELIVERED',
      timestamp: new Date().toISOString(),
      details: 'Dispatched via Smart Blind Stick SMS Gateway simulation'
    };
  }
}

module.exports = new SmsService();
