// src/components/LocationPicker.jsx
// Type-ahead for real places. The parent only ever receives a location the user
// clicked from the suggestions ("Pune, Maharashtra, India"); typing clears it.
//
//   <LocationPicker value={location} onChange={setLocation} />
import { useEffect, useRef, useState } from "react";
import { searchLocations } from "../data/locations";

export default function LocationPicker({
  value,
  onChange,
  placeholder = "Start typing your city...",
  className = "w-full border rounded-full px-4 py-3 bg-white",
}) {
  const [query, setQuery] = useState(value || "");
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [searched, setSearched] = useState(false);
  const typingRef = useRef(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (typingRef.current) {
      typingRef.current = false;
      return;
    }
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
        setQuery(value || "");
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [value]);

  // Debounced lookup; skipped when the text is just the already-selected value.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || (value && q === value)) {
      setOptions([]);
      setLoading(false);
      setSearched(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { labels, offline: off } = await searchLocations(q, controller.signal);
        setOptions(labels);
        setOffline(off);
        setSearched(true);
        setActive(0);
        setLoading(false);
      } catch (err) {
        if (err.name !== "AbortError") setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, value]);

  const choose = (label) => {
    onChange(label);
    setQuery(label);
    setOpen(false);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    if (value) {
      typingRef.current = true;
      onChange("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && open && options[active]) {
      e.preventDefault();
      choose(options[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && options.length > 0;
  const showEmpty = open && !loading && searched && options.length === 0 && query.trim().length >= 2;

  return (
    <div ref={boxRef} className="relative">
      <input
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {loading && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">Searching...</span>}

      {showList && (
        <ul className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto bg-white border rounded-xl shadow-lg py-1 text-left">
          {options.map((label, i) => (
            <li
              key={label}
              onMouseDown={(e) => { e.preventDefault(); choose(label); }}
              onMouseEnter={() => setActive(i)}
              className={`px-4 py-2 cursor-pointer ${i === active ? "bg-[#E8DCC0]" : ""}`}
            >
              {label}
            </li>
          ))}
          {offline && (
            <li className="px-4 py-2 text-xs text-gray-400 cursor-default border-t">
              Live search unavailable, showing major Indian cities only.
            </li>
          )}
        </ul>
      )}

      {showEmpty && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg px-4 py-3 text-sm text-gray-500">
          No matching place found. Check the spelling, you can only pick from the list.
        </div>
      )}
    </div>
  );
}
