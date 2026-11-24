// Frontend-first Device and State Context
// STRICT REQUIREMENT: Pure frontend phase. All simulated data is clearly identified as DEMO DATA.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_DEVICE_STATE, 
  INITIAL_CONTACTS, 
  INITIAL_ALERTS, 
  INITIAL_ACTIVITY_TIMELINE,
  SENSOR_ACTIVITY_SERIES 
} from '../data/mockData';

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  const [deviceState, setDeviceState] = useState(INITIAL_DEVICE_STATE);
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [timeline, setTimeline] = useState(INITIAL_ACTIVITY_TIMELINE);
  const [activitySeries, setActivitySeries] = useState(SENSOR_ACTIVITY_SERIES);

  // Connection & Simulation states
  const [isDeviceOnline, setIsDeviceOnline] = useState(true);
  const [isSimulatingLiveWalk, setIsSimulatingLiveWalk] = useState(true);
  const [toastNotification, setToastNotification] = useState(null);

  // Realistic dynamic sensor walking jitter (Simulated Frontend Demonstration)
  useEffect(() => {
    if (!isSimulatingLiveWalk || !isDeviceOnline) return;

    const interval = setInterval(() => {
      setDeviceState(prev => {
        // Natural distance variance (front fluctuates smoothly)
        const frontJitter = Math.floor(Math.sin(Date.now() / 2400) * 45 + 75);
        const leftJitter = Math.floor(Math.cos(Date.now() / 3200) * 35 + 85);
        const rightJitter = Math.floor(Math.sin(Date.now() / 2800) * 30 + 90);

        const frontDistance = Math.max(16, Math.min(220, frontJitter));
        const leftDistance = Math.max(18, Math.min(220, leftJitter));
        const rightDistance = Math.max(20, Math.min(220, rightJitter));

        const isObstacleClose = frontDistance < 28 || leftDistance < 24 || rightDistance < 24;

        let derivedStatus = prev.status;
        if (prev.sensors.fallDetected) {
          derivedStatus = 'EMERGENCY';
        } else if (prev.sensors.waterDetected || isObstacleClose) {
          derivedStatus = 'WARNING';
        } else {
          derivedStatus = 'ONLINE';
        }

        return {
          ...prev,
          lastSeen: new Date().toISOString(),
          sensors: {
            ...prev.sensors,
            frontDistance,
            leftDistance,
            rightDistance,
            movementStatus: isObstacleClose ? 'Slowing Down' : 'Active Walking',
            accel: {
              x: Number((Math.sin(Date.now() / 600) * 0.3).toFixed(2)),
              y: Number((Math.cos(Date.now() / 600) * 0.25).toFixed(2)),
              z: Number((9.81 + Math.sin(Date.now() / 500) * 0.5).toFixed(2))
            },
            gyro: {
              x: Number((Math.sin(Date.now() / 800) * 0.12).toFixed(2)),
              y: Number((Math.cos(Date.now() / 700) * 0.1).toFixed(2)),
              z: Number((Math.sin(Date.now() / 900) * 0.08).toFixed(2))
            }
          },
          status: derivedStatus
        };
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [isSimulatingLiveWalk, isDeviceOnline]);

  // Frontend Simulated Event Triggers
  const triggerSimulatedEvent = (type) => {
    const now = new Date().toISOString();

    if (type === 'FALL') {
      const newAlert = {
        id: 'alt_' + Math.random().toString(36).substring(2, 9),
        deviceId: 'BLINDSTICK001',
        isDemoData: true,
        type: 'FALL_DETECTED',
        category: 'Fall Events',
        severity: 'DANGER',
        title: 'Critical Fall Impact Detected (Simulated)',
        description: 'MPU6050 recorded abrupt free-fall drop followed by stick lying horizontal on ground.',
        timestamp: now,
        status: 'ACTIVE',
        notificationStatus: 'Simulated SMS Dispatched to Primary Contact',
        recipient: contacts.find(c => c.isPrimary)?.name || 'Dr. Ramesh Sharma',
        locationEstimate: 'GPS simulation: 12.9716° N, 77.5946° E'
      };

      setAlerts(prev => [newAlert, ...prev]);
      setDeviceState(prev => ({
        ...prev,
        status: 'EMERGENCY',
        totalEmergencyAlerts: prev.totalEmergencyAlerts + 1,
        sensors: {
          ...prev.sensors,
          fallDetected: true,
          movementStatus: 'Stationary / Incline Tilt'
        }
      }));

      setTimeline(prev => [{
        id: 'act_' + Math.random().toString(36).substring(2, 9),
        category: 'Emergency Notifications',
        type: 'FALL_DETECTED',
        title: 'Fall Detection Triggered (Simulated Demo)',
        description: 'Orientation > 75° tilt detected. Primary caregiver SMS triggered.',
        timestamp: now,
        severity: 'DANGER',
        isDemoData: true,
        meta: 'Simulated Telecom Gateway'
      }, ...prev]);

      setToastNotification({
        id: newAlert.id,
        type: 'CRITICAL EMERGENCY',
        title: 'Fall Detected on Smart Stick!',
        message: 'High impact registered. Caregiver notified via demo broadcast.',
        severity: 'DANGER',
        time: 'Just now'
      });
    } else if (type === 'WATER') {
      setDeviceState(prev => ({
        ...prev,
        sensors: { ...prev.sensors, waterDetected: true },
        status: 'WARNING'
      }));

      const waterAlert = {
        id: 'alt_' + Math.random().toString(36).substring(2, 9),
        deviceId: 'BLINDSTICK001',
        isDemoData: true,
        type: 'WATER_HAZARD',
        category: 'Water Detections',
        severity: 'WARNING',
        title: 'Puddle / Moisture Ingress Detected (Simulated)',
        description: 'Bottom probe immersed in standing water. DFPlayer sound cue #3 playing on speaker.',
        timestamp: now,
        status: 'ACTIVE',
        notificationStatus: 'Local Audio Cue Active',
        recipient: null,
        locationEstimate: 'Footpath surface'
      };

      setAlerts(prev => [waterAlert, ...prev]);
      setTimeline(prev => [{
        id: 'act_' + Math.random().toString(36).substring(2, 9),
        category: 'Water Detections',
        type: 'WATER_HAZARD',
        title: 'Moisture Alert (Simulated Demo)',
        description: 'Bottom electrolytic contact probe triggered.',
        timestamp: now,
        severity: 'WARNING',
        isDemoData: true,
        meta: 'Stick audio feedback'
      }, ...prev]);

      setToastNotification({
        id: waterAlert.id,
        type: 'HAZARD WARNING',
        title: 'Water Puddle Ahead',
        message: 'Smart stick acoustic warning buzzer activated.',
        severity: 'WARNING',
        time: 'Just now'
      });
    } else if (type === 'MANUAL_SOS') {
      const sosAlert = {
        id: 'alt_' + Math.random().toString(36).substring(2, 9),
        deviceId: 'BLINDSTICK001',
        isDemoData: true,
        type: 'MANUAL_SOS',
        category: 'Emergency Notifications',
        severity: 'DANGER',
        title: 'Manual Emergency SOS Activated (Simulated)',
        description: 'Handle SOS distress button pressed by user. 16-ohm speaker siren active.',
        timestamp: now,
        status: 'ACTIVE',
        notificationStatus: 'Emergency SMS Dispatched (Demo)',
        recipient: contacts.find(c => c.isPrimary)?.name || 'Primary Guardian',
        locationEstimate: 'Current user location'
      };

      setAlerts(prev => [sosAlert, ...prev]);
      setDeviceState(prev => ({
        ...prev,
        status: 'EMERGENCY',
        totalEmergencyAlerts: prev.totalEmergencyAlerts + 1
      }));

      setTimeline(prev => [{
        id: 'act_' + Math.random().toString(36).substring(2, 9),
        category: 'Emergency Notifications',
        type: 'MANUAL_SOS',
        title: 'Manual SOS Broadcast (Simulated)',
        description: 'Physical handle button triggered by visually impaired user.',
        timestamp: now,
        severity: 'DANGER',
        isDemoData: true,
        meta: 'Emergency SMS broadcast'
      }, ...prev]);

      setToastNotification({
        id: sosAlert.id,
        type: 'EMERGENCY BROADCAST',
        title: 'Manual SOS Triggered',
        message: 'High priority alert dispatched to guardian contact list.',
        severity: 'DANGER',
        time: 'Just now'
      });
    } else if (type === 'RESET_HAZARDS') {
      setDeviceState(prev => ({
        ...prev,
        status: isDeviceOnline ? 'ONLINE' : 'OFFLINE',
        sensors: {
          ...prev.sensors,
          waterDetected: false,
          fallDetected: false,
          frontDistance: 82,
          movementStatus: 'Active Walking'
        }
      }));
    }
  };

  // Resolve Alert / False Alarm
  const resolveAlert = (alertId, resolutionAction = 'RESOLVE') => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: resolutionAction === 'FALSE_ALARM' ? 'FALSE_ALARM' : 'RESOLVED',
          resolvedAt: new Date().toISOString()
        };
      }
      return a;
    }));

    // If no remaining active emergency alerts, clear emergency stick status
    const remainingActiveEmergency = alerts.some(a => a.id !== alertId && a.status === 'ACTIVE' && a.severity === 'DANGER');
    if (!remainingActiveEmergency) {
      setDeviceState(prev => ({
        ...prev,
        status: isDeviceOnline ? 'ONLINE' : 'OFFLINE',
        sensors: { ...prev.sensors, fallDetected: false }
      }));
    }
  };

  // Contact CRUD Management (Frontend state with validation)
  const addContact = (contactData) => {
    const newContact = {
      ...contactData,
      id: 'c_' + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };

    if (contactData.isPrimary) {
      setContacts(prev => prev.map(c => ({ ...c, isPrimary: false })).concat(newContact));
    } else {
      setContacts(prev => [...prev, newContact]);
    }
    return { success: true, data: newContact };
  };

  const updateContact = (id, updatedFields) => {
    setContacts(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, ...updatedFields };
      }
      if (updatedFields.isPrimary) {
        return { ...c, isPrimary: false };
      }
      return c;
    }));
    return { success: true };
  };

  const deleteContact = (id) => {
    setContacts(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length > 0 && !filtered.some(c => c.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
    return { success: true };
  };

  const triggerTestNotification = (id) => {
    const contact = contacts.find(c => c.id === id);
    setToastNotification({
      id: 'test_' + Date.now(),
      type: 'SIMULATED SMS TEST',
      title: `Test Alert Sent to ${contact?.name || 'Contact'}`,
      message: `Simulated SMS & Call test dispatched to ${contact?.phoneNumber || 'phone number'}.`,
      severity: 'INFO',
      time: 'Just now'
    });
    return { success: true };
  };

  return (
    <DeviceContext.Provider value={{
      deviceState,
      setDeviceState,
      contacts,
      alerts,
      timeline,
      activitySeries,
      isDeviceOnline,
      setIsDeviceOnline,
      isSimulatingLiveWalk,
      setIsSimulatingLiveWalk,
      toastNotification,
      setToastNotification,
      triggerSimulatedEvent,
      resolveAlert,
      addContact,
      updateContact,
      deleteContact,
      triggerTestNotification
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
