import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string | number;
  label: string;
}

interface ScrollableDropdownProps {
  value: string | number;
  onChange: (e: any) => void;
  options: DropdownOption[];
  placeholder?: string;
  name?: string;
  className?: string;
  disabled?: boolean;
  buttonClassName?: string;
  dropdownClassName?: string;
}

export const ScrollableDropdown: React.FC<ScrollableDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select option",
  name = "",
  className = "",
  disabled = false,
  buttonClassName = "",
  dropdownClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = (Array.isArray(options) ? options : []).find(
    (o) => String(o.value) === String(value)
  );

  const handleSelect = (val: string | number) => {
    if (disabled) return;
    onChange({ target: { name, value: String(val) } });
    setIsOpen(false);
  };

  return (
    <div className={`relative w-full min-w-0 ${className}`} ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl border border-gray-200 text-left text-xs sm:text-sm flex items-center justify-between transition-all shadow-sm ${
          disabled
            ? "bg-gray-100 cursor-not-allowed opacity-80 select-none text-gray-500"
            : "bg-white hover:border-[#5D3EFC]/50 cursor-pointer text-gray-800"
        } ${buttonClassName}`}
      >
        <span className={`truncate block pr-2 ${selectedOption ? "font-medium text-gray-900" : "text-gray-400 font-normal"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180 text-[#5D3EFC]" : ""
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          className={`absolute z-[99999] mt-1.5 left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 max-h-[180px] sm:max-h-[220px] overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] py-1.5 focus:outline-none animate-in fade-in-80 zoom-in-95 duration-150 ${dropdownClassName}`}
        >
          {!options || options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-400 text-center font-medium">
              No options available
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full px-3.5 py-2.5 text-left text-xs sm:text-sm flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-[#5D3EFC]/10 text-[#5D3EFC] font-bold"
                      : "text-gray-700 hover:bg-gray-50/80 font-medium"
                  }`}
                >
                  <span className="truncate pr-2">{opt.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#5D3EFC] flex-shrink-0 ml-1 stroke-[2.5]" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ScrollableDropdown;
