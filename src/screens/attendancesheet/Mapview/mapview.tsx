// import React, { useEffect, useState } from 'react';
// import { View, ActivityIndicator } from 'react-native';
// import { WebView } from 'react-native-webview';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Text } from 'react-native-svg';

// export default function MapWithRoute() {
//   const [location, setLocation] = useState(null);

//   // Set your fixed destination 
//   const destination = {
//     latitude: 23.1667,
//     longitude: 79.9500
//   };

//   useEffect(() => {
//     const loadLocation = async () => {
//       try {
//         const lat = await AsyncStorage.getItem("latitude");
//         const lon = await AsyncStorage.getItem("longitude");
//         if (lat && lon) {
//           setLocation({
//             latitude: JSON.parse(lat),
//             longitude: JSON.parse(lon)
//           });
//         } else {
//           console.warn("No location found in AsyncStorage.");
//         }
//       } catch (e) {
//         console.error("Error reading location:", e);
//       }
//     };
//     loadLocation();
//   }, []);

//   if (!location) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="blue" />
//       </View>
//     );
//   }

//   // const htmlContent = `
//   //   <!DOCTYPE html>
//   //   <html>
//   //   <head>
//   //     <meta charset="utf-8" />
//   //     <title>Map with Route</title>
//   //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   //     <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
//   //     <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
//   //     <style>
//   //       #map { height: 100vh; width: 100vw; }
//   //       html, body { margin: 0; padding: 0; height: 100%; }
//   //     </style>
//   //   </head>
//   //   <body>
//   //     <div id="map"></div>
//   //     <script>
//   //       const origin = [${location.latitude}, ${location.longitude}];
//   //       const dest = [${destination.latitude}, ${destination.longitude}];

//   //       const map = L.map('map').setView(origin, 10);
//   //       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   //         maxZoom: 19,
//   //         attribution: ''
//   //       }).addTo(map);

//   //       L.marker(origin).addTo(map).bindPopup("Your Location").openPopup();
//   //       L.marker(dest).addTo(map).bindPopup("Destination");

//   //       async function getRoute() {
//   //         try {
//   //           const url = 'https://router.project-osrm.org/route/v1/driving/' 
//   //                       + origin[1] + ',' + origin[0] + ';' 
//   //                       + dest[1] + ',' + dest[0] 
//   //                       + '?overview=full&geometries=geojson';

//   //           console.log("Requesting route from:", origin, "to:", dest);
//   //           const response = await fetch(url);
//   //           const data = await response.json();

//   //           if (!data.routes || data.routes.length === 0) {
//   //             alert("No route found.");
//   //             return;
//   //           }

//   //           const route = data.routes[0].geometry;
//   //           console.log("Route data:", JSON.stringify(route));

//   //           L.geoJSON(route, {
//   //             style: {
//   //               color: 'blue',
//   //               weight: 4,
//   //               opacity: 0.8
//   //             }
//   //           }).addTo(map);
//   //         } catch (error) {
//   //           console.error("Route fetch failed:", error);
//   //           alert("Error fetching route.");
//   //         }
//   //       }

//   //       getRoute();
//   //     </script>
//   //   </body>
//   //   </html>
//   // `;
// const htmlContent = `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="utf-8" />
//   <title>Map with Route</title>
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
//   <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
//   <style>
//     #map { height: 100vh; width: 100vw; }
//     html, body { margin: 0; padding: 0; height: 100%; }
//   </style>
// </head>
// <body>
//   <div id="map"></div>
//   <script>
//     const origin = [${location.latitude}, ${location.longitude}]; // Current location
//     const dest = [${destination.latitude}, ${destination.longitude}]; // Destination location

//     const map = L.map('map').setView(origin, 13);
//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       maxZoom: 19,
//       attribution: ''
//     }).addTo(map);

//     // Custom icons
//     const employeeIcon = L.icon({
//       iconUrl: 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png', // Man icon
//       iconSize: [32, 32],
//       iconAnchor: [16, 32],
//       popupAnchor: [0, -32]
//     });

//     const officeIcon = L.icon({
//       iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Home icon
//       iconSize: [32, 32],
//       iconAnchor: [16, 32],
//       popupAnchor: [0, -32]
//     });

