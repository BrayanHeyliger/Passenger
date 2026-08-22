import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, FileText, ShieldCheck, Upload, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type IdentityStatus = "unsubmitted" | "pending_review" | "approved" | "resubmission_required" | "rejected";

type Props = {
  demoMode?: boolean;
  onStatusChange?: (status: IdentityStatus) => void;
  onApprovedPhotoChange?: (url: string | null) => void;
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const statusCopy: Record<IdentityStatus, { title: string; detail: string; tone: string }> = {
  unsubmitted: { title: "Verificación pendiente", detail: "Completa foto de perfil, selfie, licencia y consentimiento antes de conectarte.", tone: "border-amber-200 bg-amber-50 text-amber-900" },
  pending_review: { title: "En revisión", detail: "Tu información fue enviada. Un administrador debe revisarla antes de activar tu perfil.", tone: "border-blue-200 bg-blue-50 text-blue-900" },
  approved: { title: "Identidad verificada", detail: "Tu foto aprobada puede mostrarse a los pasajeros y puedes recibir viajes.", tone: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  resubmission_required: { title: "Se requiere reenvío", detail: "Revisa la nota administrativa y envía evidencias nuevas y legibles.", tone: "border-amber-200 bg-amber-50 text-amber-900" },
  rejected: { title: "Verificación no aprobada", detail: "Tu perfil permanece desconectado. Contacta al soporte si consideras que se trata de un error.", tone: "border-red-200 bg-red-50 text-red-900" },
};

function imageToPayload(file: File): Promise<{ filename: string; mimeType: "image/jpeg" | "image/png" | "image/webp"; base64: string }> {
  return new Promise((resolve, reject) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      reject(new Error("Usa JPG, PNG o WebP."));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error("Cada imagen debe tener un máximo de 5 MB."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => resolve({ filename: file.name, mimeType: file.type as "image/jpeg" | "image/png" | "image/webp", base64: String(reader.result) });
    reader.readAsDataURL(file);
  });
}

export function DriverIdentityVerificationPanel({ demoMode = false, onStatusChange, onApprovedPhotoChange }: Props) {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [licenseFront, setLicenseFront] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [demoStatus, setDemoStatus] = useState<IdentityStatus>(demoMode ? "approved" : "unsubmitted");
  const query = trpc.driverIdentity.getMine.useQuery(undefined, { enabled: !demoMode, retry: false });
  const submit = trpc.driverIdentity.submit.useMutation({
    onSuccess: data => {
      onStatusChange?.(data.status);
      onApprovedPhotoChange?.(null);
      void query.refetch();
      toast.success("Evidencias enviadas para revisión manual.");
    },
    onError: error => toast.error(error.message || "No se pudo enviar la verificación."),
  });

  const status = demoMode ? demoStatus : (query.data?.status ?? "unsubmitted");
  const current = statusCopy[status];
  const canSubmit = Boolean(profilePhoto && selfie && licenseFront && consent && !submit.isPending);
  const selectedFiles = useMemo(() => [
    { label: "Foto de perfil", file: profilePhoto, setFile: setProfilePhoto, help: "Rostro actual, frontal y sin accesorios que oculten la cara." },
    { label: "Selfie de verificación", file: selfie, setFile: setSelfie, help: "Se compara manualmente con tu licencia." },
    { label: "Licencia de conducir", file: licenseFront, setFile: setLicenseFront, help: "Anverso completo, vigente y legible." },
  ], [profilePhoto, selfie, licenseFront]);

  useEffect(() => {
    onStatusChange?.(status);
    onApprovedPhotoChange?.(status === "approved" ? query.data?.profileImage ?? null : null);
  }, [status, query.data?.profileImage, onStatusChange, onApprovedPhotoChange]);

  const submitEvidence = async () => {
    if (!profilePhoto || !selfie || !licenseFront || !consent) return;
    if (demoMode) {
      setDemoStatus("pending_review");
      onStatusChange?.("pending_review");
      toast.message("QA: no se almacenaron documentos reales. En producción se enviarán a almacenamiento privado.");
      return;
    }
    try {
      const [profilePhotoPayload, selfiePayload, licenseFrontPayload] = await Promise.all([
        imageToPayload(profilePhoto), imageToPayload(selfie), imageToPayload(licenseFront),
      ]);
      submit.mutate({ profilePhoto: profilePhotoPayload, selfie: selfiePayload, licenseFront: licenseFrontPayload, consent: true, consentVersion: "2026-08-22" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Revisa los archivos seleccionados.");
    }
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-4 ${current.tone}`}>
        <div className="flex items-start gap-3">
          {status === "approved" ? <CheckCircle2 className="mt-0.5 shrink-0" size={20} /> : status === "pending_review" ? <Clock3 className="mt-0.5 shrink-0" size={20} /> : <ShieldCheck className="mt-0.5 shrink-0" size={20} />}
          <div><p className="font-bold">{current.title}</p><p className="mt-1 text-xs leading-5">{current.detail}</p>{query.data?.reviewNote && <p className="mt-3 rounded-lg bg-white/60 p-2 text-xs"><strong>Nota de revisión:</strong> {query.data.reviewNote}</p>}</div>
        </div>
      </div>

      {demoMode && <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"><strong>Cuenta de demostración:</strong> su estado se muestra como verificado para permitir probar los viajes. No representa una revisión real ni almacena documentos.</div>}

      {status !== "approved" && status !== "pending_review" && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div><h3 className="font-bold text-slate-900">Completa tu identidad</h3><p className="mt-1 text-xs text-slate-500">Solo se aceptan JPG, PNG o WebP de hasta 5 MB. Los documentos no se muestran a pasajeros.</p></div>
          {selectedFiles.map(item => <label key={item.label} className="block cursor-pointer rounded-xl border border-dashed border-slate-300 p-3 transition hover:border-emerald-400 hover:bg-emerald-50/40"><span className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600">{item.label === "Foto de perfil" ? <UserRoundCheck size={17} /> : <FileText size={17} />}</span><span className="min-w-0"><strong className="block text-sm text-slate-900">{item.label}</strong><small className="block truncate text-xs text-slate-500">{item.file ? item.file.name : item.help}</small></span><Upload className="ml-auto text-slate-400" size={17} /></span><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={event => item.setFile(event.target.files?.[0] || null)} /></label>)}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-0.5 h-4 w-4" /><span>Autorizo el uso de mi foto y licencia únicamente para verificar mi identidad, prevenir fraude y habilitar mi cuenta de conductor. Entiendo que una persona autorizada puede solicitar un reenvío.</span></label>
          <button type="button" disabled={!canSubmit} onClick={() => void submitEvidence()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-[#062018] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-45">{submit.isPending ? <Clock3 size={17} className="animate-spin" /> : <ShieldCheck size={17} />} Enviar para revisión</button>
        </div>
      )}

      {status === "pending_review" && <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800"><AlertTriangle size={16} className="mt-0.5 shrink-0" />Tu cuenta no puede conectarse ni recibir viajes mientras esté pendiente la revisión.</div>}
    </div>
  );
}
