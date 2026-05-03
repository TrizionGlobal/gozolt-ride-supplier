/* eslint-disable @next/next/no-img-element */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      {/* Logo above the form */}
      <div className="mb-6">
        <img
          src="/logo.svg"
          alt="Gozolt"
          width={100}
          height={120}
          className="object-contain"
        />
      </div>
      {children}
    </div>
  );
}