//     // Add markers
//     L.marker(origin, { icon: employeeIcon }).addTo(map)
//       .bindPopup("👤 Your Location (Employee)").openPopup();

//     L.marker(dest, { icon: officeIcon }).addTo(map)
//       .bindPopup("🏠 samudariya mall");

//     // Draw route
//     async function getRoute() {
//       try {
//         const url = 'https://router.project-osrm.org/route/v1/driving/' 
//                     + origin[1] + ',' + origin[0] + ';' 
//                     + dest[1] + ',' + dest[0] 
//                     + '?overview=full&geometries=geojson';

//         const response = await fetch(url);
//         const data = await response.json();

//         if (!data.routes || data.routes.length === 0) {
//           alert("No route found.");
//           return;
//         }

//         const route = data.routes[0].geometry;
//         L.geoJSON(route, {
//           style: {
//             color: 'blue',
//             weight: 4,
//             opacity: 0.8
//           }
//         }).addTo(map);
//       } catch (error) {
//         console.error("Route fetch failed:", error);
//         alert("Error fetching route.");
//       }
//     }

//     getRoute();
//   </script>
// </body>
// </html>
// `;


//   return (
//     <View style={{ flex: 1 }}>
//       <WebView
//         originWhitelist={['*']}
//         source={{ html: htmlContent }}
//         javaScriptEnabled={true}
//         domStorageEnabled={true}
//       />
//   <View style={{position: 'absolute', bottom: 0, right: 5, zIndex: 1, backgroundColor: 'white', padding: 30, borderRadius: 5 }}>
//        <Text>TGRRTRTR</Text>
//   </View>
//     </View>
//   );
// }
// import React, { useEffect, useState } from 'react';
// import { View, ActivityIndicator } from 'react-native';
// import { WebView } from 'react-native-webview';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Text } from 'react-native-svg';

// export default function MapWithRoute() {
//   const [location, setLocation] = useState(null);

//   const destination = {
//     latitude: 23.148,
//     longitude:79.901
//   };

//   useEffect(() => {
//     const loadLocation = async () => {
//       try {
//         const lat = await AsyncStorage.getItem("latitude");
//         const lon = await AsyncStorage.getItem("longitude");
//         if (lat && lon) {
//           setLocation({
//             latitude: JSON.parse(lat),
//             longitude: JSON.parse(lon)
//           });
//         } else {
//           console.warn("No location found in AsyncStorage.");
//         }
//       } catch (e) {
//         console.error("Error reading location:", e);
//       }
//     };
//     loadLocation();
//   }, []);

//   if (!location) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="blue" />
//       </View>
//     );
//   }

//   const htmlContent = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="utf-8" />
//       <title>Map with Route</title>
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
//       <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
//       <style>
//         #map { height: 100vh; width: 100vw; }
//         html, body { margin: 0; padding: 0; height: 100%; }
//       </style>
//     </head>
//     <body>
//       <div id="map"></div>
//       <script>
//         const origin = [${location.latitude}, ${location.longitude}];
//         const dest = [${destination.latitude}, ${destination.longitude}];

//         const map = L.map('map').setView(origin, 13);
//         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//           maxZoom: 19,
//           attribution: ''
//         }).addTo(map);

//         const employeeIcon = L.icon({
//           iconUrl: 'https://cdn-icons-png.flaticon.com/512/1946/1946429.png',
//           iconSize: [32, 32],
//           iconAnchor: [16, 32],
//           popupAnchor: [0, -32]
//         });

//         const officeIcon = L.icon({
//           iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
//           iconSize: [32, 32],
//           iconAnchor: [16, 32],
//           popupAnchor: [0, -32]
//         });

//         L.marker(origin, { icon: employeeIcon }).addTo(map)
//           .bindPopup("👤 Your Location (Employee)").openPopup();

//         L.marker(dest, { icon: officeIcon }).addTo(map)
//           .bindPopup("🏠 Samudariya Mall");

//         // Add 100m radius circle
//        L.circle(dest, {
//   color: 'green',            // Outline color
//   fillColor: 'green',        // Fill color
//   fillOpacity: 0.3,          // Transparency
//   radius: 00                // Radius in meters
// }).addTo(map).bindPopup("📍 100m Zone");

