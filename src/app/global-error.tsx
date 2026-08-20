"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#12100e] px-4 text-center font-sans text-[#f5efe6]">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="max-w-md text-sm opacity-80">{error.message || "The app hit an unexpected error."}</p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-[#1F6B4A] px-5 py-2.5 text-sm font-medium text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
