import { useEffect, useRef, useState } from 'react';

export function usePortalMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return { menuOpen, setMenuOpen, menuRef };
}
