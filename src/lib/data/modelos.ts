import "server-only";
import JSZip from "jszip";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "mod5";

const TITULOS = new Set([
  "RECURSO ADMINISTRATIVO",
  "IMPUGNAÇÃO DE EDITAL",
  "PEDIDO DE ESCLARECIMENTO",
]);

export interface RunModelo {
  texto: string;
  negrito: boolean;
  italico: boolean;
  sublinhado: boolean;
  realce: boolean;
  tamanho: number | null;
  campoId: number | null;
}

export type Alinhamento = "left" | "center" | "right" | "justify";

export interface BlocoModelo {
  alinhamento: Alinhamento;
  runs: RunModelo[];
}

export interface CampoModelo {
  id: number;
  original: string;
  realce: boolean;
}

export interface ModeloParseado {
  blocos: BlocoModelo[];
  campos: CampoModelo[];
}

export function arquivoModeloParaTipo(tipo: {
  nome: string;
  codigo: string | null;
}): string | null {
  const codigo = (tipo.codigo ?? "").toUpperCase();
  const nome = tipo.nome.toLowerCase();
  if (codigo === "B" || nome.includes("impugna")) return "modelo-IMPUGNACAO.docx";
  if (nome.includes("esclarecimento")) return "modelo-ESCLARECIMENTO.docx";
  if (codigo === "H" || nome.includes("contrarraz")) return "modelo-Contrarrazao.docx";
  if (codigo === "G" || nome.includes("recurso")) return "modelo-RECURSO-ADM.docx";
  if (codigo === "P" || nome.includes("pagamento")) return "modelo-PedidoPagamento.docx";
  if (nome.includes("reajuste")) return "modelo-PedidoReajuste.docx";
  if (codigo === "E" || nome.includes("reequil")) return "modelo-ReequilibrioFinanceiro.docx";
  if (codigo === "D" || nome.includes("defesa")) return "modelo-DefesaPrevia.docx";
  if (nome.includes("reconsidera")) return "modelo-PedidoReconsideracao.docx";
  return null;
}

const TTL_CACHE_MODELO_MS = 10 * 60 * 1000;

interface EntradaCacheModelo {
  expira: number;
  promessa: Promise<Buffer>;
}

function cacheModelos(): Map<string, EntradaCacheModelo> {
  const escopo = globalThis as typeof globalThis & {
    __mod5CacheModelos?: Map<string, EntradaCacheModelo>;
  };
  escopo.__mod5CacheModelos ??= new Map();
  return escopo.__mod5CacheModelos;
}

async function baixarModeloDoStorage(arquivo: string): Promise<Buffer> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(`modelos/${arquivo}`);
  if (error || !data) throw new Error(`Modelo não encontrado: ${arquivo}`);
  const bytes = Buffer.from(await data.arrayBuffer());
  if (bytes.length === 0) {
    throw new Error(`Download vazio do modelo: ${arquivo}`);
  }
  return bytes;
}

export async function baixarModelo(arquivo: string): Promise<Buffer> {
  const cache = cacheModelos();
  const agora = Date.now();
  const entrada = cache.get(arquivo);
  if (entrada && entrada.expira > agora) {
    try {
      const existente = await entrada.promessa;
      if (existente.length > 0) return existente;
    } catch {}
    if (cache.get(arquivo) === entrada) cache.delete(arquivo);
  }

  const promessa = baixarModeloDoStorage(arquivo);
  cache.set(arquivo, { expira: agora + TTL_CACHE_MODELO_MS, promessa });
  try {
    return await promessa;
  } catch (erro) {
    if (cache.get(arquivo)?.promessa === promessa) {
      cache.delete(arquivo);
    }
    throw erro;
  }
}

export async function lerDocumentoXml(buf: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buf);
  const arquivo = zip.file("word/document.xml");
  if (!arquivo) throw new Error("document.xml não encontrado no modelo.");
  return arquivo.async("string");
}

export async function regravarDocx(buf: Buffer, novoXml: string): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buf);
  zip.file("word/document.xml", novoXml);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

