/**
 * useAppGenerator — Hook for generating downloadable Android APKs via PWABuilder API
 * with automatic fallback to PWABuilder.com web interface.
 */
import { useState, useCallback } from 'react';

const PWABUILDER_API = 'https://api.pwabuilder.com/builder/android';

export function useAppGenerator() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'generating' | 'success' | 'error' | 'fallback'
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const generateAndroidAPK = useCallback(async ({
    restaurantId,
    restaurantName,
    role,          // 'admin' | 'waiter' | 'counter' | 'cashier'
    roleLabel,     // human readable: 'Waiter App', 'Kitchen Display', etc.
    themeColor,
    iconUrl,
    baseUrl,       // e.g. https://shadow-aura-11.github.io/Bhoj360-react
  }) => {
    setStatus('generating');
    setError('');

    const appUrl = `${baseUrl}/r/${restaurantId}/login?role=${role}`;
    const safeRestName = restaurantName.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'restaurant';
    const packageId = `com.bhoj360.${safeRestName.slice(0, 20)}.${role}`;
    const appName = `${restaurantName} ${roleLabel}`;
    const launcherName = roleLabel.length > 12 ? roleLabel.split(' ')[0] : roleLabel;

    const payload = {
      packageId,
      name: appName,
      launcherName,
      url: appUrl,
      startUrl: appUrl,
      themeColor: themeColor || '#4f46e5',
      backgroundColor: '#ffffff',
      iconUrl: iconUrl || `${baseUrl}/waiter_terminal.png`,
      display: 'standalone',
      appVersion: '1.0.0',
      appVersionCode: 1,
      enableNotifications: true,
      enableSiteSettingsShortcut: true,
      fallbackType: 'customtabs',
      features: {
        locationDelegation: { enabled: false },
        playBilling: { enabled: false },
      },
      additionalTrustedOrigins: [],
      includeSourceCode: false,
    };

    try {
      setProgress('Connecting to build server…');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 sec timeout

      setProgress('Generating Android package (this takes ~30–60 seconds)…');

      const response = await fetch(PWABUILDER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Build server responded with ${response.status}`);
      }

      setProgress('Download ready! Saving file…');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${safeRestName}-${role}-app.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      setStatus('success');
      setProgress('');
    } catch (err) {
      console.error('APK generation failed:', err);
      setStatus('fallback');
      setError(err.name === 'AbortError' ? 'Request timed out.' : err.message);
      setProgress('');
    }
  }, []);

  const openPWABuilder = useCallback(({ role, restaurantId, baseUrl }) => {
    const appUrl = `${baseUrl}/r/${restaurantId}/login?role=${role}`;
    const pwaBuilderUrl = `https://www.pwabuilder.com/?site=${encodeURIComponent(appUrl)}`;
    window.open(pwaBuilderUrl, '_blank', 'noopener,noreferrer');
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress('');
    setError('');
  }, []);

  return { status, progress, error, generateAndroidAPK, openPWABuilder, reset };
}
