"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function RouteFade({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Ensure the animation plays on initial load and on route changes
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => {
      cancelAnimationFrame(id);
      setMounted(false);
    };
  }, [pathname]);

  return (
    <div key={pathname} className={`route-fade ${mounted ? "is-mounted" : ""}`}>
      {children}
    </div>
  );
}
