/* eslint-disable @next/next/no-img-element */
'use client';

interface GozoltLogoProps {
  showSubtitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function GozoltLogo({ showSubtitle = true, size = 'md' }: GozoltLogoProps) {
  const dimensions = size === 'lg' ? 80 : size === 'md' ? 56 : 40;

  return (
    <div className="flex flex-col items-center gap-1">
      <img
        src="/logo.png"
        alt="Gozolt"
        width={dimensions}
        height={dimensions}
        className="object-contain"
      />
      {showSubtitle && (
        <p className={`${size === 'sm' ? 'text-xs' : 'text-sm'} font-medium text-[#FACC15]`}>
          Supplier Portal
        </p>
      )}
    </div>
  );
}
