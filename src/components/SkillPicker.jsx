// src/components/SkillPicker.jsx
// A text box that only accepts a skill from the catalogue in src/data/skills.js.
//
// Controlled by `value`: it is "" until the user clicks a suggestion (or presses
// Enter on the highlighted one), then it holds the canonical skill name.
// Typing again clears the selection, so free text can never reach the parent.
//
//   <SkillPicker value={skill} onChange={setSkill} exclude={alreadyAdded} />
import { useEffect, useMemo, useRef, useState } from "react";
import { searchSkills } from "../data/skills";

export default function SkillPicker({
  value,
  onChange,
  exclude = [],
  placeholder = "Type to search skills...",
  className = "w-full border rounded-full px-4 py-3 bg-white",
  onEnterSelected, // optional: called when Enter is pressed while a skill is already selected
}) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const typingRef = useRef(false);
  const boxRef = useRef(null);

  // Keep the visible text in sync when the parent sets or clears the value
  // (e.g. after "Add"). Skip the sync that our own onChange("") triggers.
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
        // Leaving the box without picking: drop unselected text.
        setQuery(value || "");
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [value]);

  const { matches, related } = useMemo(
    () => (value && query === value ? { matches: [], related: [] } : searchSkills(query, { exclude })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, value, exclude.join("|")]
  );
  const options = [...matches, ...related];

  const choose = (name) => {
    onChange(name);
    setQuery(name);
    setOpen(false);
  };

  const handleChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    setOpen(true);
    setActive(0);
    if (value) {
      typingRef.current = true; // we are about to clear the parent's value
      onChange("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      if (open && options[active]) {
        e.preventDefault();
        choose(options[active].name);
      } else if (value && onEnterSelected) {
        e.preventDefault();
        onEnterSelected();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showNoMatch = open && query.trim() && options.length === 0 && !(value && query === value);

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

      {open && options.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto bg-white border rounded-xl shadow-lg py-1 text-left">
          {matches.map((s, i) => (
            <li
              key={s.name}
              onMouseDown={(e) => { e.preventDefault(); choose(s.name); }}
              onMouseEnter={() => setActive(i)}
              className={`px-4 py-2 cursor-pointer flex justify-between gap-3 ${i === active ? "bg-[#E8DCC0]" : ""}`}
            >
              <span>{s.name}</span>
              <span className="text-xs text-gray-500 self-center">{s.category}</span>
            </li>
          ))}
          {related.length > 0 && (
            <li className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 cursor-default">
              Related skills
            </li>
          )}
          {related.map((s, j) => {
            const i = matches.length + j;
            return (
              <li
                key={s.name}
                onMouseDown={(e) => { e.preventDefault(); choose(s.name); }}
                onMouseEnter={() => setActive(i)}
                className={`px-4 py-2 cursor-pointer flex justify-between gap-3 ${i === active ? "bg-[#E8DCC0]" : ""}`}
              >
                <span>{s.name}</span>
                <span className="text-xs text-gray-500 self-center">{s.category}</span>
              </li>
            );
          })}
        </ul>
      )}

      {showNoMatch && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg px-4 py-3 text-sm text-gray-500">
          No matching skill. Try a different word, you can only pick from the list.
        </div>
      )}
    </div>
  );
}
