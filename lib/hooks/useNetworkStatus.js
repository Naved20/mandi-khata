// lib/hooks/useNetworkStatus.js - Network status detection hook
import { useState, useEffect } from 'react';

/**
 * Hook to detect network online/offline status
 * Returns: { isOnline, effectiveType }
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [effectiveType, setEffectiveType] = useState('4g');

  useEffect(() => {
    // Initial state
    setIsOnline(navigator.onLine);

    // Update network type if available
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        setEffectiveType(connection.effectiveType || '4g');
      }
    }

    // Listen to online event
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🟢 Network: ONLINE');
    };

    // Listen to offline event
    const handleOffline = () => {
      setIsOnline(false);
      console.log('🔴 Network: OFFLINE');
    };

    // Listen to connection change
    const handleConnectionChange = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
          setEffectiveType(connection.effectiveType || '4g');
          console.log('📶 Network type:', connection.effectiveType);
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      connection?.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        connection?.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return { isOnline, effectiveType };
};

export default useNetworkStatus;
