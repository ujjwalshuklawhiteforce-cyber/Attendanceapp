// import { data } from '@tensorflow/tfjs';
// import React, { useEffect, useState } from 'react';
// import { View, ActivityIndicator, Text } from 'react-native';
// import { WebView } from 'react-native-webview';
// import dayjs from "dayjs";

// const UserWiseTrackingWebView = ({ userId, date }) => {
//   const [html, setHtml] = useState('');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadTracking();
//   }, [date, userId]);

//   const generateHTML = (locations) => {
//     if (!locations.length) {
//       return `<h3>No location data</h3>`;
//     }

//     return `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8" />
//   <title>Tracking Map</title>
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">

//   <link
//     rel="stylesheet"
//     href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
//   />

//   <style>
//     html, body, #map {
//       height: 100%;
//       margin: 0;
//       padding: 0;
//     }

//     /* Custom layer control styling */
//     .leaflet-control-layers {
//       background: white;
//       border-radius: 8px;
//       box-shadow: 0 2px 8px rgba(0,0,0,0.2);
//     }

//     .leaflet-control-layers-toggle {
//       background-size: 20px 20px;
//     }
//   </style>
// </head>

// <body>
//   <div id="map"></div>

//   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

//   <script>
//     const locations = ${JSON.stringify(locations)};

//     const map = L.map('map').setView(
//       [locations[0].latitude, locations[0].longitude],
//       15
//     );

//     // Define multiple base layers
//     const baseLayers = {
//       "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         maxZoom: 19,
//         attribution: '© OpenStreetMap'
//       }),

//       "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
//         maxZoom: 19,
//         attribution: '© Esri'
//       }),

//       "Terrain": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
//         maxZoom: 17,
//         attribution: '© OpenTopoMap'
//       }),

//       "Dark Mode": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
//         maxZoom: 19,
//         attribution: '© CARTO'
//       }),

//       "Light Gray": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
//         maxZoom: 19,
//         attribution: '© CARTO'
//       })
//     };

//     // Add default layer (OpenStreetMap)
//     baseLayers["OpenStreetMap"].addTo(map);

//     // Route line
//     const latlngs = locations.map(l => [l.latitude, l.longitude]);
//     const polyline = L.polyline(latlngs, {
//       color: 'blue',
//       weight: 4,
//       opacity: 0.7
//     }).addTo(map);

//     map.fitBounds(polyline.getBounds());

//     // Markers layer group
//     const markersGroup = L.layerGroup();

//     // Add markers to the group
//     locations.forEach((loc, index) => {
//       const latlng = [loc.latitude, loc.longitude];

//       // Start marker
//       if (index === 0) {
//         L.marker(latlng).addTo(markersGroup)
//           .bindPopup(
//             "<b>Check-in</b><br/>Time: " + loc.time
//           )
//           .openPopup();
//       }
//       // End marker
//       else if (index === locations.length - 1) {
//         L.marker(latlng).addTo(markersGroup)
//           .bindPopup(
//             "<b>Check-out</b><br/>Time: " + loc.time
//           );
//       }
//       // Middle points
//       else {
//         L.circleMarker(latlng, {
//           radius: 6,
//           color: '#0066ff',
//           fillColor: '#3399ff',
//           fillOpacity: 0.9
//         })
//         .addTo(markersGroup)
//         .bindPopup(
//           "<b>Tracking Point</b><br/>Time: " + loc.time
//         );
//       }
//     });

//     // Add markers group to map
//     markersGroup.addTo(map);

//     // Define overlay layers
//     const overlayLayers = {
//       "Route": polyline,
//       "Markers": markersGroup
//     };

//     // Add layer control to map with collapsed button
//     L.control.layers(baseLayers, overlayLayers, {
//       position: 'topright',
//       collapsed: true
//     }).addTo(map);
//   </script>
// </body>
// </html>
// `;
//   };

//   const loadTracking = async () => {
//     const monthMap = {
//       Jan: "01", Feb: "02", Mar: "03", Apr: "04",
//       May: "05", Jun: "06", Jul: "07", Aug: "08",
//       Sep: "09", Oct: "10", Nov: "11", Dec: "12"
//     };

//     const parts = date.split(" ");
//     const year = parts[2];
//     const day = parts[1].replace(",", "");
//     const month = monthMap[parts[0].split("-")[1]];
//     const formattedDate = `${year}-${month}-${day}`;
//     console.log("Formatted Date:", formattedDate);

//     try {
//       setLoading(true);

//       const response = await fetch(
//         'https://whiteforcepayroll.com/admin/api/user-wise-location-tracking',
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             user_id: userId,
//             date: `${formattedDate}`,
//           }),
//         }
//       );

//       const result = await response.json();

//       if (result?.status && result?.data) {
//         const locations = JSON.parse(result.data);
//         setHtml(generateHTML(locations));
//       } else {
//         setHtml('<h3>No tracking data found</h3>');
//       }
//     } catch (e) {
//       console.error(e);
//       setHtml('<h3>Error loading tracking</h3>');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <ActivityIndicator size="large" />;

//   return (
//     <View style={{ flex: 1 }}>
//       <WebView
//         originWhitelist={['*']}
//         source={{ html }}
//         javaScriptEnabled
//         domStorageEnabled
//       />
//       <View style={{ position: 'absolute', bottom: 0, width: '100%', left: 0, right: 0, alignItems: "flex-end" }}>
//         <Text style={{ backgroundColor: 'black', padding: 2, borderRadius: 1, fontWeight: 'bold', color: 'white' }}>
//           white-force Attendance App
//         </Text>
//       </View>
//     </View>
//   );
// };

