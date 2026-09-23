export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f5f2]">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-3xl bg-violet-100 text-violet-600">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <p className="mt-4 text-sm font-bold text-zinc-500">Loading survey…</p>
      </div>
    </div>
  );
}
