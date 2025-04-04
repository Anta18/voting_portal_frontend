// components/ClientNavbar.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "./Navbar";

export default function ClientNavbar() {
  const [showNavbar, setShowNavbar] = useState(false);

  const updateNavbar = useCallback(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== '"admin"' && userRole !== '"root"') {
      setShowNavbar(true);
    } else {
      setShowNavbar(false);
    }
  }, []);

  useEffect(() => {
    updateNavbar();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "userRole" || event.key === null) {
        updateNavbar();
      }
    };

    const handleFocus = () => {
      updateNavbar();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [updateNavbar]);

  return showNavbar ? <Navbar /> : null;
}
