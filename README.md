# 📱 White Force Attendance App

<p align="center">
  <img src="assets/camera/loginbackground.png" alt="White Force Attendance" width="220" style="border-radius: 16px;" />
</p>

<p align="center">
  <b>Enterprise-Grade AI Face Recognition & Geo-Location Mobile Attendance System</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-0.73.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/TypeScript-5.0.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Android-Kotlin-7F52FF?style=for-the-badge&logo=android&logoColor=white" alt="Android" />
  <img src="https://img.shields.io/badge/iOS-Swift-F05138?style=for-the-badge&logo=swift&logoColor=white" alt="iOS" />
  <img src="https://img.shields.io/badge/ML%20Kit-Face%20Detection-FBBC04?style=for-the-badge&logo=google&logoColor=black" alt="MLKit" />
  <img src="https://img.shields.io/badge/TensorFlow%20Lite-FaceNet%20%26%20Anti--Spoof-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow Lite" />
</p>

---

## 📌 Overview

**White Force Attendance** is a cross-platform mobile attendance and workforce management application built for field employees, office staff, and clients. It integrates **on-device artificial intelligence** for face verification and live anti-spoofing alongside **high-precision GPS tracking** to ensure transparent, accurate, and tamper-proof punch-in/out records.

---

## ✨ Key Features

### 👤 AI Face Recognition & Anti-Spoofing
- **Real-Time Face Detection**: Powered by Google ML Kit Face Detection.
- **On-Device Face Embeddings**: FaceNet (`facenet.tflite`) running natively via high-performance Kotlin and Swift bridge modules.
- **Liveness & Anti-Spoofing Protection**: `MiniFASNetV2` & `MiniFASNetV1SE` models detect printed photos, digital screens, and 3D mask spoofing attempts.
- **Cosine Similarity Matching**: Instant 1:1 face verification matching punch selfies against verified user profiles.

### 📍 Geo-Fencing & Live Location Tracking
- **High-Accuracy GPS Punching**: Validates employee latitude, longitude, and accuracy at punch time.
- **Background Location Service**: Native Android foreground service (`LocationService.kt`) with boot recovery (`BootReceiver.kt`) to log field travel and visit locations.
- **Interactive Map View**: Visual journey tracking and client site radius visualization using Google Maps.

### 👥 Alloted Team & Client Management
- **Unified Team Dashboard**: Overview of allotted team members, live present/absent stats, and punch timestamps.
- **Smart Role-Based Navigation**:
  - Employee cards seamlessly navigate to dedicated **Attendance Sheets**.
  - Client accounts route to **Client Attendance Lists**.
- **Live Search & Filters**: Search staff and field sites by name or employee registration code (`user_regcode`).

### 📅 Attendance Records & Regularization
- **Admin Attendance Sheet**: Comprehensive monthly view with attendance status indicators (Present, Absent, Half-Day, Shift logs).
- **Multi-Shift Support**: Real-time calculation for single-shift, multi-shift, and night duties.
- **Regularization & Comp-Off**: Raise and track correction requests for missed punches or off-day duties.

### 💼 Employee Self-Service
- **Leave Management**: Apply for leaves, view quota balances, and track manager approval status.
- **Payslip Viewer**: Inspect monthly salary breakdown and payment slips securely.
- **Task Management**: Create, view, and update field tasks and status reports.

---

## 🛠️ Tech Stack

| Domain | Technology / Library |
|---|---|
| **Core Framework** | React Native `0.73.3`, React `18.2.0` |
| **Language** | TypeScript `5.0.4`, JavaScript (ESNext) |
| **Android Native Bridge** | Kotlin, Android SDK 34, Android Foreground Services |
| **iOS Native Bridge** | Swift, Objective-C++, CocoaPods |
| **AI / Machine Learning** | TensorFlow Lite (`.tflite`), Google ML Kit Face Detection |
| **Camera & Vision** | `react-native-vision-camera`, `react-native-image-crop-picker` |
| **Navigation** | `@react-navigation/native` v6 (Stack & Bottom Tabs) |
| **Maps & Geo** | `react-native-maps`, `react-native-get-location`, `geolib` |
| **State & Storage** | React Context API, `@react-native-async-storage/async-storage` |
| **Networking** | `axios`, `axios-hooks` |

---

## 📂 Project Structure

