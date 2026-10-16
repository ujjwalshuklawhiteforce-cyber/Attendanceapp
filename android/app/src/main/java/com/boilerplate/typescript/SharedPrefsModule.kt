package com.attendance.name

import android.preference.PreferenceManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.util.Log

class SharedPrefsModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    private val TAG = "SharedPrefsModule"
    
    override fun getName(): String {
        return "SharedPrefs"
    }
    
    @ReactMethod
    fun getLocationTracking(promise: Promise) {
        try {
            val prefs = PreferenceManager.getDefaultSharedPreferences(reactApplicationContext)
            val data = prefs.getString("location_tracking", "[]") ?: "[]"
            
            Log.d(TAG, "📖 Reading location_tracking: $data")
            promise.resolve(data)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error reading: ${e.message}")
            promise.reject("ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun clearLocationTracking(promise: Promise) {
        try {
            val prefs = PreferenceManager.getDefaultSharedPreferences(reactApplicationContext)
            prefs.edit().remove("location_tracking").apply()
            
            Log.d(TAG, "🗑️ Cleared location_tracking")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Error clearing: ${e.message}")
            promise.reject("ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun getAllKeys(promise: Promise) {
        try {
            val prefs = PreferenceManager.getDefaultSharedPreferences(reactApplicationContext)
            val allEntries = prefs.all
            val keys = allEntries.keys.joinToString(", ")
            
            Log.d(TAG, "🔑 All keys: $keys")
            promise.resolve(keys)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}