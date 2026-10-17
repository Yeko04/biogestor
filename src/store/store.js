/**
 * Central Reactive Store - Biogestor
 * Pattern: In-Memory State + PubSub Subscribers + Debounced Auto-Save
 */

import { loadData, scheduleAutoSave, saveData } from '../storage/localstore.js';
import { getDefaultState } from '../storage/default-state.js';

class ReactiveStore {
  constructor() {
    this.state = loadData();
    this.listeners = new Set();
    this._initStorageSync();
  }

  /**
   * Returns the current state snapshot (read-only reference)
   */
  getState() {
    return this.state;
  }

  /**
   * Updates state via partial object or reducer function, notifies subscribers, and schedules persistence
   * @param {Object|Function} updater - Next state slice or (prevState) => nextState
   * @param {string} [actionName='SET_STATE'] - Optional action name for debugging/logging
   */
  setState(updater, actionName = 'SET_STATE') {
    const prevState = this.state;
    const nextState = typeof updater === 'function' ? updater(prevState) : { ...prevState, ...updater };

    if (nextState === prevState) {
      return;
    }

    this.state = nextState;

    // Notify all active subscribers
    for (const listener of this.listeners) {
      try {
        listener(this.state, actionName, prevState);
      } catch (err) {
        console.error(`Error en suscriptor del Store para la acción "${actionName}":`, err);
      }
    }

    // Persist to localStorage with debounce
    scheduleAutoSave(this.state);
  }

  /**
   * Subscribes a listener to state changes
   * @param {Function} listener - Callback (state, actionName, prevState) => void
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('El suscriptor debe ser una función.');
    }
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Resets the entire state to defaults and notifies subscribers
   */
  reset(fallbackState = null) {
    const initial = fallbackState || getDefaultState();
    saveData(initial);
    this.setState(initial, 'RESET_TO_DEFAULTS');
  }

  /**
   * Syncs store across browser tabs when localStorage changes
   */
  _initStorageSync() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key && event.key.startsWith('biogestor:')) {
          try {
            const reloaded = loadData();
            this.setState(reloaded, 'CROSS_TAB_SYNC');
          } catch (e) {
            console.warn('Fallo al sincronizar cambios desde otra pestaña:', e);
          }
        }
      });
    }
  }
}

export const store = new ReactiveStore();
