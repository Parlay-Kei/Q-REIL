import React, { useEffect, useState, useRef } from 'react';
import { ChevronDownIcon, CheckIcon, XIcon } from 'lucide-react';
interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}
interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  multiple?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}
export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  multiple = false,
  searchable = false,
  disabled = false,
  error,
  className = ''
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedValues = multiple ?
  value as string[] || [] :
  value ?
  [value as string] :
  [];
  const filteredOptions = searchable ?
  options.filter((opt) =>
  opt.label.toLowerCase().includes(search.toLowerCase())
  ) :
  options;
  const selectedOptions = options.filter((opt) =>
  selectedValues.includes(opt.value)
  );
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node))
      {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue) ?
      selectedValues.filter((v) => v !== optionValue) :
      [...selectedValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearch('');
    }
  };
  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple) {
      onChange(selectedValues.filter((v) => v !== optionValue));
    }
  };
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label &&
      <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      }

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full min-h-[40px] px-3 py-2 rounded-lg text-left
          bg-surface-primary/60 backdrop-blur-xl
          border border-stroke-hairline
          transition-all duration-base ease-out
          flex items-center gap-2 flex-wrap
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-stroke-subtle hover:bg-surface-primary/80'}
          ${isOpen ? 'border-accent-cyan/50 ring-1 ring-accent-cyan/30' : ''}
          ${error ? 'border-danger/50' : ''}
        `}
        disabled={disabled}>

        <div className="flex-1 flex items-center gap-2 flex-wrap">
          {selectedOptions.length > 0 ?
          multiple ?
          selectedOptions.map((opt) =>
          <span
            key={opt.value}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-elevated text-sm text-text-primary">

                  {opt.label}
                  <XIcon
              size={12}
              className="cursor-pointer hover:text-danger"
              onClick={(e) => handleRemove(opt.value, e)} />

                </span>
          ) :

          <span className="text-text-primary">
                {selectedOptions[0].label}
              </span> :


          <span className="text-text-quaternary">{placeholder}</span>
          }
        </div>
        <ChevronDownIcon
          size={16}
          className={`text-text-tertiary transition-transform duration-base ${isOpen ? 'rotate-180' : ''}`} />

      </button>

      {isOpen &&
      <div className="absolute z-50 w-full mt-1 py-1 rounded-lg bg-surface-elevated/95 backdrop-blur-xl border border-stroke-hairline shadow-lg animate-slide-down">
          {searchable &&
        <div className="px-2 pb-2">
              <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full h-8 px-3 rounded-md bg-surface-primary border border-stroke-hairline text-sm text-text-primary placeholder:text-text-quaternary focus:outline-none focus:border-accent-cyan/50"
            autoFocus />

            </div>
        }
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ?
          filteredOptions.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                      w-full px-3 py-2 text-left text-sm
                      flex items-center gap-2
                      transition-colors duration-fast
                      ${isSelected ? 'bg-accent-cyan-dim text-accent-cyan' : 'text-text-primary hover:bg-surface-hover'}
                    `}>

                    {option.icon}
                    <span className="flex-1">{option.label}</span>
                    {isSelected && <CheckIcon size={14} />}
                  </button>);

          }) :

          <div className="px-3 py-2 text-sm text-text-tertiary">
                No options found
              </div>
          }
          </div>
        </div>
      }

      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>);

}