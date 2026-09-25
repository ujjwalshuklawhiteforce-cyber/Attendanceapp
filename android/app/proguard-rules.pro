# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt

# ================================
# React Native
# ================================
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# ================================
# Hermes / JSC
# ================================
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.hermes.**

# ================================
# Kotlin (FIX Play Console warning)
# ================================
-keep class kotlin.collections.** { *; }
-keep class kotlin.jvm.internal.** { *; }
-dontwarn kotlin.**

# ================================
# Kotlin Android 15 Compatibility Fix
# CRITICAL: These rules prevent the problematic removeFirst/removeLast methods
# ================================
-dontwarn kotlin.collections.ArrayDeque
-dontwarn kotlin.collections.ArrayDequeKt
-dontwarn kotlin.collections.CollectionsKt__MutableCollectionsKt

# Keep all Kotlin collection extension methods to prevent renaming issues
-keepclassmembers class kotlin.collections.** {
    public <methods>;
}

# Assumenosideeffects to strip out the problematic methods during compilation
-assumenosideeffects class kotlin.collections.CollectionsKt__MutableCollectionsKt {
    public static java.lang.Object removeFirst(java.util.List);
    public static java.lang.Object removeLast(java.util.List);
    public static java.lang.Object removeFirstOrNull(java.util.List);
    public static java.lang.Object removeLastOrNull(java.util.List);
}

# Don't obfuscate Kotlin collection classes to avoid mapping file warnings
-keep class kotlin.collections.CollectionsKt__MutableCollectionsKt {
    *;
}

# ================================
# TensorFlow Lite
# ================================
-keep class org.tensorflow.lite.** { *; }
-dontwarn org.tensorflow.lite.**
-keepclassmembers class org.tensorflow.lite.** {
    native <methods>;
}

# ================================
# Google ML Kit
# ================================
-keep class com.google.mlkit.** { *; }
-dontwarn com.google.mlkit.**
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# ================================
# Your custom Face Detection module
# ================================
-keep class com.attendance.name.facematch.** { *; }
-keep class com.attendance.name.** { *; }

# ================================
# React Native Screens (if patched)
# ================================
-keep class com.swmansion.rnscreens.** { *; }
-dontwarn com.swmansion.rnscreens.**

# ================================
# General Android
# ================================
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
-keepattributes InnerClasses
-keepattributes SourceFile
-keepattributes LineNumberTable

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}