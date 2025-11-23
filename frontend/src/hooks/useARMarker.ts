import { useState, useEffect, useCallback, useRef } from 'react';

interface MarkerState {
  isVisible: boolean;
  lastDetectedAt: Date | null;
}

interface UseARMarkerOptions {
  /** Debounce time in ms before marking as lost (default: 500ms) */
  lostDebounceMs?: number;
  /** Callback when marker is found */
  onMarkerFound?: (markerId: string) => void;
  /** Callback when marker is lost */
  onMarkerLost?: (markerId: string) => void;
}

interface UseARMarkerResult {
  /** Whether any marker is currently visible */
  isMarkerVisible: boolean;
  /** ID of the currently visible marker (null if none) */
  markerId: string | null;
  /** Timestamp of last marker detection */
  lastDetectedAt: Date | null;
  /** Register a marker found event */
  handleMarkerFound: (markerId: string) => void;
  /** Register a marker lost event */
  handleMarkerLost: (markerId: string) => void;
  /** Get visibility state for a specific marker */
  getMarkerState: (markerId: string) => MarkerState;
  /** Reset all marker states */
  reset: () => void;
}

export function useARMarker(options: UseARMarkerOptions = {}): UseARMarkerResult {
  const {
    lostDebounceMs = 500,
    onMarkerFound,
    onMarkerLost,
  } = options;

  const [currentMarkerId, setCurrentMarkerId] = useState<string | null>(null);
  const [markerStates, setMarkerStates] = useState<Map<string, MarkerState>>(new Map());
  const lostTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      lostTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
      lostTimeoutRef.current.clear();
    };
  }, []);

  const handleMarkerFound = useCallback((markerId: string) => {
    // Clear any pending lost timeout for this marker
    const existingTimeout = lostTimeoutRef.current.get(markerId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      lostTimeoutRef.current.delete(markerId);
    }

    const now = new Date();

    setMarkerStates((prev) => {
      const newStates = new Map(prev);
      const previousState = newStates.get(markerId);

      newStates.set(markerId, {
        isVisible: true,
        lastDetectedAt: now,
      });

      // Only trigger callback if marker was previously not visible
      if (!previousState?.isVisible) {
        onMarkerFound?.(markerId);
      }

      return newStates;
    });

    setCurrentMarkerId(markerId);
  }, [onMarkerFound]);

  const handleMarkerLost = useCallback((markerId: string) => {
    // Clear any existing timeout for this marker
    const existingTimeout = lostTimeoutRef.current.get(markerId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Debounce the lost event to prevent flickering
    const timeout = setTimeout(() => {
      setMarkerStates((prev) => {
        const newStates = new Map(prev);
        const currentState = newStates.get(markerId);

        if (currentState?.isVisible) {
          newStates.set(markerId, {
            ...currentState,
            isVisible: false,
          });
          onMarkerLost?.(markerId);
        }

        return newStates;
      });

      setCurrentMarkerId((prev) => (prev === markerId ? null : prev));
      lostTimeoutRef.current.delete(markerId);
    }, lostDebounceMs);

    lostTimeoutRef.current.set(markerId, timeout);
  }, [lostDebounceMs, onMarkerLost]);

  const getMarkerState = useCallback((markerId: string): MarkerState => {
    return markerStates.get(markerId) || {
      isVisible: false,
      lastDetectedAt: null,
    };
  }, [markerStates]);

  const reset = useCallback(() => {
    // Clear all timeouts
    lostTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
    lostTimeoutRef.current.clear();

    // Reset state
    setMarkerStates(new Map());
    setCurrentMarkerId(null);
  }, []);

  const currentMarkerState = currentMarkerId
    ? markerStates.get(currentMarkerId)
    : null;

  return {
    isMarkerVisible: currentMarkerState?.isVisible || false,
    markerId: currentMarkerId,
    lastDetectedAt: currentMarkerState?.lastDetectedAt || null,
    handleMarkerFound,
    handleMarkerLost,
    getMarkerState,
    reset,
  };
}

export default useARMarker;
