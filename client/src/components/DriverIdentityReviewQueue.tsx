import { useState } from "react";
import { CheckCircle2, Eye, FileWarning, RefreshCcw, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function DriverIdentityReviewQueue() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const pending = trpc.driverIdentity.pendingForReview.useQuery(undefined, { enabled: false, retry: false });
  const evidence = trpc.driverIdentity.evidenceForReview.useQuery({ submissionId: selectedId ?? 0 }, { enabled: false, retry: false });
  const review = trpc.driverIdentity.review.useMutation({
    onSuccess: async () => {
      toast.success("Decisión de identidad registrada.");
      setSelectedId(null);
      setReviewNote("");
      await pending.refetch();
    },
    onError: error => toast.error(error.message || "No se pudo registrar la decisión."),
  });

  const openEvidence = async (submissionId: number) => {
    setSelectedId(submissionId);
    await evidence.refetch();
  };

  const decide = (decision: "approved" | "resubmission_required" | "rejected") => {
    if (!selectedId) return;
    review.mutate({ submissionId: selectedId, decision, reviewNote: reviewNote.trim() || undefined });
  };

  return (
    <Card className="border-violet-200 bg-violet-50/50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-700"><ShieldCheck size={20} /></span><div><h2 className="font-bold text-slate-900">Revisión de identidad</h2><p className="mt-1 text-xs text-slate-600">Solo un administrador decide si la selfie y la licencia corresponden. No existe aprobación biométrica automática.</p></div></div>
        <Button size="sm" variant="outline" onClick={() => void pending.refetch()} className="gap-2"><RefreshCcw size={14} /> Cargar solicitudes</Button>
      </div>

      {pending.isError && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Inicia sesión con una cuenta administradora de producción para consultar solicitudes privadas.</p>}
      {pending.data && pending.data.length === 0 && <p className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-500">No hay verificaciones pendientes.</p>}
      {pending.data && pending.data.length > 0 && <div className="mt-4 space-y-2">{pending.data.map(item => <div key={item.submissionId} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-100 bg-white p-3"><div><b className="block text-sm text-slate-900">{item.driverName} {item.driverLastName || ""}</b><small className="block text-xs text-slate-500">{item.driverEmail} · enviada {new Date(item.submittedAt).toLocaleString("es")}</small></div><Button size="sm" onClick={() => void openEvidence(item.submissionId)} className="gap-1 bg-violet-600 text-white hover:bg-violet-700"><Eye size={14} /> Revisar</Button></div>)}</div>}

      {selectedId && <div className="mt-5 rounded-2xl border border-violet-200 bg-white p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-bold text-slate-900">Evidencias privadas</h3><button type="button" className="text-xs font-semibold text-slate-500" onClick={() => setSelectedId(null)}>Cerrar</button></div>{evidence.isLoading ? <p className="mt-4 text-sm text-slate-500">Cargando evidencias protegidas…</p> : evidence.data ? <><div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">{[["Foto de perfil", evidence.data.profilePhotoUrl], ["Selfie", evidence.data.selfieUrl], ["Licencia", evidence.data.licenseFrontUrl]].map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 p-3 text-xs font-semibold text-violet-700 hover:bg-violet-50">Ver {label}</a>)}</div><textarea value={reviewNote} onChange={event => setReviewNote(event.target.value)} placeholder="Nota para el conductor (obligatoria para solicitar reenvío o rechazar)" className="mt-4 min-h-20 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-400" /><div className="mt-3 grid gap-2 sm:grid-cols-3"><Button disabled={review.isPending} onClick={() => decide("approved")} className="gap-1 bg-emerald-500 text-[#062018] hover:bg-emerald-400"><CheckCircle2 size={15} /> Aprobar</Button><Button disabled={review.isPending} onClick={() => decide("resubmission_required")} variant="outline" className="gap-1 border-amber-300 text-amber-800"><FileWarning size={15} /> Reenviar</Button><Button disabled={review.isPending} onClick={() => decide("rejected")} variant="outline" className="gap-1 border-red-300 text-red-700"><XCircle size={15} /> Rechazar</Button></div></> : <p className="mt-4 text-sm text-red-600">No fue posible cargar evidencias privadas.</p>}</div>}
    </Card>
  );
}
