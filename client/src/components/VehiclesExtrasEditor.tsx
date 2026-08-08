import { useState } from "react";
import { useSiteConfig, DEFAULT_SITE_CONFIG } from "@/contexts/SiteConfigContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";

export function VehiclesExtrasEditor() {
  const { config, saveConfig } = useSiteConfig();
  const [vehicles, setVehicles] = useState(config.vehicles || DEFAULT_SITE_CONFIG.vehicles);
  const [extras, setExtras]     = useState(config.extras   || DEFAULT_SITE_CONFIG.extras);
  const [saving, setSaving]     = useState(false);

  const handleSave = () => {
    setSaving(true);
    saveConfig({ ...config, vehicles, extras });
    setTimeout(() => { setSaving(false); toast.success("Vehículos y extras guardados"); }, 800);
  };

  const updateVehicle = (idx: number, field: string, value: any) =>
    setVehicles(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));

  const updateExtra = (idx: number, field: string, value: any) =>
    setExtras(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));

  const addExtra = () =>
    setExtras(prev => [...prev, { id: `extra_${Date.now()}`, label: "Nuevo extra", icon: "⭐", price: 0, active: true }]);

  const removeExtra = (idx: number) => setExtras(prev => prev.filter((_, i) => i !== idx));

  const inp = "w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none";

  return (
    <div className="space-y-6">
      {/* Vehicles */}
      <Card className="p-5">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">🚗 Tipos de Vehículo</h3>
        <div className="space-y-3">
          {vehicles.map((v, i) => (
            <div key={v.id} className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Emoji</label>
                <input value={v.emoji} onChange={e => updateVehicle(i, "emoji", e.target.value)} className={inp} maxLength={2} />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Nombre</label>
                <input value={v.label} onChange={e => updateVehicle(i, "label", e.target.value)} className={inp} />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Tarifa base ($)</label>
                <input type="number" min="0" step="0.5" value={v.base} onChange={e => updateVehicle(i, "base", parseFloat(e.target.value) || 0)} className={inp} />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">$/km</label>
                <input type="number" min="0" step="0.1" value={v.perKm} onChange={e => updateVehicle(i, "perKm", parseFloat(e.target.value) || 0)} className={inp} />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">ETA estimado</label>
                <input value={v.eta} onChange={e => updateVehicle(i, "eta", e.target.value)} className={inp} placeholder="3 min" />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Asientos</label>
                <input type="number" min="1" max="12" value={v.seats} onChange={e => updateVehicle(i, "seats", parseInt(e.target.value) || 4)} className={inp} />
              </div>
              <div className="flex items-end">
                <button onClick={() => updateVehicle(i, "active", !v.active)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${v.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                  {v.active ? <Eye size={13} /> : <EyeOff size={13} />}
                  {v.active ? "Activo" : "Oculto"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Extras */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">⭐ Requisitos Especiales</h3>
          <Button size="sm" variant="outline" onClick={addExtra} className="gap-1.5 text-xs"><Plus size={13} /> Agregar</Button>
        </div>
        <div className="space-y-2">
          {extras.map((ex, i) => (
            <div key={ex.id} className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 items-end">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Icono</label>
                <input value={ex.icon} onChange={e => updateExtra(i, "icon", e.target.value)} className={inp} maxLength={2} />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Nombre</label>
                <input value={ex.label} onChange={e => updateExtra(i, "label", e.target.value)} className={inp} />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Precio extra ($)</label>
                <input type="number" min="0" step="0.5" value={ex.price} onChange={e => updateExtra(i, "price", parseFloat(e.target.value) || 0)} className={inp} />
              </div>
              <div className="flex items-end">
                <button onClick={() => updateExtra(i, "active", !ex.active)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${ex.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                  {ex.active ? <Eye size={13} /> : <EyeOff size={13} />}
                  {ex.active ? "Activo" : "Oculto"}
                </button>
              </div>
              <div className="flex items-end">
                <button onClick={() => removeExtra(i)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-all">
                  <Trash2 size={13} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full gap-2 text-white" style={{ background: "oklch(0.76 0.18 148)" }}>
        <Save size={16} /> {saving ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  );
}
