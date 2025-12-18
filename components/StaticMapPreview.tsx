// /components/StaticMapPreview.js
import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface StaticMapPreviewProps {
    lat: number;
    lng: number;
    zoom?: number;
    width?: number;
    height?: number;
}

// ⚠️ Note: This service is **rate-limited and highly discouraged** for production use.
// It is included here only to show a free, no-API-key alternative.
// For production, consider generating the image on your backend or using a paid service.
// The primary method of showing location should be the interactive map.
const TILE_SERVER_URL = "https://staticmap.openstreetmap.de/static.php";

export default function StaticMapPreview({
    lat,
    lng,
    zoom = 15,
    width = 400,
    height = 200,
}: StaticMapPreviewProps) {
    
    // Construct the static map URL
    const staticMapUrl = `${TILE_SERVER_URL}?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=osm-intl&markers=${lat},${lng},red-pushpin`;

    return (
        <Image
            source={{ uri: staticMapUrl }}
            style={styles.mapImage}
            resizeMode="cover"
        />
    );
}

const styles = StyleSheet.create({
    mapImage: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
});