'use client';

import { useAuthStore } from '@/stores/auth.store';
import { Checkbox } from '@/components/ui/checkbox';

export function DevBypass() {
  const { devBypass, setDevBypass } = useAuthStore();

  return (
    <div className="flex items-center gap-2 mt-4">
      <Checkbox
        id="dev-bypass"
        checked={devBypass}
        onCheckedChange={(checked) => setDevBypass(checked === true)}
        className="h-3.5 w-3.5 border-zinc-600 data-[state=checked]:bg-zinc-600 data-[state=checked]:border-zinc-600"
      />
      <label
        htmlFor="dev-bypass"
        className="text-xs text-zinc-500 cursor-pointer select-none"
      >
        Dev Bypass
      </label>
    </div>
  );
}
