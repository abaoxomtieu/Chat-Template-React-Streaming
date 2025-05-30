import React from "react";

export interface CombatSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  side: "left" | "right";
  className?: string;
}

const CombatSelect: React.FC<CombatSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  side,
  className = "",
}) => {
  return (
    <div className={`combat-select ${side} ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CombatSelect; 