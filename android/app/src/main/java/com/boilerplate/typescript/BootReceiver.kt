package com.attendance.name

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

class BootReceiver : BroadcastReceiver() {
    
    private val TAG = "BootReceiver"
    
    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "📱 Broadcast received: ${intent.action}")
        
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_LOCKED_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED,
            "android.intent.action.QUICKBOOT_POWERON",
            "com.htc.intent.action.QUICKBOOT_POWERON" -> {
                
                Log.d(TAG, "🔄 Device booted or app updated - Checking if service should restart")
                
                // Check if user was checked in
                val sharedPreferences = context.getSharedPreferences("LocationTracking", Context.MODE_PRIVATE)
                val isCheckedIn = sharedPreferences.getBoolean("is_checked_in", false)
                val userId = sharedPreferences.getString("user_id", null)
                val checkinDate = sharedPreferences.getString("checkin_date", null)
                
                if (isCheckedIn && userId != null) {
                    Log.d(TAG, "✅ User is checked in - Restarting location service")
                    Log.d(TAG, "👤 User ID: $userId")
                    Log.d(TAG, "📅 Check-in Date: $checkinDate")
                    
                    val serviceIntent = Intent(context, LocationService::class.java).apply {
                        putExtra("user_id", userId)
                        putExtra("is_checked_in", isCheckedIn)
                        putExtra("checkin_date", checkinDate)
                    }
                    
                    try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            context.startForegroundService(serviceIntent)
                        } else {
                            context.startService(serviceIntent)
                        }
                        Log.d(TAG, "✅ Location service restarted successfully")
                    } catch (e: Exception) {
                        Log.e(TAG, "❌ Failed to restart service: ${e.message}")
                    }
                } else {
                    Log.d(TAG, "⏸️ User not checked in - Service not started")
                }
            }
        }
    }
}