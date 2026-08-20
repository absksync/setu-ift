import { useEffect, useState, useCallback, useRef } from 'react';
import { NotificationItem } from '../types';
import { mockStore } from '../services/mockDataStore';

export interface WebSocketEvent {
  event: string;
  data: any;
}

export function useWebSocket(onEvent?: (event: WebSocketEvent) => void) {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [latestEvent, setLatestEvent] = useState<WebSocketEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Audio tone synthesizer for emergency alerts
  const playAlertTone = useCallback((isCritical: boolean = false) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = isCritical ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isCritical ? 880 : 587.33, ctx.currentTime);
      if (isCritical) {
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
      }
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (err) {
      // Audio context might be restricted before user interaction
    }
  }, []);

  const handleIncomingEvent = useCallback((event: string, data: any) => {
    const wsEvent: WebSocketEvent = { event, data };
    setLatestEvent(wsEvent);
    if (onEvent) onEvent(wsEvent);

    if (event === 'NEW_REFERRAL') {
      const isHigh = data.risk_level === 'HIGH RISK';
      playAlertTone(isHigh);
      const notif: NotificationItem = {
        id: Date.now(),
        title: `🚨 ${data.risk_level} Referral: ${data.patient_name}`,
        message: `${data.primary_diagnosis} (MEOWS: ${data.meows_score}). ETA: ${data.estimated_time_minutes} min.`,
        category: 'HIGH_RISK_REFERRAL',
        risk_level: data.risk_level,
        referral_id: data.referral_id,
        referral_code: data.referral_code,
        created_at: new Date().toISOString(),
        is_read: false
      };
      setNotifications((prev) => [notif, ...prev.slice(0, 20)]);
    } else if (event === 'VITALS_UPDATED' && data.new_risk_level === 'HIGH RISK') {
      playAlertTone(true);
      const notif: NotificationItem = {
        id: Date.now(),
        title: `⚠️ TRANSIT ALERT: High Risk Vitals`,
        message: `En-route vitals updated — High Risk MEOWS (${data.new_meows_score}). Prepare emergency OT.`,
        category: 'VITALS_ALERT',
        risk_level: 'HIGH RISK',
        referral_id: data.referral_id,
        created_at: new Date().toISOString(),
        is_read: false
      };
      setNotifications((prev) => [notif, ...prev.slice(0, 20)]);
    } else if (event === 'READINESS_UPDATED') {
      const notif: NotificationItem = {
        id: Date.now(),
        title: `🏥 Preparedness Update`,
        message: 'Hospital teams updated the 5-point readiness checklist.',
        category: 'READINESS_UPDATE',
        risk_level: 'INFO',
        referral_id: data.referral_id,
        created_at: new Date().toISOString(),
        is_read: false
      };
      setNotifications((prev) => [notif, ...prev.slice(0, 20)]);
    }
  }, [onEvent, playAlertTone]);

  useEffect(() => {
    // 1. Subscribe to local client-side event bus
    const unsubscribe = mockStore.subscribe(handleIncomingEvent);

    // 2. Attempt WebSocket connection if backend is available
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${host}/ws`;

    let socket: WebSocket | null = null;
    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          if (parsed.event) {
            handleIncomingEvent(parsed.event, parsed.data);
          }
        } catch (err) {
          // ignore
        }
      };

      socket.onclose = () => {
        // In standalone mode, local mock store handles events
        setIsConnected(true);
      };

      socket.onerror = () => {
        setIsConnected(true);
        if (socket) socket.close();
      };
    } catch (e) {
      setIsConnected(true);
    }

    return () => {
      unsubscribe();
      if (socket) socket.close();
    };
  }, [handleIncomingEvent]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return { isConnected, notifications, latestEvent, markAllRead };
}
