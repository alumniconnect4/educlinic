'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type ClusterLike = {
  getChildCount: () => number;
};

const setupLeafletIcons = () => {
  const defaultIconPrototype = L.Icon.Default.prototype as typeof L.Icon.Default.prototype & {
    _getIconUrl?: () => string;
  };

  delete defaultIconPrototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

const customIcon =
  typeof window !== 'undefined'
    ? new L.Icon({
        iconUrl:
          'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYTYyMDI1IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIxIDEwYzAgNy05IDEzLTkgMTNzLTktNi05LTEzYTkgOSAwIDAgMSAxOCAwemIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTAiIHI9IjMiLz48L3N2Zz4=',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })
    : null;

const createClusterCustomIcon = (cluster: ClusterLike) => {
  const count = cluster.getChildCount();
  let size = 'w-8 h-8 text-xs';
  let bgColor = 'bg-[#00a8e8]/90';

  if (count > 10) {
    size = 'w-10 h-10 text-sm';
    bgColor = 'bg-[#f59e0b]/90';
  }
  if (count > 200) {
    size = 'w-14 h-14 text-base';
    bgColor = 'bg-[#e84e8a]/90';
  }
  if (count > 1000) {
    size = 'w-20 h-20 text-xl';
    bgColor = 'bg-[#d946ef]/90';
  }

  return L.divIcon({
    html: `<div class="flex items-center justify-center ${size} rounded-full ${bgColor} text-white font-bold border-[3px] border-white shadow-md">${count}</div>`,
    className: 'custom-marker-cluster',
    iconSize: L.point(40, 40, true),
  });
};

const alumniLocations = [
  { id: 1, city: 'New York', longitude: -74.006, latitude: 40.7128 },
  { id: 2, city: 'San Francisco', longitude: -122.4194, latitude: 37.7749 },
  { id: 3, city: 'London', longitude: -0.1276, latitude: 51.5074 },
  { id: 4, city: 'New Delhi', longitude: 77.209, latitude: 28.6139 },
  { id: 5, city: 'Bengaluru', longitude: 77.5946, latitude: 12.9716 },
  { id: 6, city: 'Sydney', longitude: 151.2093, latitude: -33.8688 },
  { id: 7, city: 'Toronto', longitude: -79.3832, latitude: 43.6532 },
  { id: 8, city: 'Dubai', longitude: 55.2708, latitude: 25.2048 },
];

const mapTileUrl =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ??
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const generateMarkerPositions = (
  count: number,
  baseLatitude: number,
  baseLongitude: number,
  latitudeStep: number,
  longitudeStep: number
) =>
  Array.from({ length: count }, (_, index) => [
    baseLatitude + (index % 10) * latitudeStep,
    baseLongitude + (index % 10) * longitudeStep,
  ] as [number, number]);

const p1Positions = generateMarkerPositions(13, 24.0, 54.0, 0.15, 0.1);
const p2Positions = generateMarkerPositions(24, 19.0, 72.0, 0.12, 0.08);
const p3Positions = generateMarkerPositions(145, 30.0, 75.0, 0.18, 0.09);
const p4Positions = generateMarkerPositions(20, 17.0, 78.0, 0.2, 0.11);
const p5Positions = generateMarkerPositions(10, 23.0, 88.0, 0.16, 0.1);

export default function MapComponent() {
  useEffect(() => {
    setupLeafletIcons();
  }, []);

  if (!customIcon) return null;

  return (
    <MapContainer
      center={[28.6139, 77.209]}
      zoom={3}
      scrollWheelZoom={true}
      className="w-full h-full"
      style={{ width: '100%', height: '100%', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={mapTileUrl}
      />

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
        showCoverageOnHover={false}
      >
        {alumniLocations.map((loc) => (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={customIcon}
          >
            <Popup className="rounded-lg">
              <div className="text-center p-1">
                <h4 className="font-semibold text-gray-800 m-0">{loc.city}</h4>
                <p className="text-xs text-gray-500 m-0 mt-1">
                  Alumni location
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {p1Positions.map((position, i) => (
          <Marker
            key={`p1-${i}`}
            position={position}
            icon={customIcon}
          />
        ))}
        {p2Positions.map((position, i) => (
          <Marker
            key={`p2-${i}`}
            position={position}
            icon={customIcon}
          />
        ))}
        {p3Positions.map((position, i) => (
          <Marker
            key={`p3-${i}`}
            position={position}
            icon={customIcon}
          />
        ))}
        {p4Positions.map((position, i) => (
          <Marker
            key={`p4-${i}`}
            position={position}
            icon={customIcon}
          />
        ))}
        {p5Positions.map((position, i) => (
          <Marker
            key={`p5-${i}`}
            position={position}
            icon={customIcon}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
