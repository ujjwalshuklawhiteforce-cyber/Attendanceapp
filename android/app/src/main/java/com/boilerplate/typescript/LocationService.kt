package com.attendance.name

import android.app.*
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.util.Log
import android.preference.PreferenceManager
import com.google.android.gms.location.*
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

class LocationService : Service() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var wakeLock: PowerManager.WakeLock

    // ⏱️ Auto-stop handler
    private val autoStopHandler = Handler(Looper.getMainLooper())
    private lateinit var autoStopRunnable: Runnable

    private val TAG = "LocationService"

    companion object {
        private const val NOTIFICATION_ID = 1
        private const val CHANNEL_ID = "location_channel"

        // ⏱️ 15 MINUTES INTERVAL
        private const val LOCATION_INTERVAL    = 15 * 60 * 1000L  // 15 minutes
        private const val FASTEST_INTERVAL     =  5 * 60 * 1000L  //  5 minutes (fastest)

        // 🔴 AUTO-STOP AFTER 8 HOURS
        private const val MAX_TRACKING_DURATION = 8 * 60 * 60 * 1000L // 8 hours in ms
    }

    // --------------------------------------------------
    // LIFECYCLE
    // --------------------------------------------------

    override fun onCreate() {
        super.onCreate()

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        val powerManager = getSystemService(POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "LocationService::WakeLock"
        )
        wakeLock.acquire(MAX_TRACKING_DURATION) // ✅ Acquire only for max duration

        // ⏰ Schedule auto-stop after 8 hours
        autoStopRunnable = Runnable {
            Log.d(TAG, "⛔ 8-hour limit reached. Auto-stopping service.")
            saveStopTimestamp(reason = "auto_8h")
            stopSelf()
        }
        autoStopHandler.postDelayed(autoStopRunnable, MAX_TRACKING_DURATION)

        Log.d(TAG, "✅ LocationService created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "▶️ LocationService started")

        saveStartTimestamp()

        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification())

        // 🔥 Get first location immediately on start
        getImmediateLocationOnce()

        // ⏱️ Begin periodic 15-min updates
        startLocationUpdates()

        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()

        fusedLocationClient.removeLocationUpdates(locationCallback)

        // Cancel auto-stop if service is stopped manually before 8h
        autoStopHandler.removeCallbacks(autoStopRunnable)

        if (wakeLock.isHeld) {
            wakeLock.release()
        }

        Log.d(TAG, "⏹️ LocationService destroyed")
    }

    override fun onBind(intent: Intent?): IBinder? = null

    // --------------------------------------------------
    // NOTIFICATION
    // --------------------------------------------------

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Attendance Tracking",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Background location tracking"
                setShowBadge(false)
            }

            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(this)
        }

        return builder
            .setContentTitle("Location Tracking Active")
            .setContentText("WhiteForce Attendance tracks your location every 5 minutes.")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    // --------------------------------------------------
    // LOCATION LOGIC
    // --------------------------------------------------

    private fun startLocationUpdates() {
        val request = LocationRequest.create().apply {
            interval        = LOCATION_INTERVAL
            fastestInterval = FASTEST_INTERVAL
            priority        = LocationRequest.PRIORITY_HIGH_ACCURACY
        }

        try {
            fusedLocationClient.requestLocationUpdates(
                request,
                locationCallback,
                Looper.getMainLooper()
            )
            Log.d(TAG, "🎯 Location updates started (every 15 min)")
        } catch (e: SecurityException) {
            Log.e(TAG, "❌ Permission error: ${e.message}")
            stopSelf()
        }
    }

    private val locationCallback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            val location = result.lastLocation ?: return

            Log.d(TAG, "📍 LOCATION UPDATE")
            Log.d(TAG, "Lat=${location.latitude}, Lng=${location.longitude}")

            saveLocationLocally(
                location.latitude,
                location.longitude,
                location.accuracy
            )
        }

        override fun onLocationAvailability(availability: LocationAvailability) {
            if (!availability.isLocationAvailable) {
                Log.w(TAG, "⚠️ Location not available")
            }
        }
    }

    // --------------------------------------------------
    // IMMEDIATE FIRST LOCATION
    // --------------------------------------------------

    private fun getImmediateLocationOnce() {
        try {
            fusedLocationClient.lastLocation
                .addOnSuccessListener { location ->
                    if (location != null) {
                        Log.d(TAG, "⚡ Immediate location received")
                        saveLocationLocally(
                            location.latitude,
                            location.longitude,
                            location.accuracy
                        )
                    } else {
                        Log.w(TAG, "⚠️ Immediate location is null")
                    }
                }
        } catch (e: SecurityException) {
            Log.e(TAG, "❌ Permission error: ${e.message}")
        }
    }

    // --------------------------------------------------
    // LOCAL STORAGE (RN COMPATIBLE)
    // --------------------------------------------------

    private fun saveLocationLocally(lat: Double, lng: Double, accuracy: Float) {
        Log.e(TAG, "🔥 saveLocationLocally CALLED")

        val prefs   = PreferenceManager.getDefaultSharedPreferences(applicationContext)
        val existing = prefs.getString("location_tracking", "[]") ?: "[]"

        val array = try {
            JSONArray(existing)
        } catch (e: Exception) {
            JSONArray()
        }

        val time = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())

        val obj = JSONObject().apply {
            put("time",      time)
            put("latitude",  lat)
            put("longitude", lng)
            put("accuracy",  accuracy)
        }

        array.put(obj)

        prefs.edit()
            .putString("location_tracking", array.toString())
            .apply()

        Log.e(TAG, "📦 SAVED → Total points = ${array.length()}")
    }

    // --------------------------------------------------
    // SESSION TIMESTAMPS
    // --------------------------------------------------

    private fun saveStartTimestamp() {
        val prefs = PreferenceManager.getDefaultSharedPreferences(applicationContext)
        val now   = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())

        prefs.edit()
            .putString("tracking_start_time", now)
            .remove("tracking_stop_time")   // Clear previous stop time
            .apply()

        Log.d(TAG, "🟢 Tracking started at $now")
    }

    private fun saveStopTimestamp(reason: String = "manual") {
        val prefs = PreferenceManager.getDefaultSharedPreferences(applicationContext)
        val now   = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())

        prefs.edit()
            .putString("tracking_stop_time",   now)
            .putString("tracking_stop_reason", reason)
            .apply()

        Log.d(TAG, "🔴 Tracking stopped at $now — reason: $reason")
    }
}