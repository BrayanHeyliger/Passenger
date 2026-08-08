import { useState, useRef, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: { country_code?: string; country?: string };
}

interface Props {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  onSelect: (address: string, lat: number, lng: number) => void;
  icon?: React.ReactNode;
  className?: string;
  /** ISO 3166-1 alpha-2 country code to prioritize results (e.g. "us", "mx", "ve") */
  countryCode?: string;
  /** Bounding box [minLon, minLat, maxLon, maxLat] to bias results */
  viewbox?: [number, number, number, number];
}

export default function NominatimAutocomplete({
  placeholder, value, onChange, onSelect, icon, className = "",
  countryCode, viewbox,
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = (q: string) => {
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Build URL with optional country bias
        const params = new URLSearchParams({
          format: "json",
          q,
          limit: "7",
          addressdetails: "1",
        });

        // If we have a country code, add it to bias results
        if (countryCode) {
          params.set("countrycodes", countryCode.toLowerCase());
        }

        // If we have a viewbox, add it for geographic bias
        if (viewbox) {
          params.set("viewbox", viewbox.join(","));
          params.set("bounded", "0"); // Don't strictly limit, just bias
        }

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          { headers: { "Accept-Language": "es,en;q=0.9" } }
        );
        const data: Suggestion[] = await res.json();

        // If we got results with country filter, use them
        // Otherwise fall back to global search (so user is never stuck)
        if (data.length > 0 || !countryCode) {
          setSuggestions(data);
          setOpen(data.length > 0);
        } else {
          // Fallback: search without country restriction
          const fallbackParams = new URLSearchParams({ format: "json", q, limit: "5", addressdetails: "1" });
          const fallbackRes = await fetch(
            `https://nominatim.openstreetmap.org/search?${fallbackParams.toString()}`,
            { headers: { "Accept-Language": "es,en;q=0.9" } }
          );
          const fallbackData: Suggestion[] = await fallbackRes.json();
          setSuggestions(fallbackData);
          setOpen(fallbackData.length > 0);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleSelect = (s: Suggestion) => {
    // Show first 3 parts of the address for readability
    const parts = s.display_name.split(",");
    const short = parts.slice(0, 3).join(",").trim();
    onChange(short);
    onSelect(short, parseFloat(s.lat), parseFloat(s.lon));
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</span>}
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); search(e.target.value); }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={`w-full py-3 pr-10 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-green-400 outline-none text-sm ${icon ? "pl-9" : "pl-4"}`}
        />
        {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map((s, i) => {
            const parts = s.display_name.split(",");
            const country = s.address?.country || parts[parts.length - 1]?.trim();
            return (
              <button
                key={i}
                onMouseDown={() => handleSelect(s)}
                className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors border-b border-slate-100 last:border-0 flex items-start gap-2"
              >
                <MapPin size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 leading-tight truncate">{parts[0]}</p>
                  <p className="text-xs text-slate-400 leading-tight mt-0.5 truncate">
                    {parts.slice(1, 3).join(",").trim()}
                    {country && ` · ${country}`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
