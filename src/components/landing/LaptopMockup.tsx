export function LaptopMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[980px]" aria-hidden>
      <div className="pointer-events-none absolute -bottom-8 left-1/2 h-24 w-[78%] -translate-x-1/2 rounded-[100%] bg-warning/25 blur-3xl" />
      <div
        className="relative origin-bottom"
        style={{ transform: "perspective(2200px) rotateX(7deg)" }}
      >
        <div className="rounded-[22px] bg-[#3f3832] p-[11px] shadow-[0_40px_90px_-24px_rgba(92,50,20,0.42)]">
          <div className="relative overflow-hidden rounded-[14px] bg-canvas">
            <div className="flex items-center justify-between px-5 py-3">
              <span className="flex items-center gap-2 text-[11px] font-semibold text-ink">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest text-[9px] text-white">
                  ★
                </span>
                EstateFlow
              </span>
              <div className="hidden items-center gap-5 text-[11px] text-ink-muted sm:flex">
                <span className="font-semibold text-ink underline decoration-forest decoration-2 underline-offset-4">
                  Properties
                </span>
                <span>Maps</span>
                <span>Payments</span>
                <span>Archive</span>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-ink shadow-card">
                Lekki Waterside
              </span>
            </div>

            <div className="relative mx-3 mb-3 overflow-hidden rounded-[18px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
                alt=""
                className="h-[210px] w-full object-cover sm:h-[280px] lg:h-[320px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-transparent" />
              <div className="absolute left-5 top-5">
                <p className="text-[22px] font-semibold tracking-tight text-white drop-shadow sm:text-[28px]">
                  Property Management
                </p>
                <p className="mt-1 text-[11px] text-white/90">Lekki · 12 units in view</p>
              </div>

              <div className="absolute inset-x-3 bottom-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/95 p-3 shadow-card backdrop-blur">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                    Operations
                  </p>
                  <div className="mt-2 flex items-end justify-between">
                    <div>
                      <p className="text-[18px] font-semibold leading-none text-ink">2</p>
                      <p className="mt-1 text-[10px] text-ink-muted">Estates</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[18px] font-semibold leading-none text-forest">₦45M</p>
                      <p className="mt-1 text-[10px] text-ink-muted">Collected</p>
                    </div>
                  </div>
                </div>

                <div className="relative hidden overflow-hidden rounded-2xl bg-white/95 p-3 shadow-card backdrop-blur sm:block">
                  <div className="mb-2 flex items-center justify-between text-[10px] text-ink-muted">
                    <span>Price</span>
                    <span>Type</span>
                    <span>Status</span>
                  </div>
                  <div className="relative h-[72px] overflow-hidden rounded-xl bg-[#e6dcc8]">
                    <div className="absolute inset-0 opacity-70" style={MAP_GRAIN} />
                    <span className="absolute left-[18%] top-[28%] h-2.5 w-2.5 rounded-full bg-forest ring-4 ring-white" />
                    <span className="absolute left-[58%] top-[46%] h-2.5 w-2.5 rounded-full bg-warning ring-4 ring-white" />
                    <span className="absolute left-[74%] top-[22%] h-2.5 w-2.5 rounded-full bg-forest ring-4 ring-white" />
                  </div>
                </div>

                <div className="rounded-2xl bg-white/95 p-3 shadow-card backdrop-blur">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                      Allocations
                    </p>
                    <p className="text-[18px] font-semibold text-ink">32%</p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-low">
                    <div className="h-full w-[32%] rounded-full bg-forest" />
                  </div>
                  <div className="mt-3 flex -space-x-1.5">
                    {["AO", "BP", "CI", "DS"].map((initials) => (
                      <span
                        key={initials}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-[8px] font-semibold text-white ring-2 ring-white"
                      >
                        {initials}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto h-2.5 w-[72%] rounded-b-2xl bg-gradient-to-b from-[#d4c7b6] to-[#b7a894]" />
        <div className="mx-auto h-1 w-[28%] rounded-b-md bg-[#a8947e]" />
      </div>
    </div>
  );
}

const MAP_GRAIN = {
  backgroundImage:
    "radial-gradient(circle at 20% 40%, #cbb892 0 18%, transparent 19%), radial-gradient(circle at 70% 30%, #d7c4a3 0 22%, transparent 23%), radial-gradient(circle at 50% 80%, #b7c4a8 0 16%, transparent 17%)",
} as const;
