"use client";

import { useEffect, useState } from "react";

// Defaults to the browser's IANA zone; user can edit.
export function TimezoneField({ className }: { className?: string }) {
  const [tz, setTz] = useState("UTC");
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) setTz(detected);
    } catch {
      // keep UTC
    }
  }, []);
  return <input name="timezone" value={tz} onChange={(e) => setTz(e.target.value)} className={className} />;
}