function desescapar(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function escapar(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function rprDoRun(run: string): string {
  return run.match(/<w:rPr>([\s\S]*?)<\/w:rPr>/)?.[1] ?? "";
}

function runNegrito(run: string): boolean {
  const rpr = rprDoRun(run);
  return (
    /<w:b(\s[^>]*)?\/>|<w:b(\s[^>]*)?>/.test(rpr) &&
    !/<w:b\s+[^>]*w:val="(0|false)"/.test(rpr)
  );
}

function runRealce(run: string): boolean {
  const rpr = rprDoRun(run);
  return /<w:highlight\b[^>]*>/.test(rpr) && !/<w:highlight\b[^>]*w:val="none"/.test(rpr);
}

function runItalico(run: string): boolean {
  const rpr = rprDoRun(run);
  return (
    /<w:i(\s[^>]*)?\/>|<w:i(\s[^>]*)?>/.test(rpr) &&
    !/<w:i\s+[^>]*w:val="(0|false)"/.test(rpr)
  );
}

function runSublinhado(run: string): boolean {
  const rpr = rprDoRun(run);
  const m = rpr.match(/<w:u\b[^>]*>/);
  return m ? !/w:val="none"/.test(m[0]) : false;
}

function runTamanho(run: string): number | null {
  const m = rprDoRun(run).match(/<w:sz\b[^>]*w:val="(\d+)"/);
  return m ? Number(m[1]) / 2 : null;
}

function paragrafoAlinhamento(para: string): Alinhamento {
  const ppr = para.match(/<w:pPr>([\s\S]*?)<\/w:pPr>/)?.[1] ?? "";
  const val = ppr.match(/<w:jc\b[^>]*w:val="([^"]+)"/)?.[1];
  if (val === "center") return "center";
  if (val === "right" || val === "end") return "right";
  if (val === "both" || val === "distribute") return "justify";
  return "left";
}

function runTexto(run: string): string {
  return [...run.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/g)]
    .map((m) => desescapar(m[1]))
    .join("");
}

function ehCabecalho(texto: string): boolean {
  const t = texto.trim();
  if (/^[IVXLC]+\s*[–-]/.test(t)) return true;
  return TITULOS.has(t.toUpperCase());
}

function ehEditavel(
  negrito: boolean,
  realce: boolean,
  sublinhado: boolean,
  texto: string,
): boolean {
  return (
    (negrito || realce) &&
    !sublinhado &&
    texto.trim().length > 0 &&
    !ehCabecalho(texto)
  );
}

export function parsearDocumento(xml: string): ModeloParseado {
  const blocos: BlocoModelo[] = [];
  const campos: CampoModelo[] = [];
  let campoId = 0;

  const paragrafos = xml.match(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g) ?? [];
  for (const para of paragrafos) {
    const runs: RunModelo[] = [];
    const alinhamento = paragrafoAlinhamento(para);
    const runsXml = para.match(/<w:r\b[^>]*>[\s\S]*?<\/w:r>/g) ?? [];
    for (const r of runsXml) {
      const texto = runTexto(r);
      if (texto === "") continue;
      const negrito = runNegrito(r);
      const realce = runRealce(r);
      const sublinhado = runSublinhado(r);
      const base = {
        texto,
        negrito,
        italico: runItalico(r),
        sublinhado,
        realce,
        tamanho: runTamanho(r),
      };
      if (ehEditavel(negrito, realce, sublinhado, texto)) {
        runs.push({ ...base, campoId });
        campos.push({ id: campoId, original: texto, realce });
        campoId++;
      } else {
        runs.push({ ...base, campoId: null });
      }
    }
    blocos.push({ alinhamento, runs });
  }

  return { blocos, campos };
}

export function aplicarValores(
  xml: string,
  valores: Record<number, string>,
): string {
  let campoId = 0;
  return xml.replace(/<w:r\b[^>]*>[\s\S]*?<\/w:r>/g, (run) => {
    const texto = runTexto(run);
    if (texto === "") return run;
    const negrito = runNegrito(run);
    const realce = runRealce(run);
    const sublinhado = runSublinhado(run);
    if (!ehEditavel(negrito, realce, sublinhado, texto)) return run;
    const id = campoId++;
    const novo = valores[id];

    let novoRun = run
      .replace(/<w:b(\s[^>]*)?\/>/g, "")
      .replace(/<w:bCs(\s[^>]*)?\/>/g, "");

    if (novo !== undefined && novo !== texto) {
      let primeiro = true;
      novoRun = novoRun.replace(/<w:t\b[^>]*>[\s\S]*?<\/w:t>/g, () => {
        if (primeiro) {
          primeiro = false;
          return `<w:t xml:space="preserve">${escapar(novo)}</w:t>`;
        }
        return `<w:t xml:space="preserve"></w:t>`;
      });
    }
    return novoRun;
  });
}

export function removerRealce(xml: string): string {
  return xml
    .replace(/<w:highlight\b[^>]*\/>/g, "")
    .replace(/<w:highlight\b[^>]*>[\s\S]*?<\/w:highlight>/g, "");
}

export function extrairTexto(xml: string): string {
  const paragrafos = xml.match(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g) ?? [];
  return paragrafos
    .map((para) => {
      const runsXml = para.match(/<w:r\b[^>]*>[\s\S]*?<\/w:r>/g) ?? [];
      return runsXml.map((r) => runTexto(r)).join("");
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
