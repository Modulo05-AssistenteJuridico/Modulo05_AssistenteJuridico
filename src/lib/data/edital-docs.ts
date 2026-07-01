import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const MAX_DOCS = 1;
const MAX_TOTAL_BYTES = 10 * 1024 * 1024;

export interface DocumentoIA {
  nome: string;
  mimeType: string;
  data: string;
}

function mimePorNome(nome: string): string | null {
  const n = nome.toLowerCase();
  if (n.endsWith(".pdf")) return "application/pdf";
  if (n.endsWith(".txt")) return "text/plain";
  if (n.endsWith(".md")) return "text/markdown";
  return null;
}

function separarBucketCaminho(valor: string): { bucket: string; path: string } | null {
  const limpo = valor.trim().replace(/^\/+/, "");
  const barra = limpo.indexOf("/");
  if (barra <= 0) return null;
  const bucket = limpo.slice(0, barra);
  const path = limpo.slice(barra + 1);
  if (!path) return null;
  return { bucket, path };
}

export async function baixarDocumentosEdital(
  docs: string[] | undefined | null,
): Promise<DocumentoIA[]> {
  if (!docs || docs.length === 0) return [];

  const supabase = createSupabaseAdminClient();
  const resultado: DocumentoIA[] = [];
  let total = 0;

  for (const valor of docs.slice(0, MAX_DOCS)) {
    const alvo = separarBucketCaminho(valor);
    if (!alvo) continue;
    const mimeType = mimePorNome(alvo.path);
    if (!mimeType) continue;
    try {
      const { data, error } = await supabase.storage
        .from(alvo.bucket)
        .download(alvo.path);
      if (error || !data) continue;
      const bytes = Buffer.from(await data.arrayBuffer());
      if (bytes.length === 0) continue;
      if (total + bytes.length > MAX_TOTAL_BYTES) continue;
      total += bytes.length;
      resultado.push({
        nome: alvo.path.split("/").pop() ?? alvo.path,
        mimeType,
        data: bytes.toString("base64"),
      });
    } catch {
      continue;
    }
  }

  return resultado;
}
