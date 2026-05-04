import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/40">
        Error 404
      </p>
      <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight md:text-7xl">
        Page not found.
      </h1>
      <p className="mt-3 max-w-md text-white/55">
        The route you followed doesn&apos;t exist — it may have been moved or
        the listing was delisted.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back home
      </Link>
    </div>
  );
}
