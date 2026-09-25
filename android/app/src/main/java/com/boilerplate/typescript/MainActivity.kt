package com.attendance.name

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    // ✅ DO NOT change theme here
    // Android will keep SplashTheme until JS is ready
    super.onCreate(savedInstanceState)
  }

  override fun getMainComponentName(): String = "White-Force Attendance"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(
      this,
      mainComponentName,
      fabricEnabled
    )
}
