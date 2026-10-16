
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { LocationTracking, SharedPrefs } = NativeModules;

interface LocationPoint {
  time: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

export const useLocationService = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [loading, setLoading] = useState(false);

  // Restore tracking state on app open
  useEffect(() => {
    (async () => {
      const active = await AsyncStorage.getItem('location_tracking_active');
      setIsTracking(active === 'true');
    })();
  }, []);

  // Auto-load location data
  useEffect(() => {
    loadLocations();
    
    const interval = setInterval(() => {
      loadLocations();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;

    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ];

      if (Platform.Version >= 29) {
        permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
      }

      if (Platform.Version >= 33) {
        permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }

      const granted = await PermissionsAndroid.requestMultiple(permissions);
      
      const allGranted = Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        console.log('❌ Not all permissions granted');
        return false;
      }

      console.log('✅ All location permissions granted');
      return true;
    } catch (e) {
      console.error('❌ Permission error', e);
      return false;
    }
  }, []);

  const loadLocations = useCallback(async () => {
    try {
      if (!SharedPrefs) return;
      
      const jsonString = await SharedPrefs.getLocationTracking();
      const data = JSON.parse(jsonString);
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
      setLocations([]);
    }
  }, []);

  const startTracking = useCallback(async () => {
    const ok = await requestPermissions();
    if (!ok) throw new Error('Permissions not granted');

    await LocationTracking.startLocationService();
    await AsyncStorage.setItem('location_tracking_active', 'true');
    setIsTracking(true);
    
    // Load data after a delay to get immediate location
    setTimeout(() => loadLocations(), 2000);
  }, [requestPermissions, loadLocations]);

  const stopTracking = useCallback(async () => {
    await LocationTracking.stopLocationService();
    await AsyncStorage.removeItem('location_tracking_active');
    setIsTracking(false);
  }, []);

  const clearLocations = useCallback(async () => {
    try {
      if (!SharedPrefs) return;
      
      await SharedPrefs.clearLocationTracking();
      setLocations([]);
      console.log('🗑️ Locations cleared');
    } catch (error) {
      console.error('Error clearing locations:', error);
    }
  }, []);

  return {
    isTracking,
    locations,
    loading,
    startTracking,
    stopTracking,
    refreshLocations: loadLocations,
    clearLocations,
  };
};