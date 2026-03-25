import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getCurtidasPreviewCount } from '@/lib/curtidas-from-events';

type CurtidasBadgeContextValue = {
  count: number;
  refreshCurtidasBadge: () => Promise<void>;
};

const CurtidasBadgeContext = createContext<CurtidasBadgeContextValue | null>(null);

export function CurtidasBadgeProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);

  const refreshCurtidasBadge = useCallback(async () => {
    const n = await getCurtidasPreviewCount();
    setCount(n);
  }, []);

  useEffect(() => {
    void refreshCurtidasBadge();
  }, [refreshCurtidasBadge]);

  const value = useMemo(
    () => ({ count, refreshCurtidasBadge }),
    [count, refreshCurtidasBadge]
  );

  return (
    <CurtidasBadgeContext.Provider value={value}>{children}</CurtidasBadgeContext.Provider>
  );
}

export function useCurtidasBadge(): CurtidasBadgeContextValue {
  const ctx = useContext(CurtidasBadgeContext);
  if (!ctx) {
    throw new Error('useCurtidasBadge must be used within CurtidasBadgeProvider');
  }
  return ctx;
}
