"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import type { DatasourceItem } from "@/types/schema";

interface DatasourceFieldProps {
  fieldName: string;
  label: string;
  datasourceRef: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
  onItemSelect: (item: DatasourceItem) => void;
}

const MCP_REST_BASE = "/api/mcp-rest";

export function DatasourceField({
  fieldName,
  label,
  datasourceRef,
  value,
  required,
  onChange,
  onItemSelect,
}: DatasourceFieldProps) {
  const [suggestions, setSuggestions] = useState<DatasourceItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const search = useCallback(
    async (term: string) => {
      if (!term || term.length < 1) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `${MCP_REST_BASE}/datasources/${datasourceRef}/resolve`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ search: term, limit: 10 }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.items ?? []);
          setIsOpen(true);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [datasourceRef]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setSelectedLabel("");
      onChange(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(val), 250);
    },
    [onChange, search]
  );

  const handleSelect = useCallback(
    (item: DatasourceItem) => {
      onChange(item.id);
      setSelectedLabel(item.label);
      setIsOpen(false);
      setSuggestions([]);
      onItemSelect(item);
    },
    [onChange, onItemSelect]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = selectedLabel || value;

  return (
    <div className="datasource-field" ref={wrapperRef}>
      <input
        type="text"
        value={displayValue}
        onChange={handleInput}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        className="form-input"
        placeholder={`Search ${label} (type to search...)`}
        required={required}
        autoComplete="off"
        aria-label={fieldName}
      />
      {loading && <span className="datasource-loading">Searching...</span>}
      {isOpen && suggestions.length > 0 && (
        <ul className="datasource-dropdown">
          {suggestions.map((item) => (
            <li
              key={item.id}
              className="datasource-option"
              onClick={() => handleSelect(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSelect(item);
              }}
              role="option"
              aria-selected={item.id === value}
              tabIndex={0}
            >
              <span className="datasource-option-label">{item.label}</span>
              {"skuDescription" in item && item.skuDescription ? (
                <span className="datasource-option-detail">
                  {String(item.skuDescription)}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