// export default UserWiseTrackingWebView;
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const UserWiseTrackingWebView = ({ userId, date }) => {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    loadTracking();
    console.log('userId', userId);
    console.log('date', date);
  }, [date, userId]);

  const generateHTML = (locations) => {
    if (!locations || !locations.length) {
      return `<h3>No location data</h3>`;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Tracking Map</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  />

  <style>
    html, body, #map {
      height: 100%;
      margin: 0;
      padding: 0;
    }

    .leaflet-control-layers {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .leaflet-control-layers-toggle {
      background-size: 20px 20px;
    }
  </style>
</head>

<body>
  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  <script>
    const locations = ${JSON.stringify(locations)};

    const map = L.map('map').setView(
      [locations[0].latitude, locations[0].longitude],
      15
    );

    const baseLayers = {
      "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }),

      "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '© Esri'
      }),

      "Terrain": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '© OpenTopoMap'
      }),

      "Dark Mode": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '© CARTO'
      }),

      "Light Gray": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '© CARTO'
      })
    };

    baseLayers["OpenStreetMap"].addTo(map);

    const latlngs = locations.map(l => [l.latitude, l.longitude]);
    const polyline = L.polyline(latlngs, {
      color: 'blue',
      weight: 4,
      opacity: 0.7
    }).addTo(map);

    map.fitBounds(polyline.getBounds());

    const markersGroup = L.layerGroup();

    locations.forEach((loc, index) => {
      const latlng = [loc.latitude, loc.longitude];

      if (index === 0) {
        L.marker(latlng).addTo(markersGroup)
          .bindPopup(
            "<b>Check-in</b><br/>Time: " + loc.time
          )
          .openPopup();
      }
      else if (index === locations.length - 1) {
        L.marker(latlng).addTo(markersGroup)
          .bindPopup(
            "<b>Check-out</b><br/>Time: " + loc.time
          );
      }
      else {
        L.circleMarker(latlng, {
          radius: 6,
          color: '#0066ff',
          fillColor: '#3399ff',
          fillOpacity: 0.9
        })
        .addTo(markersGroup)
        .bindPopup(
          "<b>Tracking Point</b><br/>Time: " + loc.time
        );
      }
    });

    markersGroup.addTo(map);

    const overlayLayers = {
      "Route": polyline,
      "Markers": markersGroup
    };

    L.control.layers(baseLayers, overlayLayers, {
      position: 'topright',
      collapsed: true
    }).addTo(map);
  </script>
</body>
</html>
`;
  };

  const MONTH_MAP = {
    Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
    Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
  };

  // Accepts a Date object, an ISO string, or a (possibly garbled/duplicated)
  // display string like "Sat-Jul Jul 04, 2026, 2026". Rather than relying on
  // dayjs to guess a format against the whole string (which fails silently
  // on malformed input), this pulls out the first "<Mon> <D>, <YYYY>" chunk
  // directly with a regex + a plain month lookup — no ambiguous parsing.
  const getFormattedDate = (rawDate) => {
    // Case 1: already a real Date object
    if (rawDate instanceof Date) {
      const d = dayjs(rawDate);
      return d.isValid() ? d.format('YYYY-MM-DD') : null;
    }

    if (typeof rawDate === 'string') {
      // Already ISO (YYYY-MM-DD)?
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate.trim())) {
        return rawDate.trim();
      }

      // Pull out the first "Mon D, YYYY" chunk anywhere in the string,
      // e.g. matches "Jul 04, 2026" inside "Sat-Jul Jul 04, 2026, 2026".
      const match = rawDate.match(/([A-Za-z]{3})[a-z]*\s+(\d{1,2}),\s*(\d{4})/);
      if (match) {
        const [, monAbbr, dayNum, yearNum] = match;
        const monthNum = MONTH_MAP[monAbbr.slice(0, 1).toUpperCase() + monAbbr.slice(1, 3).toLowerCase()];
        if (monthNum) {
          const mm = String(monthNum).padStart(2, '0');
          const dd = String(dayNum).padStart(2, '0');
          return `${yearNum}-${mm}-${dd}`;
        }
      }
    }

    console.warn('Could not parse date prop, value was:', rawDate);
    return null;
  };

  const loadTracking = async () => {
    setErrorMsg(null);

    const formattedDate = getFormattedDate(date);
    console.log('Formatted Date:', formattedDate);

    if (!formattedDate) {
      setHtml('<h3>Invalid date</h3>');
      setErrorMsg('Could not parse the date prop passed to this component.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        'https://whiteforcepayroll.com/admin/api/user-wise-location-tracking',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: `${userId}`,
            date: `${formattedDate}`,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const result = await response.json();
      console.log('result', result);

      if (result?.status && result?.data) {
        const locations = JSON.parse(result.data);
        setHtml(generateHTML(locations));
      } else {
        setHtml('<h3>No tracking data found</h3>');
      }
    } catch (e) {
      console.error('Tracking fetch error:', e.message, e);
      setErrorMsg(e.message);
      setHtml(`<h3>Error loading tracking: ${e.message}</h3>`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
      />
      {errorMsg ? (
        <View style={{ position: 'absolute', top: 0, width: '100%', padding: 8, backgroundColor: '#ffdddd' }}>
          <Text style={{ color: '#900', fontSize: 12 }}>{errorMsg}</Text>
        </View>
      ) : null}
      <View style={{ position: 'absolute', bottom: 0, width: '100%', left: 0, right: 0, alignItems: 'flex-end' }}>
        <Text style={{ backgroundColor: 'black', padding: 2, borderRadius: 1, fontWeight: 'bold', color: 'white' }}>
          white-force Attendance App
        </Text>
      </View>
    </View>
  );
};

export default UserWiseTrackingWebView;