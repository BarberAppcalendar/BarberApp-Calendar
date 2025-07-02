import { useEffect, useState } from 'react';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isSupported: boolean;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isSupported: false,
  });
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if PWA is supported
    const isSupported = 'serviceWorker' in navigator;
    setPwaState(prev => ({ ...prev, isSupported }));

    if (!isSupported) return;

    // Check if service worker is already registered
    const checkServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          // Only register if not already registered
          const newRegistration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', newRegistration);
        }
      } catch (error) {
        console.error('Service Worker check failed:', error);
      }
    };

    checkServiceWorker();

    // Check if app is already installed
    const checkIfInstalled = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      
      setPwaState(prev => ({ ...prev, isInstalled }));
    };

    checkIfInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setPwaState(prev => ({ ...prev, isInstallable: true }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setPwaState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
      setInstallPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!installPrompt) return false;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setPwaState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
        setInstallPrompt(null);
        return true;
      } else {
        setInstallPrompt(null);
        setPwaState(prev => ({ ...prev, isInstallable: false }));
        return false;
      }
    } catch (error) {
      console.error('Error during app installation:', error);
      return false;
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icons/icon.svg',
        badge: '/icons/icon.svg',
        ...options,
      });
    }
  };

  return {
    ...pwaState,
    installApp,
    requestNotificationPermission,
    sendNotification,
  };
}