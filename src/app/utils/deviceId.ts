/**
 * Device ID utility for generating and managing browser-specific device identifiers
 */

const DEVICE_ID_KEY = 'mymmo_device_id';

/**
 * Generate a unique device ID for this browser session
 */
function generateDeviceId(): string {
  // Create a unique identifier based on browser characteristics and random data
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);
  const userAgent = navigator.userAgent.replace(/\s+/g, '').substring(0, 20);
  
  // Combine timestamp, random string, and browser info
  const deviceId = `${timestamp}-${random}-${userAgent}`.substring(0, 32);
  
  return deviceId;
}

/**
 * Get or create a device ID for this browser
 * Stores it in localStorage for persistence across sessions
 */
export function getDeviceId(): string {
  try {
    // Try to get existing device ID from localStorage
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    
    if (!deviceId) {
      // Generate new device ID if none exists
      deviceId = generateDeviceId();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error accessing localStorage for device ID:', error);
    // Fallback to session-only device ID if localStorage is not available
    return generateDeviceId();
  }
}

/**
 * Clear the stored device ID (useful for logout or reset)
 */
export function clearDeviceId(): void {
  try {
    localStorage.removeItem(DEVICE_ID_KEY);
  } catch (error) {
    console.error('Error clearing device ID from localStorage:', error);
  }
}

/**
 * Generate a Firebase-like auth token for the device
 * This is a placeholder - in a real app, this would come from Firebase
 */
export function generateAuthToken(): string {
  // Generate a Firebase-like token format
  const part1 = Math.random().toString(36).substring(2, 15);
  const part2 = Math.random().toString(36).substring(2, 15);
  const part3 = Math.random().toString(36).substring(2, 15);
  
  return `${part1}:${part2}_${part3}`;
}