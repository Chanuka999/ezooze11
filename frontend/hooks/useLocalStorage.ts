import { useState, Dispatch, SetStateAction, useCallback } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: SetStateAction<T>) => {
    try {
      setStoredValue((prevValue) => {
         // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(prevValue) : value;
        
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            } catch (error) {
                 console.error(`Error setting localStorage key “${key}”:`, error);
                 if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                    // Prevent alerting on every keystroke/update if quota is full
                    console.warn("LocalStorage limit exceeded.");
                 }
            }
        }
        return valueToStore;
      });
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;