"use client";

import { useState } from "react";
import { PaymentTypeDTO } from "../lib/api";

type TypeFilterDropdownProps = {
  value: number | null;
  options: PaymentTypeDTO[];
  onChange: (value: number | null) => void;
  placeholder?: string;
};

export default function TypeFilterDropdown({
  value,
  options,
  onChange,
  placeholder = "Todos os tipos",
}: TypeFilterDropdownProps) {
  const [open, setOpen] = useState(false);

  const currentLabel =
    value != null
      ? options.find((o) => o.id === value)?.name ?? "Tipo selecionado"
      : placeholder;

  const handleSelect = (newValue: number | null) => {
    onChange(newValue);
    setOpen(false);
  };

  return (
    <div className="type-dropdown">
      <button
        type="button"
        className="type-dropdown-trigger input"
        onClick={() => setOpen((p) => !p)}
      >
        <span className="type-dropdown-label">{currentLabel}</span>
        <span className="type-dropdown-icon">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="type-dropdown-menu">
          <button
            type="button"
            className={`type-dropdown-item ${value == null ? "type-dropdown-item-active" : ""}`}
            onClick={() => handleSelect(null)}
          >
            {placeholder}
          </button>

          <div className="type-dropdown-divider" />

          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`type-dropdown-item ${value === opt.id ? "type-dropdown-item-active" : ""}`}
              onClick={() => handleSelect(opt.id)}
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}