import { useEffect, useState, useCallback, useRef } from 'react';
import { NotificationItem } from '../types';

export interface WebSocketEvent {
  event: string;
  data: any;
}

export function useWebSocket(onEvent?: (event: WebSocketEvent) => void) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
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
      osc.frequency.setValueAtTime(isCritical ? 880 : 587.33, ctx.currentTime); // A5 or D5
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

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        console.log('[SETU-IFT WS] Connected to Real-time Stream');
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event) {
            setLatestEvent(parsed);
            if (onEvent) onEvent(parsed);

            // If it's a new referral or emergency vitals, create local notification item
            if (parsed.event === 'NEW_REFERRAL') {
              const isHigh = parsed.data.risk_level === 'HIGH RISK';
              playAlertTone(isHigh);
              const notif: NotificationItem = {
                id: Date.now(),
                title: `🚨 ${parsed.data.risk_level} Referral: ${parsed.data.patient_name}`,
                message: `${parsed.data.primary_diagnosis} (MEOWS: ${parsed.data.meows_score}). ETA: ${parsed.data.estimated_time_minutes} min.`,
                category: 'HIGH_RISK_REFERRAL',
                risk_level: parsed.data.risk_level,
                referral_id: parsed.data.referral_id,
                referral_code: parsed.data.referral_code,
                created_at: new Date().toISOString(),
                is_read: false
              };
              setNotifications(prev => [notif, ...prev.slice(0, 20)]);
            } else if (parsed.event === 'VITALS_UPDATED' && parsed.data.risk_level === 'HIGH RISK') {
              playAlertTone(true);
              const notif: NotificationItem = {
                id: Date.now(),
                title: `⚠️ TRANSIT ALERT: ${parsed.data.patient_name}`,
                message: `En-route vitals updated — High Risk MEOWS (${parsed.data.meows_score}). Prepare emergency OT.`,
                category: 'VITALS_ALERT',
                risk_level: 'HIGH RISK',
                referral_id: parsed.data.referral_id,
                referral_code: parsed.data.referral_code,
                created_at: new Date().toISOString(),
                is_read: false
              };
              setNotifications(prev => [notif, ...prev.slice(0, 20)]);
            } else if (parsed.event === 'READINESS_UPDATED') {
              const notif: NotificationItem = {
                id: Date.now(),
                title: `🏥 Preparedness Update: ${parsed.data.patient_name}`,
                message: parsed.data.all_prepared ? 'All hospital resources are PREPARED!' : 'Hospital teams updated readiness checklist.',
                category: 'READINESS_UPDATE',
                risk_level: 'INFO',
                referral_id: parsed.data.referral_id,
                referral_code: parsed.data.referral_code,
                created_at: new Date().toISOString(),
                is_read: false
              };
              setNotifications(prev => [notif, ...prev.slice(0, 20)]);
            }
          }
        } catch (e) {
          // ignore non-json messages
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        console.log('[SETU-IFT WS] Disconnected. Reconnecting in 3s...');
        reconnectTimer = setTimeout(connect, 3000);
      };

      socket.onerror = (err) => {
        console.error('[SETU-IFT WS] Socket Error:', err);
        socket.close();
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (wsRef.current) wsRef.current.close();
    };
  }, [onEvent, playAlertTone]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return { isConnected, notifications, latestEvent, markAllRead };
}