```text
Attendance/
├── android/                   # Native Android project (Gradle, Kotlin modules, services)
│   ├── app/src/main/
│   │   ├── java/.../          # Native modules (FaceNetModule, LocationService, BootReceiver)
│   │   └── res/               # Android drawables, layouts, icons
├── ios/                       # Native iOS project (Xcode workspace, Podfile, Swift modules)
│   ├── rntypescriptBoilerplate/
│   │   ├── FaceNetModule.swift
│   │   ├── FaceDetector.swift
│   │   └── Models/            # TFLite models for iOS
├── assets/                    # Static image assets, Lottie animations, and brand logos
├── src/
│   ├── Base64/                # Base64 image converters
│   ├── FaceEmbading/          # Cosine similarity and embedding utilities
│   ├── Facematching/          # Camera overlay, oval crop, and face match UI
│   ├── navigation/            # App stack, bottom tabs, and routing
│   ├── screens/
│   │   ├── attendancesheet/   # Admin and user attendance sheets, tracking maps
│   │   ├── home/              # Admin dashboard, Allotedteam, Clientlist
│   │   ├── leaves/            # Leave application and approvals
│   │   ├── login/             # Authentication & Forgot password
│   │   ├── payementslip/      # Payslips and camera auto-capture
│   │   ├── profile/           # User profile and account editing
│   │   └── task/              # Task manager and task list
│   ├── services/              # Event emitters, permission helpers, network monitor
│   └── shared/                # Reusable UI components, text wrappers, buttons
├── .env.example               # Template environment configuration
├── .gitignore                 # Production-grade gitignore (excludes keys & secrets)
├── package.json               # Dependencies and build scripts
└── tsconfig.json              # TypeScript compiler configuration
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have installed the following tools:
- **Node.js**: `v18.0.0` or higher (LTS recommended)
- **Yarn** or **npm**
- **JDK**: Java Development Kit 17 (recommended for RN 0.73+)
- **Android Studio**: Android SDK (Platform 34), Build-Tools, and Emulator
- **Xcode** (macOS only): Xcode 15+ with Command Line Tools and iOS Simulator
- **CocoaPods**: `sudo gem install cocoapods`

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ujjwalshuklawhiteforce-cyber/Attendanceapp.git
   cd Attendanceapp/Attendance
   ```

2. **Install JavaScript dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file and set your custom values:
   ```bash
   cp .env.example .env
   ```

4. **Install iOS Pods (macOS only):**
   ```bash
   cd ios
   pod install
   cd ..
   ```

5. **Android Local Configuration:**
   Create `android/local.properties` (this file is git-ignored) and point it to your local Android SDK:
   ```properties
   # macOS example:
   sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk

   # Windows example:
   # sdk.dir=C:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
   ```

---

### Running the App

#### Start Metro Bundler:
```bash
npm start
# or with clean cache
npm run start
```

#### Run on Android:
```bash
npm run android
```

#### Run on iOS:
```bash
npm run ios
```

---

## 🔒 Security & Keystores (Important for Git)

To maintain strict security and protect production systems, the following files are **strictly ignored** in `.gitignore` and **must never be committed to Git**:

- `*.keystore` and `*.jks` (Android release and upload keys)
- `android/local.properties` and `key.properties` (Private local SDK paths and keystore passwords)
- `.env` and `*.env` (Environment variables and secret keys)
- `google-services.json` and `GoogleService-Info.plist` (Firebase and cloud config credentials)
- `build/`, `android/app/build/`, and `ios/DerivedData/` (Generated binaries and caches)

> 💡 **For Production Builds:** Place your signing keystore (`my-upload-key.keystore`) directly inside `android/app/` on your secure build machine and supply credentials via environment variables or a local `key.properties`.

---

## 📦 Building for Production

### Android

1. **Clean Android Build:**
   ```bash
   npm run clean:android
   ```

2. **Generate Release APK:**
   ```bash
   npm run release:android
   ```
   *Output file will be located at: `android/app/build/outputs/apk/release/app-release.apk`*

3. **Generate Android App Bundle (AAB for Google Play Store):**
   ```bash
   npm run release:play
   ```
   *Output file will be located at: `android/app/build/outputs/bundle/release/app-release.aab`*

---

## 🔧 Useful Scripts

| Command | Action |
|---|---|
| `npm start` | Starts Metro bundler with cache reset |
| `npm run android` | Builds and launches app on connected Android device/emulator |
| `npm run ios` | Builds and launches app on iOS simulator |
| `npm run clean:android` | Cleans Android Gradle cache and build folders |
| `npm run lint` | Runs ESLint over `.js`, `.ts`, and `.tsx` files |
| `npm run prettier` | Formats codebase according to Prettier rules |

---

## 📄 License

This repository is maintained for **White Force**. All rights reserved.
Unauthorized copying, modification, or distribution is strictly prohibited.
