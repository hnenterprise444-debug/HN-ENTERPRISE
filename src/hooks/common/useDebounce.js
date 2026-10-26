import { useState, useEffect } from 'react';

/**
 * Custom Hook for Debouncing Input Values
 * Prevents triggering network requests or expensive operations on every single keystroke.
 * 
 * @param {*} value The input value to debounce
 * @param {number} delay Delay in milliseconds (default: 300ms)
 * @returns {*} The debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
