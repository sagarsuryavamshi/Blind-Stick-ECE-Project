import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { 
  INITIAL_DEVICE_STATE, 
  INITIAL_CONTACTS, 
  INITIAL_ALERTS, 
  INITIAL_ACTIVITY_TIMELINE,
  SENSOR_ACTIVITY_SERIES 
} from '../data/mockData';

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  // Mode: 'LIVE' (Real backend/ESP32) vs 'DEMO' (Pure simulated demo data)
  const [appMode, setAppMode] = useState('LIVE');

  // Device & Sensor states
  const [deviceState, setDeviceState] = useState(INITIAL_DEVICE_STATE);
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [timeline, setTimeline] = useState(INITIAL_ACTIVITY_TIMELINE);
  const [activitySeries, setActivitySeries] = useState(SENSOR_ACTIVITY_SERIES);

  // Connection & Diagnostics
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);
  const [backendHealthData, setBackendHealthData] = useState(null);
  const [toastNotification, setToastNotification] = useState(null);

  // Demo walking jitter toggle (Only active when in DEMO mode)
  const [isSimulatingLiveWalk, setIsSimulatingLiveWalk] = useState(false);

  // 1. Initial Data Fetch & Health Poll
  const fetchBackendData = async () => {
    try {
      const health = await api.getHealth();
      setIsBackendHealthy(true);
      setBackendHealthData(health);

      // In LIVE mode, update device connection and latest readings from backend
      if (appMode === 'LIVE') {
        const [latestSensorRes, contactsRes, alertsRes, historyRes] = await Promise.allSettled([
          api.getLatestSensor(),
          api.getContacts(),
          api.getAlerts(),
          api.getSensorHistory(20),
        ]);

        if (latestSensorRes.status === 'fulfilled' && latestSensorRes.value.data) {
          const s = latestSensorRes.value.data;
          setDeviceState(prev => ({
            ...prev,
            isDemoData: false,
            status: health.device?.status || 'ONLINE',
            lastSeen: s.timestamp,
            batteryLevel: s.batteryLevel, // can be null for ESP32 without divider
            sensors: {
              ...prev.sensors,
              frontDistance: s.frontDistance,
              leftDistance: s.leftDistance,
              rightDistance: s.rightDistance,
              waterDetected: s.waterDetected,
              fallDetected: s.fallDetected,
              movementStatus: s.movementStatus || prev.sensors.movementStatus,
            },
          }));
        } else {
          // If no hardware telemetry recorded yet, accurately reflect device as offline/waiting
          setDeviceState(prev => ({
            ...prev,
            isDemoData: false,
            status: health.device?.status || 'OFFLINE',
            lastSeen: health.device?.lastSeen || null,
          }));
        }

        if (contactsRes.status === 'fulfilled' && contactsRes.value.data) {
          setContacts(contactsRes.value.data);
        }

        if (alertsRes.status === 'fulfilled' && alertsRes.value.data) {
          setAlerts(alertsRes.value.data);
        }

        if (historyRes.status === 'fulfilled' && historyRes.value.data && historyRes.value.data.length > 0) {
          const formattedHistory = historyRes.value.data.map(h => ({
            id: h._id || Math.random().toString(),
            category: 'Sensor Telemetry',
            type: 'TELEMETRY_RECORD',
            title: `Readings: F:${h.frontDistance}cm | L:${h.leftDistance}cm | R:${h.rightDistance}cm`,
            description: `Water: ${h.waterDetected ? 'Detected' : 'Dry'} • Fall: ${h.fallDetected ? 'Impact' : 'Stable'}`,
            timestamp: h.timestamp,
            severity: h.fallDetected ? 'DANGER' : h.waterDetected ? 'WARNING' : 'INFO',
            isDemoData: false,
            meta: `Device: ${h.deviceId}`,
          }));
          setTimeline(prev => [...formattedHistory, ...prev.filter(p => p.category !== 'Sensor Telemetry')]);
        }
      }
    } catch (err) {
      console.warn('Backend unavailable, operating with cached/session state:', err.message);
      setIsBackendHealthy(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
    const interval = setInterval(fetchBackendData, 10000);
    return () => clearInterval(interval);
  }, [appMode]);

  // 2. Socket.IO Live Telemetry Subscriptions
  useEffect(() => {
    const socket = socketService.connect();

    const unsubConn = socketService.subscribe('connection:change', (status) => {
      setIsSocketConnected(status);
    });

    const unsubSensor = socketService.subscribe('sensor:update', (sensor) => {
      if (appMode === 'LIVE') {
        setDeviceState(prev => ({
          ...prev,
          isDemoData: false,
          lastSeen: sensor.timestamp || new Date().toISOString(),
          batteryLevel: sensor.batteryLevel ?? prev.batteryLevel,
          sensors: {
            ...prev.sensors,
            frontDistance: sensor.frontDistance,
            leftDistance: sensor.leftDistance,
            rightDistance: sensor.rightDistance,
            waterDetected: sensor.waterDetected,
            fallDetected: sensor.fallDetected,
            movementStatus: sensor.movementStatus || (sensor.frontDistance < 28 ? 'Slowing Down' : 'Active Walking'),
          },
        }));
      }
    });

    const unsubAlertNew = socketService.subscribe('alert:new', (newAlert) => {
      if (appMode === 'LIVE') {
        setAlerts(prev => [newAlert, ...prev]);
        setToastNotification({
          id: newAlert._id || newAlert.id,
          type: newAlert.severity === 'DANGER' ? 'CRITICAL EMERGENCY' : 'SAFETY WARNING',
          title: newAlert.title || newAlert.alertType,
          message: newAlert.description,
          severity: newAlert.severity,
          time: 'Just now',
        });
      }
    });

    const unsubAlertResolved = socketService.subscribe('alert:resolved', (resolvedAlert) => {
      if (appMode === 'LIVE') {
        setAlerts(prev => prev.map(a => (a._id === resolvedAlert._id || a.id === resolvedAlert._id ? resolvedAlert : a)));
      }
    });

    const unsubDeviceStatus = socketService.subscribe('device:status', (deviceInfo) => {
      if (appMode === 'LIVE') {
        setDeviceState(prev => ({
          ...prev,
          status: deviceInfo.status,
          lastSeen: deviceInfo.lastSeen,
          batteryLevel: deviceInfo.batteryLevel ?? prev.batteryLevel,
        }));
      }
    });

    return () => {
      unsubConn();
      unsubSensor();
      unsubAlertNew();
      unsubAlertResolved();
      unsubDeviceStatus();
    };
  }, [appMode]);

  // 3. Demo Walking Simulator Jitter (Strictly only runs in DEMO mode)
  useEffect(() => {
    if (appMode !== 'DEMO' || !isSimulatingLiveWalk) return;

    const interval = setInterval(() => {
      setDeviceState(prev => {
        const frontJitter = Math.floor(Math.sin(Date.now() / 2400) * 45 + 75);
        const leftJitter = Math.floor(Math.cos(Date.now() / 3200) * 35 + 85);
        const rightJitter = Math.floor(Math.sin(Date.now() / 2800) * 30 + 90);

        const frontDistance = Math.max(16, Math.min(220, frontJitter));
        const leftDistance = Math.max(18, Math.min(220, leftJitter));
        const rightDistance = Math.max(20, Math.min(220, rightJitter));

        const isObstacleClose = frontDistance < 28 || leftDistance < 24 || rightDistance < 24;

        let derivedStatus = prev.status;
        if (prev.sensors.fallDetected) derivedStatus = 'EMERGENCY';
        else if (prev.sensors.waterDetected || isObstacleClose) derivedStatus = 'WARNING';
        else derivedStatus = 'ONLINE';

        return {
          ...prev,
          lastSeen: new Date().toISOString(),
          sensors: {
            ...prev.sensors,
            frontDistance,
            leftDistance,
            rightDistance,
            movementStatus: isObstacleClose ? 'Slowing Down' : 'Active Walking',
          },
          status: derivedStatus,
        };
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [appMode, isSimulatingLiveWalk]);

  // 4. Contact Operations (Connected to Backend in LIVE mode, in-memory in DEMO mode)
  const addContact = async (contactData) => {
    if (appMode === 'LIVE') {
      try {
        const res = await api.createContact(contactData);
        setContacts(prev => [res.data, ...prev]);
        return res;
      } catch (err) {
        throw err;
      }
    } else {
      const newContact = {
        ...contactData,
        id: 'c_' + Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
      };
      if (contactData.isPrimary) {
        setContacts(prev => prev.map(c => ({ ...c, isPrimary: false })).concat(newContact));
      } else {
        setContacts(prev => [...prev, newContact]);
      }
      return { success: true, data: newContact };
    }
  };

  const updateContact = async (id, updatedFields) => {
    if (appMode === 'LIVE') {
      try {
        const res = await api.updateContact(id, updatedFields);
        setContacts(prev => prev.map(c => (c._id === id || c.id === id ? res.data : (updatedFields.isPrimary ? { ...c, isPrimary: false } : c))));
        return res;
      } catch (err) {
        throw err;
      }
    } else {
      setContacts(prev => prev.map(c => {
        if (c.id === id || c._id === id) return { ...c, ...updatedFields };
        if (updatedFields.isPrimary) return { ...c, isPrimary: false };
        return c;
      }));
      return { success: true };
    }
  };

  const deleteContact = async (id) => {
    if (appMode === 'LIVE') {
      try {
        const res = await api.deleteContact(id);
        setContacts(prev => prev.filter(c => c._id !== id && c.id !== id));
        return res;
      } catch (err) {
        throw err;
      }
    } else {
      setContacts(prev => prev.filter(c => c.id !== id && c._id !== id));
      return { success: true };
    }
  };

  // 5. Alert Operations (Connected to Backend in LIVE mode)
  const resolveAlert = async (alertId, resolutionAction = 'RESOLVE') => {
    if (appMode === 'LIVE') {
      try {
        if (resolutionAction === 'FALSE_ALARM') {
          await api.markFalseAlarm(alertId, 'Marked as false alarm by caregiver');
        } else {
          await api.resolveAlert(alertId, 'Acknowledged and handled by caregiver');
        }
      } catch (err) {
        console.error('Failed to update alert status on backend:', err);
      }
    }

    setAlerts(prev => prev.map(a => {
      if (a._id === alertId || a.id === alertId) {
        return {
          ...a,
          status: resolutionAction === 'FALSE_ALARM' ? 'FALSE_ALARM' : 'RESOLVED',
          resolvedAt: new Date().toISOString(),
        };
      }
      return a;
    }));
  };

  // 6. Simulated Event Triggers
  const triggerSimulatedEvent = async (type) => {
    if (type === 'FALL') {
      const payload = {
        deviceId: 'BLINDSTICK001',
        frontDistance: 25,
        leftDistance: 40,
        rightDistance: 35,
        waterDetected: false,
        fallDetected: true,
        batteryLevel: deviceState.batteryLevel || 84,
      };

      if (appMode === 'LIVE') {
        try {
          await api.postSensorData(payload);
        } catch (e) {
          console.error(e);
        }
      } else {
        setDeviceState(prev => ({
          ...prev,
          status: 'EMERGENCY',
          sensors: { ...prev.sensors, fallDetected: true },
        }));
      }
    } else if (type === 'WATER') {
      const payload = {
        deviceId: 'BLINDSTICK001',
        frontDistance: 60,
        leftDistance: 70,
        rightDistance: 65,
        waterDetected: true,
        fallDetected: false,
        batteryLevel: deviceState.batteryLevel || 84,
      };

      if (appMode === 'LIVE') {
        try {
          await api.postSensorData(payload);
        } catch (e) {
          console.error(e);
        }
      } else {
        setDeviceState(prev => ({
          ...prev,
          status: 'WARNING',
          sensors: { ...prev.sensors, waterDetected: true },
        }));
      }
    } else if (type === 'MANUAL_SOS') {
      if (appMode === 'LIVE') {
        try {
          await api.createAlert({
            deviceId: 'BLINDSTICK001',
            alertType: 'MANUAL_SOS',
            severity: 'DANGER',
            description: 'Manual emergency SOS distress button pressed by user.',
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        setToastNotification({
          id: 'sos_demo',
          type: 'EMERGENCY BROADCAST',
          title: 'Manual SOS Triggered',
          message: 'Distress call dispatched to guardian contact list.',
          severity: 'DANGER',
          time: 'Just now',
        });
      }
    } else if (type === 'RESET_HAZARDS') {
      setDeviceState(prev => ({
        ...prev,
        status: 'ONLINE',
        sensors: {
          ...prev.sensors,
          waterDetected: false,
          fallDetected: false,
          frontDistance: 82,
        },
      }));
    }
  };

  const triggerTestNotification = (id) => {
    const contact = contacts.find(c => c._id === id || c.id === id);
    setToastNotification({
      id: 'test_' + Date.now(),
      type: 'SIMULATED SMS TEST',
      title: `Test Alert Sent to ${contact?.name || 'Contact'}`,
      message: `Simulated SMS & Call test dispatched to ${contact?.phone || contact?.phoneNumber}.`,
      severity: 'INFO',
      time: 'Just now',
    });
  };

  return (
    <DeviceContext.Provider value={{
      appMode,
      setAppMode,
      deviceState,
      contacts,
      alerts,
      timeline,
      activitySeries,
      isSocketConnected,
      isBackendHealthy,
      backendHealthData,
      isSimulatingLiveWalk,
      setIsSimulatingLiveWalk,
      toastNotification,
      setToastNotification,
      triggerSimulatedEvent,
      resolveAlert,
      addContact,
      updateContact,
      deleteContact,
      triggerTestNotification,
      fetchBackendData,
    }}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
}
