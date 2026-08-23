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

  const shareMessage = `Te comparto la planificación "${plan.title}" (${plan.grade}.º grado):`;

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

  // Compartir nativo del celular (muestra WhatsApp, Gmail, etc.).
  async function nativeShare() {
    if (!shareUrl) return;
    const nav = navigator as Navigator & {
      share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
    };
    if (nav.share) {
      try {
        await nav.share({ title: plan.title, text: shareMessage, url: shareUrl });
      } catch {
        // El usuario canceló el diálogo: no es un error.
      }
    } else {
      copyLink();
    }
  }

  const whatsappHref = shareUrl
    ? `https://wa.me/?text=${encodeURIComponent(`${shareMessage} ${shareUrl}`)}`
    : "#";
  const emailHref = shareUrl
    ? `mailto:?subject=${encodeURIComponent(`Planificación: ${plan.title}`)}&body=${encodeURIComponent(`${shareMessage}\n\n${shareUrl}`)}`
    : "#";

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
        <div className="mt-3 rounded-xl border border-border bg-surface-2 p-4">
          <p className="mb-3 text-sm font-bold text-brand-ink">Compartir por…</p>

          <div className="flex flex-wrap gap-2.5">
            {/* WhatsApp */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.7h-.01a9.6 9.6 0 0 1-4.9-1.34l-.35-.21-3.64.95.97-3.55-.23-.36a9.56 9.56 0 0 1-1.47-5.1c0-5.29 4.31-9.6 9.61-9.6 2.57 0 4.98 1 6.79 2.82a9.55 9.55 0 0 1 2.81 6.79c0 5.29-4.31 9.6-9.6 9.6zM20.5 3.49A11.5 11.5 0 0 0 12.05.01C5.7.01.53 5.18.53 11.53c0 2.03.53 4.02 1.54 5.77L.43 23.6l6.44-1.69a11.5 11.5 0 0 0 5.18 1.32h.01c6.35 0 11.52-5.17 11.52-11.52 0-3.08-1.2-5.97-3.38-8.15z" />
              </svg>
              WhatsApp
            </a>

            {/* Email */}
            <a
              href={emailHref}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-bold text-brand-ink transition-colors hover:bg-surface-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 6L2 7" />
              </svg>
              Email
            </a>

            {/* Compartir del celular (si está disponible) */}
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                onClick={nativeShare}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-bold text-brand-ink transition-colors hover:bg-surface-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Más
              </button>
            )}

            {/* Copiar link */}
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

          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block truncate text-xs text-muted underline"
          >
            {shareUrl}
          </a>
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