//         async function getRoute() {
//           try {
//             const url = 'https://router.project-osrm.org/route/v1/driving/' 
//                         + origin[1] + ',' + origin[0] + ';' 
//                         + dest[1] + ',' + dest[0] 
//                         + '?overview=full&geometries=geojson';

//             const response = await fetch(url);
//             const data = await response.json();

//             if (!data.routes || data.routes.length === 0) {
//               alert("No route found.");
//               return;
//             }

//             const route = data.routes[0].geometry;
//             L.geoJSON(route, {
//               style: {
//                 color: 'blue',
//                 weight: 4,
//                 opacity: 0.8
//               }
//             }).addTo(map);
//           } catch (error) {
//             console.error("Route fetch failed:", error);
//             alert("Error fetching route.");
//           }
//         }

//         getRoute();
//       </script>
//     </body>
//     </html>
//   `;

//   return (
//     <View style={{ flex: 1 }}>
//       <WebView
//         originWhitelist={['*']}
//         source={{ html: htmlContent }}
//         javaScriptEnabled={true}
//         domStorageEnabled={true}
//       />
//       <View style={{ position: 'absolute', bottom: 0, right: 5, zIndex: 1, backgroundColor: 'white', padding: 30, borderRadius: 5 }}>
//         <Text>TGRRTRTR</Text>
//       </View>
//     </View>
//   );
// }
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text as RNText } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MapWithRoute() {
  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get employee current location
        const lat = await AsyncStorage.getItem("latitude");
        const lon = await AsyncStorage.getItem("longitude");

        if (lat && lon) {
          setLocation({
            latitude: JSON.parse(lat),
            longitude: JSON.parse(lon),
          });
        } else {
          console.warn("⚠️ No employee location found in AsyncStorage.");
        }

        // Get office location and name
        const office = await AsyncStorage.getItem("employee_locations");
        if (office) {
          const parsed = JSON.parse(office);
          if (parsed.length > 0) {
            setDestination({
              latitude: parsed[0].latitude,
              longitude: parsed[0].longitude,
              name: parsed[0].location_name || "Office",
            });
          }
        } else {
          console.warn("⚠️ No office location found in AsyncStorage.");
        }
      } catch (e) {
        console.error("❌ Error reading location:", e);
      }
    };

    loadData();
  }, []);

  // Show loader until both locations are loaded
  if (!location || !destination) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Map with Route</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <style>
        #map { height: 100vh; width: 100vw; }
        html, body { margin: 0; padding: 0; height: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const origin = [${location.latitude}, ${location.longitude}];
        const dest = [${destination.latitude}, ${destination.longitude}];
        const destName = "${destination.name}";

        const map = L.map('map').setView(origin, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: ''
        }).addTo(map);

        // Employee icon
        const employeeIcon = L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/3048/3048122.png",
          iconSize: [50, 50],
          iconAnchor: [25, 50],
          popupAnchor: [0, -50]
        });

        // Office icon
        const officeIcon = L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/1259/1259762.png',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });

        L.marker(origin, { icon: employeeIcon }).addTo(map)
          .bindPopup("You").openPopup();

        L.marker(dest, { icon: officeIcon }).addTo(map)
          .bindPopup(destName);

        // 200m radius circle around office
        L.circle(dest, {
          color: 'green',
          fillColor: 'green',
          fillOpacity: 0.3,
          radius: 200
        }).addTo(map).bindPopup("📍 200m Zone");

        async function getRoute() {
          try {
            const url = 'https://router.project-osrm.org/route/v1/driving/' 
                        + origin[1] + ',' + origin[0] + ';' 
                        + dest[1] + ',' + dest[0] 
                        + '?overview=full&geometries=geojson';

            const response = await fetch(url);
            const data = await response.json();

            if (!data.routes || data.routes.length === 0) {
              alert("No route found.");
              return;
            }

            const route = data.routes[0].geometry;
            L.geoJSON(route, {
              style: {
                color: 'blue',
                weight: 4,
                opacity: 0.8
              }
            }).addTo(map);
          } catch (error) {
            console.error("Route fetch failed:", error);
            alert("Error fetching route.");
          }
        }

        getRoute();
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
      <View style={{
        position: 'absolute',
        bottom: 0,
        right: 5,
        zIndex: 1,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5
      }}>
        <RNText>Map Loaded</RNText>
      </View>
    </View>
  );
}

