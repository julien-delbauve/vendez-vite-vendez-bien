"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AddressSuggestion } from "@/lib/types";
import styles from "./AddressSearch.module.css";

export default function AddressSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setIsOpen(data.suggestions?.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.label);
    setIsOpen(false);
    setSuggestions([]);

    const params = new URLSearchParams({
      citycode: suggestion.citycode,
      city: suggestion.city,
      lat: String(suggestion.lat),
      lon: String(suggestion.lon),
      address: suggestion.label,
    });

    router.push(`/results?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          selectSuggestion(suggestions[activeIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.inputWrapper}>
        <svg
          className={styles.searchIcon}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            fill="currentColor"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Entrez votre code postal..."
          className={styles.input}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="address-suggestions"
        />
        {loading && <div className={styles.spinner} />}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          id="address-suggestions"
          className={styles.suggestions}
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.citycode}-${suggestion.label}`}
              role="option"
              aria-selected={index === activeIndex}
              className={`${styles.suggestion} ${
                index === activeIndex ? styles.active : ""
              }`}
              onClick={() => selectSuggestion(suggestion)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className={styles.pinIcon}
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  fill="currentColor"
                />
              </svg>
              <div>
                <div className={styles.suggestionLabel}>
                  {suggestion.label}
                </div>
                <div className={styles.suggestionMeta}>
                  {suggestion.postcode} {suggestion.city}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
