import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const DEFAULT_INDICATOR = { top: 0, height: 40, visible: false, ready: false };

export function useSidebarNavIndicator(activeItem, isCollapsed, navItems) {
  const listRef = useRef(null);
  const itemRefs = useRef({});
  const [indicator, setIndicator] = useState(DEFAULT_INDICATOR);

  const updateIndicator = useCallback(() => {
    if (!activeItem || !listRef.current) {
      setIndicator((prev) => ({ ...prev, visible: false }));
      return;
    }
    const el = itemRefs.current[activeItem.path];
    if (!el) return;
    const top = el.offsetTop;
    const height = el.offsetHeight || 40;
    setIndicator({ top, height, visible: true, ready: true });
  }, [activeItem]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, isCollapsed, navItems]);

  useEffect(() => {
    updateIndicator();
    const t1 = setTimeout(updateIndicator, 50);
    const t2 = setTimeout(updateIndicator, 220);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [updateIndicator, isCollapsed]);

  useEffect(() => {
    if (!listRef.current) return;
    const observer = new ResizeObserver(() => updateIndicator());
    observer.observe(listRef.current);
    return () => observer.disconnect();
  }, [updateIndicator]);

  return { listRef, itemRefs, indicator };
}