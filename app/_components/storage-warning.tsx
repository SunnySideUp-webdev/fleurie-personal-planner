"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { STORAGE_ERROR_EVENT } from "@/app/_lib/local-storage";

export function StorageWarning() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showWarning = () => setVisible(true);
    window.addEventListener(STORAGE_ERROR_EVENT, showWarning);
    return () => window.removeEventListener(STORAGE_ERROR_EVENT, showWarning);
  }, []);

  if (!visible) return null;

  return (
    <div className="storage-warning" role="alert">
      <AlertTriangle size={20} aria-hidden="true" />
      <div>
        <strong>Your latest changes could not be saved.</strong>
        <span>Browser storage may be full. Remove large images or unused entries, then try again.</span>
      </div>
      <button type="button" onClick={() => setVisible(false)} aria-label="Dismiss storage warning">
        <X size={18} />
      </button>
    </div>
  );
}
