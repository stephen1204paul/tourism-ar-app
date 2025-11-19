import React, { useEffect, useRef, useState } from 'react';
import 'aframe';
import 'ar.js';

interface ARViewerProps {
  markerUrl?: string;
  modelUrl?: string;
  scale?: number;
  onMarkerFound?: () => void;
  onMarkerLost?: () => void;
}

export const ARViewer: React.FC<ARViewerProps> = ({
  markerUrl = 'preset:hiro',
  modelUrl,
  scale = 1,
  onMarkerFound,
  onMarkerLost,
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [isARSupported, setIsARSupported] = useState(true);

  useEffect(() => {
    // Check if AR is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsARSupported(false);
      console.error('AR not supported on this device');
      return;
    }

    // Request camera permission
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        console.log('Camera permission granted');
      })
      .catch((error) => {
        console.error('Camera permission denied:', error);
        setIsARSupported(false);
      });

    // Add event listeners for marker detection
    const marker = document.querySelector('a-marker');
    if (marker) {
      marker.addEventListener('markerFound', () => {
        console.log('Marker found!');
        onMarkerFound?.();
      });

      marker.addEventListener('markerLost', () => {
        console.log('Marker lost!');
        onMarkerLost?.();
      });
    }

    return () => {
      // Cleanup event listeners
      if (marker) {
        marker.removeEventListener('markerFound', () => {});
        marker.removeEventListener('markerLost', () => {});
      }
    };
  }, [onMarkerFound, onMarkerLost]);

  if (!isARSupported) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>AR Not Supported</h2>
        <p>
          Your device doesn't support AR features. Please try on a device with a
          camera and WebRTC support.
        </p>
      </div>
    );
  }

  return (
    <div ref={sceneRef} style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <a-scene
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
        vr-mode-ui="enabled: false"
      >
        {/* Camera */}
        <a-entity camera></a-entity>

        {/* Marker */}
        <a-marker preset={markerUrl.includes('preset:') ? markerUrl.split(':')[1] : undefined} type={markerUrl.includes('preset:') ? 'pattern' : 'pattern'} url={markerUrl.includes('preset:') ? undefined : markerUrl}>
          {/* 3D Model or default box */}
          {modelUrl ? (
            <a-entity
              gltf-model={modelUrl}
              scale={`${scale} ${scale} ${scale}`}
              position="0 0 0"
              animation="property: rotation; to: 0 360 0; loop: true; dur: 10000"
            ></a-entity>
          ) : (
            <a-box
              position="0 0.5 0"
              material="color: blue;"
              scale={`${scale} ${scale} ${scale}`}
              animation="property: rotation; to: 0 360 0; loop: true; dur: 5000"
            ></a-box>
          )}
        </a-marker>
      </a-scene>

      {/* AR Instructions Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          textAlign: 'center',
          zIndex: 1000,
        }}
      >
        <p style={{ margin: 0, fontSize: '14px' }}>
          Point your camera at an AR marker to see the 3D content
        </p>
      </div>
    </div>
  );
};

export default ARViewer;
