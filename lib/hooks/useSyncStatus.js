// lib/hooks/useSyncStatus.js - Sync status monitoring hook
import { useState, useEffect } from 'react';
import syncEngine from '../sync/syncEngine';

/**
 * Hook to monitor sync status
 * Returns: { isSyncing, lastSync, pending, error, synced }
 */
export const useSyncStatus = () => {
  const [syncState, setSyncState] = useState({
    isSyncing: false,
    lastSync: null,
    pending: 0,
    error: 0,
    synced: 0,
    message: null,
  });

  useEffect(() => {
    // Get initial status
    const loadStatus = async () => {
      const status = await syncEngine.getStatus();
      setSyncState(prev => ({
        ...prev,
        isSyncing: status.isSyncing,
        pending: status.stats.pending,
        error: status.stats.error,
        synced: status.stats.synced,
      }));
    };

    loadStatus();

    // Listen to sync events
    const unsubscribe = syncEngine.addListener((event) => {
      setSyncState(prev => ({
        ...prev,
        isSyncing: event.status === 'syncing',
        message: event.message,
        lastSync: event.status === 'completed' ? new Date() : prev.lastSync,
      }));

      // Update stats after sync completes
      if (event.status === 'completed' && event.result?.stats) {
        setSyncState(prev => ({
          ...prev,
          pending: event.result.stats.pending,
          error: event.result.stats.error,
          synced: event.result.stats.synced,
        }));
      }
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  // Manual sync trigger
  const triggerSync = async () => {
    return await syncEngine.sync();
  };

  return {
    ...syncState,
    triggerSync,
    hasUnsyncedChanges: syncState.pending > 0,
  };
};

export default useSyncStatus;
