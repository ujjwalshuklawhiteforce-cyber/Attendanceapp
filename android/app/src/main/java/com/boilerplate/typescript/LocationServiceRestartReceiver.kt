package com.attendance.name

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

class RestartServiceReceiver : BroadcastReceiver() {
    
    private val TAG = "RestartServiceReceiver"
    
    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "🔄 Restart broadcast received")
        
        val sharedPreferences = context.getSharedPreferences("LocationTracking", Context.MODE_PRIVATE)
        val isCheckedIn = sharedPreferences.getBoolean("is_checked_in", false)
        val userId = sharedPreferences.getString("user_id", null)
        val checkinDate = sharedPreferences.getString("checkin_date", null)
        
        if (isCheckedIn && userId != null) {
            Log.d(TAG, "✅ Restarting location service for user: $userId")
            
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
                Log.d(TAG, "✅ Service restarted successfully")
            } catch (e: Exception) {
                Log.e(TAG, "❌ Failed to restart service: ${e.message}")
            }
        } else {
            Log.d(TAG, "⏸️ User not checked in - Service not started")
        }
    }
}