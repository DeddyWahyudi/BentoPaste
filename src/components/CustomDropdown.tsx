import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  badge?: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | DropdownOption)[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuAlign?: 'left' | 'right';
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih kategori',
  className = '',
  buttonClassName = '',
  menuAlign = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 280 && rect.top > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#121215]/90 px-3.5 py-2 text-xs font-medium text-zinc-200 shadow-sm backdrop-blur-md transition-all hover:border-indigo-500/40 hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer ${buttonClassName}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Styled Dropdown Menu (Glassmorphism & Obsidian Dark Theme) */}
      {isOpen && (
        <div
          className={`absolute ${
            menuAlign === 'right' ? 'right-0' : 'left-0'
          } ${
            openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          } z-[60] min-w-[220px] w-max max-w-xs rounded-2xl border border-white/15 bg-[#121215]/95 p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 animate-in fade-in-0 zoom-in-95 duration-100`}
        >
          <div className="max-h-[420px] space-y-1 overflow-y-auto overscroll-contain pr-0.5">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600/35 to-purple-600/25 text-white font-semibold border border-indigo-500/40 shadow-sm'
                      : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="truncate text-xs font-medium">{opt.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-indigo-400 shrink-0 ml-3" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
