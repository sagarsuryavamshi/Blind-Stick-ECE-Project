/**
 * Centralized API Client Service for SmartGuard PRO
 * Uses environment variable: VITE_API_URL
 * Defaults to: http://localhost:5001
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '');

class ApiService {
  constructor() {
    this.token = localStorage.getItem('smartguard_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('smartguard_token', token);
    } else {
      localStorage.removeItem('smartguard_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.warn(`[API] Failed request: ${endpoint}`, error.message);
      throw error;
    }
  }

  // --- Health & Diagnostic ---
  async getHealth() {
    return this.request('/api/health');
  }

  // --- Sensors Telemetry ---
  async getLatestSensor() {
    return this.request('/api/sensors/latest');
  }

  async getSensorHistory(limit = 20) {
    return this.request(`/api/sensors/history?limit=${limit}`);
  }

  async getHardwareComponents() {
    return this.request('/api/sensors/hardware-components');
  }

  async postSensorData(payload) {
    return this.request('/api/sensors/data', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Emergency Alerts ---
  async getAlerts(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/api/alerts${query ? `?${query}` : ''}`);
  }

  async createAlert(alertPayload) {
    return this.request('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(alertPayload),
    });
  }

  async resolveAlert(id, notes = '') {
    return this.request(`/api/alerts/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  }

  async markFalseAlarm(id, notes = '') {
    return this.request(`/api/alerts/${id}/false-alarm`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  }

  // --- Emergency Contacts ---
  async getContacts() {
    return this.request('/api/contacts');
  }

  async createContact(contact) {
    return this.request('/api/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }

  async updateContact(id, updates) {
    return this.request(`/api/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteContact(id) {
    return this.request(`/api/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Emergency Notifications History ---
  async getNotificationHistory() {
    return this.request('/api/notifications/history');
  }

  // --- Caregiver Auth ---
  async login(email, password) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }
}

export const api = new ApiService();
