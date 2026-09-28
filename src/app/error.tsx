"use client";

export default function StorefrontError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="container-premium py-24 text-center" role="alert">
    <h1 className="text-3xl font-semibold">Não foi possível carregar a loja agora.</h1>
    <p className="mt-4 text-muted-foreground">Seus produtos não foram removidos. Tente novamente em instantes.</p>
    <button type="button" onClick={reset} className="mt-8 rounded-md border px-6 py-3 font-medium hover:bg-muted">Tentar novamente</button>
  </main>;
}
