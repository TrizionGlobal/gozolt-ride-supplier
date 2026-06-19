/* eslint-disable @next/next/no-img-element */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      {/* Logo above the form */}
      <div className="mb-7 mt-5">
        <img
          src="/logo.png"
          alt="Gozolt"
          width={180}
          height={180}
          className="mx-auto object-contain"
        />
      </div>
      {children}
    </div>
  );
}
