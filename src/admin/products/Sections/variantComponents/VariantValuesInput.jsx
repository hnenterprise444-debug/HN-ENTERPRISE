import React, { useState, useEffect } from "react";
import { FaTag } from "react-icons/fa";

/**
 * Enhanced tag-based variant values input component.
 */
export default function VariantValuesInput({ index, values, onChange }) {
  const [inputValue, setInputValue] = useState(values?.join(", ") || "");

  useEffect(() => {
    const currentString = values?.join(", ") || "";
    const cleanedInput = inputValue.split(",").map(v => v.trim()).filter(Boolean).join(", ");
    const cleanedProp = values?.filter(Boolean).join(", ") || "";
    if (cleanedInput !== cleanedProp) {
      setInputValue(currentString);
    }
  }, [values]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    const parsedArray = val
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    onChange(index, parsedArray);
  };

  const handleBlur = () => {
    const cleanedValues = inputValue
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    onChange(index, cleanedValues);
    setInputValue(cleanedValues.join(", "));
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={inputValue}
        placeholder="e.g. Small, Medium, Large (comma separated)"
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full rounded-xl border border-border-subtle bg-card text-text-base placeholder:text-text-subtle px-3 py-2 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-xs"
      />
      {values && values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {values.map((val, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold"
            >
              <FaTag size={8} /> {val}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
