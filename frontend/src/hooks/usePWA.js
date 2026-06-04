import { useEffect, useState } from 'react';

export function usePWA(restaurantName, roleName, logoUrl) {
  const [installPrompt, setInstallPrompt] = useState(window.deferredPrompt || null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (!restaurantName || !roleName || restaurantName === 'Restaurant') return;

    // Build absolute URL for the logo
    let absoluteLogoUrl = logoUrl;
    if (logoUrl && !logoUrl.startsWith('http')) {
      absoluteLogoUrl = window.location.origin + logoUrl;
    }

    // Default icon fallback
    if (!absoluteLogoUrl) {
      absoluteLogoUrl = window.location.origin + '/waiter_terminal.png';
    }

    // Create a dynamic PWA manifest matching the restaurant name and role
    const manifest = {
      name: `${restaurantName} - ${roleName}`,
      short_name: `${restaurantName} ${roleName}`,
      start_url: window.location.origin + window.location.pathname,
      display: 'standalone',
      background_color: '#0f172a',
      theme_color: '#6366f1',
      orientation: 'any',
      icons: [
        {
          src: absoluteLogoUrl,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: absoluteLogoUrl,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    };

    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);

    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = manifestURL;

    return () => {
      URL.revokeObjectURL(manifestURL);
    };
  }, [restaurantName, roleName, logoUrl]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const handlePromptReady = () => {
      if (window.deferredPrompt) {
        setInstallPrompt(window.deferredPrompt);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return false;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstalled(true);
      return true;
    }
    return false;
  };

  return { installPrompt, isInstalled, handleInstall };
}
