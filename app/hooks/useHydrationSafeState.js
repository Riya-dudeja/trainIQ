import { useState, useEffect } from 'react';

export function useHydrationSafeState(initialValue) {
  const [value, setValue] = useState(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return [value, setValue, isHydrated];
}