'use client';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
}

export function ToggleSwitch({ enabled, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="mt-0.5 text-xs text-[#71717A]">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
          enabled ? 'bg-[#FACC15]' : 'bg-[#3F3F46]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
