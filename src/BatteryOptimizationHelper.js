// BatteryOptimizationHelper.js
import { NativeModules, Platform, Linking, Alert } from 'react-native';

const { BatteryOptimizationModule } = NativeModules;

class BatteryOptimizationHelper {
  /**
   * Check if battery optimization is ignored for the app
   */
  static async isIgnoringBatteryOptimizations() {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      if (BatteryOptimizationModule && BatteryOptimizationModule.isIgnoringBatteryOptimizations) {
        return await BatteryOptimizationModule.isIgnoringBatteryOptimizations();
      }
      return false;
    } catch (error) {
      console.error('Error checking battery optimization:', error);
      return false;
    }
  }

  /**
   * Request to ignore battery optimizations
   */
  static async requestIgnoreBatteryOptimizations() {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      const isIgnoring = await this.isIgnoringBatteryOptimizations();
      
      if (!isIgnoring) {
        Alert.alert(
          '📱 Battery Optimization',
          'For accurate location tracking, please disable battery optimization for this app. This ensures the app continues tracking even when your screen is off.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => {
                if (BatteryOptimizationModule && BatteryOptimizationModule.requestIgnoreBatteryOptimizations) {
                  BatteryOptimizationModule.requestIgnoreBatteryOptimizations();
                }
              },
            },
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting battery optimization:', error);
      return false;
    }
  }

  /**
   * Show instructions for battery optimization
   */
  static showInstructions() {
    Alert.alert(
      '🔋 Battery Optimization Settings',
      'To ensure continuous location tracking:\n\n' +
      '1. Open Settings\n' +
      '2. Go to Battery → Battery Optimization\n' +
      '3. Find this app\n' +
      '4. Select "Don\'t optimize"\n\n' +
      'This allows the app to track your location even when the screen is off.',
      [
        { text: 'Got it', style: 'default' }
      ]
    );
  }
}

export default BatteryOptimizationHelper;