// Service Worker Registration with update notifications and skip waiting handling

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
};

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config?: Config): void {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Check if service worker exists on localhost
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service worker.'
          );
        });
      } else {
        // Register service worker in production
        registerValidSW(swUrl, config);
      }
    });

    // Set up broadcast channel for offline/online events
    setupBroadcastChannel(config);

    // Set up online/offline event listeners
    setupNetworkListeners(config);
  }
}

function registerValidSW(swUrl: string, config?: Config): void {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available
              console.log(
                'New content is available and will be used when all tabs for this page are closed.'
              );

              // Execute callback for update
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }

              // Dispatch custom event for UI notification
              window.dispatchEvent(
                new CustomEvent('swUpdate', { detail: registration })
              );
            } else {
              // Content is cached for offline use
              console.log('Content is cached for offline use.');

              // Execute callback for success
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }

              // Dispatch custom event
              window.dispatchEvent(
                new CustomEvent('swSuccess', { detail: registration })
              );
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config): void {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found, proceed with registration
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
      if (config && config.onOffline) {
        config.onOffline();
      }
    });
}

export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Skip waiting and refresh the page
export function skipWaitingAndRefresh(registration: ServiceWorkerRegistration): void {
  const waitingServiceWorker = registration.waiting;

  if (waitingServiceWorker) {
    waitingServiceWorker.addEventListener('statechange', (event) => {
      const target = event.target as ServiceWorker;
      if (target.state === 'activated') {
        window.location.reload();
      }
    });

    waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
  }
}

// Set up broadcast channel to receive messages from service worker
function setupBroadcastChannel(config?: Config): void {
  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('sw-messages');

    channel.addEventListener('message', (event) => {
      if (event.data.type === 'ONLINE') {
        if (config && config.onOnline) {
          config.onOnline();
        }
        window.dispatchEvent(new CustomEvent('swOnline'));
      } else if (event.data.type === 'OFFLINE') {
        if (config && config.onOffline) {
          config.onOffline();
        }
        window.dispatchEvent(new CustomEvent('swOffline'));
      }
    });
  }
}

// Set up network status listeners
function setupNetworkListeners(config?: Config): void {
  window.addEventListener('online', () => {
    console.log('Back online');
    if (config && config.onOnline) {
      config.onOnline();
    }
    window.dispatchEvent(new CustomEvent('networkOnline'));
  });

  window.addEventListener('offline', () => {
    console.log('Gone offline');
    if (config && config.onOffline) {
      config.onOffline();
    }
    window.dispatchEvent(new CustomEvent('networkOffline'));
  });
}

// Utility to check if there's a waiting service worker
export function hasWaitingServiceWorker(): Promise<boolean> {
  return navigator.serviceWorker.ready.then((registration) => {
    return registration.waiting !== null;
  });
}

// Utility to get current registration
export function getRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.getRegistration();
  }
  return Promise.resolve(undefined);
}

// Check online status
export function isOnline(): boolean {
  return navigator.onLine;
}
