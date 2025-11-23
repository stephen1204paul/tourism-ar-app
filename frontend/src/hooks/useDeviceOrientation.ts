import { useState, useEffect, useCallback } from 'react';

interface DeviceOrientationState {
  /** Compass heading in degrees (0-360, 0 = North) */
  heading: number | null;
  /** Front-to-back tilt in degrees (-180 to 180) */
  beta: number | null;
  /** Left-to-right tilt in degrees (-90 to 90) */
  gamma: number | null;
  /** Whether device orientation is supported */
  isSupported: boolean;
  /** Whether permission has been granted (for iOS 13+) */
  hasPermission: boolean;
  /** Error message if any */
  error: string | null;
}

interface UseDeviceOrientationOptions {
  /** Update frequency in ms (default: 100ms) */
  updateIntervalMs?: number;
  /** Whether to automatically request permission on mount */
  autoRequestPermission?: boolean;
}

interface UseDeviceOrientationResult extends DeviceOrientationState {
  /** Request permission for device orientation (required on iOS 13+) */
  requestPermission: () => Promise<boolean>;
  /** Start listening to orientation updates */
  startListening: () => void;
  /** Stop listening to orientation updates */
  stopListening: () => void;
}

// Check if DeviceOrientationEvent has requestPermission (iOS 13+)
const hasRequestPermission = typeof DeviceOrientationEvent !== 'undefined' &&
  typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function';

export function useDeviceOrientation(
  options: UseDeviceOrientationOptions = {}
): UseDeviceOrientationResult {
  const {
    updateIntervalMs = 100,
    autoRequestPermission = false,
  } = options;

  const [state, setState] = useState<DeviceOrientationState>({
    heading: null,
    beta: null,
    gamma: null,
    isSupported: typeof DeviceOrientationEvent !== 'undefined',
    hasPermission: !hasRequestPermission, // Assume permission on non-iOS devices
    error: null,
  });

  const [isListening, setIsListening] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(0);

  // Handle device orientation event
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const now = Date.now();

    // Throttle updates
    if (now - lastUpdate < updateIntervalMs) {
      return;
    }
    setLastUpdate(now);

    // Calculate compass heading
    let heading: number | null = null;

    // Use webkitCompassHeading for iOS if available
    const webkitHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
    if (webkitHeading !== undefined) {
      heading = webkitHeading;
    } else if (event.alpha !== null) {
      // For Android/other devices, alpha is the compass direction
      // Alpha is 0-360, but we need to adjust for device orientation
      heading = event.alpha;

      // Adjust for screen orientation if needed
      if (window.screen.orientation) {
        const screenOrientation = window.screen.orientation.angle;
        heading = (heading + screenOrientation) % 360;
      }
    }

    setState((prev) => ({
      ...prev,
      heading,
      beta: event.beta,
      gamma: event.gamma,
      error: null,
    }));
  }, [lastUpdate, updateIntervalMs]);

  // Request permission for device orientation (iOS 13+)
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!hasRequestPermission) {
      // Permission not required on this device
      setState((prev) => ({ ...prev, hasPermission: true }));
      return true;
    }

    try {
      const permission = await (DeviceOrientationEvent as unknown as {
        requestPermission: () => Promise<string>;
      }).requestPermission();

      const granted = permission === 'granted';
      setState((prev) => ({
        ...prev,
        hasPermission: granted,
        error: granted ? null : 'Permission denied for device orientation',
      }));

      return granted;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request permission';
      setState((prev) => ({
        ...prev,
        hasPermission: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  // Start listening to orientation updates
  const startListening = useCallback(() => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: 'Device orientation not supported',
      }));
      return;
    }

    if (!state.hasPermission) {
      setState((prev) => ({
        ...prev,
        error: 'Permission required for device orientation',
      }));
      return;
    }

    window.addEventListener('deviceorientation', handleOrientation, true);
    setIsListening(true);
  }, [state.isSupported, state.hasPermission, handleOrientation]);

  // Stop listening to orientation updates
  const stopListening = useCallback(() => {
    window.removeEventListener('deviceorientation', handleOrientation, true);
    setIsListening(false);
  }, [handleOrientation]);

  // Auto-request permission and start listening on mount
  useEffect(() => {
    const init = async () => {
      if (!state.isSupported) {
        return;
      }

      // Request permission if needed and autoRequestPermission is true
      if (hasRequestPermission && autoRequestPermission) {
        const granted = await requestPermission();
        if (!granted) {
          return;
        }
      }

      // Start listening if we have permission
      if (state.hasPermission || !hasRequestPermission) {
        startListening();
      }
    };

    init();

    return () => {
      if (isListening) {
        stopListening();
      }
    };
  }, []);

  // Restart listening when permission changes
  useEffect(() => {
    if (state.hasPermission && !isListening && state.isSupported) {
      startListening();
    }
  }, [state.hasPermission, state.isSupported, isListening, startListening]);

  return {
    ...state,
    requestPermission,
    startListening,
    stopListening,
  };
}

export default useDeviceOrientation;
