import "server-only";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { BlocoModelo, RunModelo } from "./modelos";

const estilos = StyleSheet.create({
  pagina: {
    paddingVertical: 64,
    paddingHorizontal: 72,
    fontFamily: "Times-Roman",
    fontSize: 12,
    lineHeight: 1.5,
    color: "#1e293b",
  },
  paragrafo: {
    marginBottom: 10,
  },
  vazio: {
    height: 10,
  },
});

function estiloRun(run: RunModelo) {
  const estilo: Record<string, string | number> = {};
  if (run.negrito) estilo.fontWeight = "bold";
  if (run.italico) estilo.fontStyle = "italic";
  if (run.sublinhado) estilo.textDecoration = "underline";
  if (run.tamanho) estilo.fontSize = run.tamanho;
  return estilo;
}

export async function gerarPdf(blocos: BlocoModelo[]): Promise<Buffer> {
  const elementos = blocos.map((bloco, i) => {
    if (bloco.runs.length === 0) {
      return React.createElement(View, { key: i, style: estilos.vazio });
    }
    return React.createElement(
      Text,
      { key: i, style: [estilos.paragrafo, { textAlign: bloco.alinhamento }] },
      bloco.runs.map((run, j) =>
        React.createElement(Text, { key: j, style: estiloRun(run) }, run.texto),
      ),
    );
  });

  const documento = React.createElement(
    Document,
    null,
    React.createElement(Page, { size: "A4", style: estilos.pagina }, elementos),
  );

  return renderToBuffer(documento);
}
