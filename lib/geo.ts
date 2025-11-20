export function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// Haversine formula to calculate the distance between two coordinates
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/** Returns approximate degrees box for given radius (km) */
export function boundingBox(lat: number, lon: number, radiusKm: number) {
  const latDegreeKm = 110.574; // ~km per degree latitude
  const lonDegreeKm = 111.320 * Math.cos(deg2rad(lat));
  const latDelta = radiusKm / latDegreeKm;
  const lonDelta = radiusKm / lonDegreeKm;
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  };
}