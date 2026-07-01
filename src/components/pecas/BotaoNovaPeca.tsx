"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function BotaoNovaPeca() {
  const router = useRouter();
  const [pendente, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pendente}
      onClick={() => startTransition(() => router.push("/pecas/nova"))}
      className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pendente && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {pendente ? "Carregando..." : "Criar nova peça"}
    </button>
  );
}
