import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export const EUROPEAN_COUNTRIES = [
  { code: 'AL', label: '🇦🇱 Albania' },
  { code: 'AD', label: '🇦🇩 Andorra' },
  { code: 'AT', label: '🇦🇹 Austria' },
  { code: 'BY', label: '🇧🇾 Belarus' },
  { code: 'BE', label: '🇧🇪 Belgium' },
  { code: 'BA', label: '🇧🇦 Bosnia and Herzegovina' },
  { code: 'BG', label: '🇧🇬 Bulgaria' },
  { code: 'HR', label: '🇭🇷 Croatia' },
  { code: 'CY', label: '🇨🇾 Cyprus' },
  { code: 'CZ', label: '🇨🇿 Czech Republic' },
  { code: 'DK', label: '🇩🇰 Denmark' },
  { code: 'EE', label: '🇪🇪 Estonia' },
  { code: 'FI', label: '🇫🇮 Finland' },
  { code: 'FR', label: '🇫🇷 France' },
  { code: 'DE', label: '🇩🇪 Germany' },
  { code: 'GR', label: '🇬🇷 Greece' },
  { code: 'HU', label: '🇭🇺 Hungary' },
  { code: 'IS', label: '🇮🇸 Iceland' },
  { code: 'IE', label: '🇮🇪 Ireland' },
  { code: 'IT', label: '🇮🇹 Italy' },
  { code: 'LV', label: '🇱🇻 Latvia' },
  { code: 'LI', label: '🇱🇮 Liechtenstein' },
  { code: 'LT', label: '🇱🇹 Lithuania' },
  { code: 'LU', label: '🇱🇺 Luxembourg' },
  { code: 'MT', label: '🇲🇹 Malta' },
  { code: 'MD', label: '🇲🇩 Moldova' },
  { code: 'MC', label: '🇲🇨 Monaco' },
  { code: 'ME', label: '🇲🇪 Montenegro' },
  { code: 'NL', label: '🇳🇱 Netherlands' },
  { code: 'MK', label: '🇲🇰 North Macedonia' },
  { code: 'NO', label: '🇳🇴 Norway' },
  { code: 'PL', label: '🇵🇱 Poland' },
  { code: 'PT', label: '🇵🇹 Portugal' },
  { code: 'RO', label: '🇷🇴 Romania' },
  { code: 'RU', label: '🇷🇺 Russia' },
  { code: 'SM', label: '🇸🇲 San Marino' },
  { code: 'RS', label: '🇷🇸 Serbia' },
  { code: 'SK', label: '🇸🇰 Slovakia' },
  { code: 'SI', label: '🇸🇮 Slovenia' },
  { code: 'ES', label: '🇪🇸 Spain' },
  { code: 'SE', label: '🇸🇪 Sweden' },
  { code: 'CH', label: '🇨🇭 Switzerland' },
  { code: 'UA', label: '🇺🇦 Ukraine' },
  { code: 'GB', label: '🇬🇧 United Kingdom' },
  { code: 'VA', label: '🇻🇦 Vatican City' }
];

export interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function CountrySelect({ value, onChange, disabled }: CountrySelectProps) {
  const selectedCountry = EUROPEAN_COUNTRIES.find(c => c.code === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="w-full h-10 flex items-center justify-between rounded-lg border border-[#27272A] bg-[#0A0A0A] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#FACC15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{selectedCountry?.label || 'Select a country'}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-56 overflow-y-auto bg-[#0A0A0A] border-[#27272A] text-white">
        {EUROPEAN_COUNTRIES.map((country) => (
          <DropdownMenuItem
            key={country.code}
            onClick={() => onChange(country.code)}
            className="hover:bg-[#27272A] focus:bg-[#27272A] cursor-pointer"
          >
            {country.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
