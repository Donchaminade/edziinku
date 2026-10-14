import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    listeners.forEach((listener) => listener());
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    listeners.forEach((listener) => listener());
  });
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/**
 * Invitation à installer l’application : `canInstall` n’est vrai que lorsque le
 * navigateur a proposé l’installation (Chrome, Edge, Samsung Internet) et que
 * l’application n’est pas déjà ouverte en mode installé.
 */
export function useInstallPrompt() {
  const [, bump] = useState(0);
  const [standalone, setStandalone] = useState(isStandalone);

  useEffect(() => {
    const listener = () => bump((value) => value + 1);
    listeners.add(listener);
    const media = window.matchMedia('(display-mode: standalone)');
    const update = () => setStandalone(isStandalone());
    media.addEventListener('change', update);
    return () => {
      listeners.delete(listener);
      media.removeEventListener('change', update);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') deferred = null;
    listeners.forEach((listener) => listener());
    return outcome === 'accepted';
  }, []);

  return { canInstall: Boolean(deferred) && !standalone, standalone, install };
}
