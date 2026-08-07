/// <reference types="@types/google.maps" />
import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Navigation, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Suggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: string, coords: { lat: number; lng: number }) => void;
  placeholder?: string;
  dotColor?: "green" | "red";
  showLocationButton?: boolean;
  onGetLocation?: () => void;
  gettingLocation?: boolean;
  className?: string;
  disabled?: boolean;
}

export function PlacesAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Escribe una dirección...",
  dotColor = "green",
  showLocationButton = false,
  onGetLocation,
  gettingLocation = false,
  className,
  disabled = false,
}: PlacesAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // Initialize Google services when available
  const initServices = useCallback(() => {
    if (window.google?.maps?.places && !autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
      sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
    }
  }, []);

  useEffect(() => {
    // Try immediately, then poll until google maps loads
    initServices();
    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        initServices();
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [initServices]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback((input: string) => {
    if (!input.trim() || input.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (!autocompleteServiceRef.current) {
      initServices();
      return;
    }

    setIsLoading(true);
    autocompleteServiceRef.current.getPlacePredictions(
      {
        input,
        sessionToken: sessionTokenRef.current || undefined,
        // No restriction — worldwide search
      },
      (predictions, status) => {
        setIsLoading(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          const mapped: Suggestion[] = predictions.slice(0, 5).map((p) => ({
            placeId: p.place_id,
            description: p.description,
            mainText: p.structured_formatting.main_text,
            secondaryText: p.structured_formatting.secondary_text || "",
          }));
          setSuggestions(mapped);
          setIsOpen(true);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      }
    );
  }, [initServices]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    onChange(suggestion.description);
    setIsOpen(false);
    setSuggestions([]);

    // Geocode the selected place to get coordinates
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode({ placeId: suggestion.placeId }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const coords = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };
        onSelect(suggestion.description, coords);
        // Refresh session token after selection
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      }
    });
  };

  const handleClear = () => {
    onChange("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        {/* Dot indicator */}
        <div className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow z-10",
          dotColor === "green" ? "bg-green-500" : "bg-red-500"
        )} />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-9 pr-16 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-slate-50 disabled:opacity-50 transition-all"
          autoComplete="off"
        />

        {/* Right buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button onClick={handleClear} className="p-1 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={14} />
            </button>
          )}
          {isLoading && <Loader2 size={15} className="text-slate-400 animate-spin" />}
          {showLocationButton && onGetLocation && (
            <button
              onClick={onGetLocation}
              disabled={gettingLocation}
              className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 hover:text-green-700 disabled:opacity-50 transition-colors"
              title="Usar mi ubicación actual"
            >
              <Navigation size={15} className={gettingLocation ? "animate-spin" : ""} />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.placeId}
              onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(suggestion); }}
              className={cn(
                "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-green-50 transition-colors",
                index < suggestions.length - 1 && "border-b border-slate-100"
              )}
            >
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={14} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{suggestion.mainText}</p>
                <p className="text-xs text-slate-500 truncate">{suggestion.secondaryText}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
