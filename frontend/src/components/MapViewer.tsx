import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Ambulance, Hospital, Referral } from '../types';
import { MEOWSBadge } from './MEOWSBadge';
import { Phone, Clock, Navigation } from 'lucide-react';

// Custom icons
const createAmbulanceIcon = (status: string) => {
  const isEnRoute = status === 'EN_ROUTE';
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        background: ${isEnRoute ? '#2563EB' : '#64748B'};
        width: 32px; height: 32px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid white;
        box-shadow: 0 0 12px ${isEnRoute ? 'rgba(37, 99, 235, 0.9)' : 'rgba(0,0,0,0.3)'};
        color: white; font-size: 16px;
      ">
        🚑
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createHospitalIcon = () => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        background: #DC2626;
        width: 34px; height: 34px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid white;
        box-shadow: 0 0 14px rgba(220, 38, 38, 0.9);
        color: white; font-size: 16px;
      ">
        🏥
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

const createPHCIcon = () => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        background: #16A34A;
        width: 28px; height: 28px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid white;
        box-shadow: 0 0 10px rgba(22, 163, 74, 0.8);
        color: white; font-size: 14px;
      ">
        🌿
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

interface MapViewerProps {
  ambulances: Ambulance[];
  hospitals: Hospital[];
  activeReferrals?: Referral[];
  selectedReferral?: Referral | null;
  onSelectReferral?: (ref: Referral) => void;
  center?: [number, number];
  zoom?: number;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  ambulances,
  hospitals,
  activeReferrals = [],
  selectedReferral = null,
  onSelectReferral,
  center = [18.6200, 73.8500],
  zoom = 11,
}) => {
  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hospitals Markers */}
        {hospitals.map((hosp) => (
          <Marker
            key={`hosp-${hosp.id}`}
            position={[hosp.latitude, hosp.longitude]}
            icon={createHospitalIcon()}
          >
            <Popup className="custom-popup">
              <div className="p-1 space-y-1 max-w-xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span>🏥</span>
                  <span>{hosp.name}</span>
                </div>
                <p className="text-[11px] text-slate-600">{hosp.facility_type}</p>
                <div className="text-[11px] bg-slate-100 p-1.5 rounded space-y-0.5">
                  <div><strong>Available ICU Beds:</strong> {hosp.available_icu_beds} / {hosp.total_icu_beds}</div>
                  <div><strong>Blood Bank:</strong> {hosp.blood_bank_status}</div>
                  <div><strong>OBGYN on call:</strong> {hosp.on_duty_obstetrician}</div>
                </div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  {hosp.phone}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Active Referrals Route Lines & PHC Origin Markers */}
        {activeReferrals.map((ref) => {
          const hosp = hospitals.find((h) => h.id === ref.destination_hospital_id);
          const amb = ambulances.find((a) => a.id === ref.ambulance_id);
          if (!hosp) return null;

          const isSelected = selectedReferral?.id === ref.id;
          const isHigh = ref.risk_level === 'HIGH RISK';

          const routeColor = isHigh ? '#EF4444' : isSelected ? '#2563EB' : '#F59E0B';

          return (
            <React.Fragment key={`route-${ref.id}`}>
              {/* Origin PHC Marker */}
              <Marker
                position={[ref.origin_lat, ref.origin_lng]}
                icon={createPHCIcon()}
              >
                <Popup>
                  <div className="p-1 text-xs space-y-1">
                    <div className="font-bold text-emerald-700">🌿 {ref.referring_facility_name}</div>
                    <div>Patient: <strong>{ref.patient.full_name}</strong></div>
                    <div>Doctor: {ref.referring_doctor_name}</div>
                  </div>
                </Popup>
              </Marker>

              {/* Transit Polyline */}
              <Polyline
                positions={[
                  [ref.origin_lat, ref.origin_lng],
                  amb ? [amb.current_lat, amb.current_lng] : [(ref.origin_lat + hosp.latitude)/2, (ref.origin_lng + hosp.longitude)/2],
                  [hosp.latitude, hosp.longitude]
                ]}
                pathOptions={{
                  color: routeColor,
                  weight: isSelected ? 5 : 3,
                  dashArray: isHigh ? '6, 6' : undefined,
                  opacity: 0.85
                }}
              />
            </React.Fragment>
          );
        })}

        {/* Ambulances Markers */}
        {ambulances.map((amb) => {
          const assignedRef = activeReferrals.find((r) => r.ambulance_id === amb.id && r.status === 'EN_ROUTE');

          return (
            <Marker
              key={`amb-${amb.id}`}
              position={[amb.current_lat, amb.current_lng]}
              icon={createAmbulanceIcon(amb.status)}
            >
              <Popup>
                <div className="p-1 text-xs space-y-1.5 max-w-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700">🚑 {amb.vehicle_number}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                      {amb.speed_kmh.toFixed(0)} km/h
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">Type: {amb.vehicle_type}</p>
                  <p className="text-[11px]">EMT: <strong>{amb.emt_name}</strong> ({amb.driver_phone})</p>

                  {assignedRef && (
                    <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{assignedRef.patient.full_name}</span>
                        <MEOWSBadge riskLevel={assignedRef.risk_level} score={assignedRef.meows_score} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-700 line-clamp-1">{assignedRef.primary_diagnosis}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-blue-600">
                          <Clock className="w-3 h-3" /> ETA: {assignedRef.estimated_time_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3 h-3" /> {assignedRef.distance_km} km
                        </span>
                      </div>
                      {onSelectReferral && (
                        <button
                          onClick={() => onSelectReferral(assignedRef)}
                          className="w-full mt-1 px-2 py-1 bg-primary-600 text-white rounded text-[10px] font-semibold hover:bg-primary-700"
                        >
                          View Live Handover
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur p-2.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
        <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">Transit Route Key</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-600 inline-block"></span>
          <span className="text-slate-700 dark:text-slate-300">High Risk Route (MEOWS ≥4)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-slate-700 dark:text-slate-300">Medium Risk Route</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
          <span className="text-slate-700 dark:text-slate-300">Referring PHC / CHC Center</span>
        </div>
      </div>
    </div>
  );
};
