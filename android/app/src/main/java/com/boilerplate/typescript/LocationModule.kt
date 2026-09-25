package com.attendance.name

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.util.Log

class LocationModule(private val reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    private val TAG = "LocationModule"
    
    override fun getName(): String {
        return "LocationTracking"
    }
    
    @ReactMethod
    fun startLocationService(promise: Promise) {
        try {
            val serviceIntent = Intent(reactContext, LocationService::class.java)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(serviceIntent)
            } else {
                reactContext.startService(serviceIntent)
            }
            
            Log.d(TAG, "✅ Location service started from React Native")
            promise.resolve("Location tracking started")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Failed to start location service: ${e.message}")
            promise.reject("START_SERVICE_ERROR", e.message, e)
        }
    }
    
    @ReactMethod
    fun stopLocationService(promise: Promise) {
        try {
            val serviceIntent = Intent(reactContext, LocationService::class.java)
            reactContext.stopService(serviceIntent)
            
            Log.d(TAG, "⏹️ Location service stopped from React Native")
            promise.resolve("Location tracking stopped")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Failed to stop location service: ${e.message}")
            promise.reject("STOP_SERVICE_ERROR", e.message, e)
        }
    }
    
    @ReactMethod
    fun isServiceRunning(promise: Promise) {
        try {
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CHECK_SERVICE_ERROR", e.message, e)
        }
    }
}