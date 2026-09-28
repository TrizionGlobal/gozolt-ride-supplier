/* eslint-disable @next/next/no-img-element */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center bg-black p-4">
      <div className="flex w-full flex-col items-center py-8">
        {/* Logo above the form */}
        <div className="mb-7">
          <img
            src="/logo.png"
            alt="Gozolt"
            width={130}
            height={130}
            className="mx-auto object-contain"
          />
        </div>
        {children}
      </div>
    </div>
  );
}
