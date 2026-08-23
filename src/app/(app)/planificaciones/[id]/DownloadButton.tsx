"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type GeneratedSections } from "@/features/plans/schema";
import {
  generatePlanPdfBlob,
  planPdfFilename,
  type PlanForPdf,
} from "@/features/plans/pdf";

const BUCKET = "planificaciones";

export function DownloadButton({
  planId,
  plan,
  sections,
}: {
  planId: string;
  plan: PlanForPdf;
  sections: Partial<GeneratedSections>;
}) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storagePath = `${planId}.pdf`;

  // Genera el PDF, lo descarga y lo guarda en Supabase Storage.
  async function handleDownload() {
    setError(null);
    setDownloading(true);
    try {
      const blob = await generatePlanPdfBlob(plan, sections);

      // Descargar en el navegador
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = planPdfFilename(plan);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Guardar en Supabase (no bloquea la descarga si falla)
      try {
        const supabase = createClient();
        await supabase.storage
          .from(BUCKET)
          .upload(storagePath, blob, { contentType: "application/pdf", upsert: true });
      } catch (uploadErr) {
        console.warn("No se pudo guardar el PDF en Supabase:", uploadErr);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo generar el PDF.");
    } finally {
      setDownloading(false);
    }
  }

  // Asegura que el PDF esté guardado y genera un link firmado para compartir.
  async function handleShare() {
    setError(null);
    setSharing(true);
    setCopied(false);
    try {
      const supabase = createClient();

      // Subir (o actualizar) el PDF antes de compartir.
      const blob = await generatePlanPdfBlob(plan, sections);
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, blob, { contentType: "application/pdf", upsert: true });
      if (upErr) throw upErr;

      // Link firmado válido por 1 año.
      const { data, error: signErr } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365);
      if (signErr || !data?.signedUrl) throw signErr ?? new Error("Sin URL");

      setShareUrl(data.signedUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? `No se pudo compartir: ${err.message}`
          : "No se pudo generar el link para compartir.",
      );
    } finally {
      setSharing(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignorar: el link queda visible para copiar a mano.
    }
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-2 disabled:opacity-55"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {downloading ? "Generando PDF…" : "Descargar PDF"}
        </button>

        <button
          onClick={handleShare}
          disabled={sharing}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-brand bg-surface px-6 py-3 text-sm font-bold text-brand transition-colors hover:bg-surface-2 disabled:opacity-55"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
            <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
          </svg>
          {sharing ? "Preparando…" : "Compartir"}
        </button>
      </div>

      {shareUrl && (
        <div className="mt-3">
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-bold text-brand-ink transition-colors hover:bg-surface-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied ? "¡Copiado!" : "Copiar link"}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm font-bold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
