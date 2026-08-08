import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Car, ArrowLeft, Mail, Lock, Phone, FileText, Building2, Eye, EyeOff, MapPin, ChevronRight } from "lucide-react";
import { useLocalAuth, type UserRole } from "@/contexts/LocalAuthContext";
import { useI18n } from "@/contexts/I18nContext";

type RegisterType = "select" | "client" | "driver" | "fleet";

export default function Register() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const { register } = useLocalAuth();
  const [registerType, setRegisterType] = useState<RegisterType>("select");
  const [pendingTrip, setPendingTrip] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    vehicleMake: "",
    vehicleModel: "",
    vehiclePlate: "",
    companyName: "",
  });

  // Check for pending trip from Hero
  useEffect(() => {
    const raw = sessionStorage.getItem("pendingTrip");
    if (raw) {
      try {
        const trip = JSON.parse(raw);
        setPendingTrip(trip);
        // Auto-select client registration if there's a pending trip
        setRegisterType("client");
      } catch { /* ignore */ }
    }
  }, []);

  // Auto-select role if coming from landing page section buttons
  useEffect(() => {
    const savedRole = sessionStorage.getItem("registerRole");
    if (savedRole === "driver") { setRegisterType("driver"); sessionStorage.removeItem("registerRole"); }
    else if (savedRole === "fleet") { setRegisterType("fleet"); sessionStorage.removeItem("registerRole"); }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    const role: UserRole = registerType === "fleet" ? "fleet" : registerType as UserRole;

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName || undefined,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role,
      licenseNumber: formData.licenseNumber || undefined,
      vehicleMake: formData.vehicleMake || undefined,
      vehicleModel: formData.vehicleModel || undefined,
      vehiclePlate: formData.vehiclePlate || undefined,
      companyName: formData.companyName || undefined,
    });

    setLoading(false);

    if (!result.success) {
      setError(result.error || "Error al registrar");
      return;
    }

    // Redirect based on role
    if (role === "driver") {
      navigate("/driver-dashboard");
    } else if (role === "fleet") {
      navigate("/fleet-dashboard");
    } else {
      // pendingTrip stays in sessionStorage so ClientDashboard can read it
      navigate("/client-dashboard");
    }
  };

  const inputClass = (accent = "green") =>
    `w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-${accent}-500 focus:border-transparent outline-none`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.13_0.01_250)] to-[oklch(0.08_0.02_250)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-green-500/20">
              <img src="/manus-storage/logo-icon_34950e08.png" alt="Logo" className="w-full h-full object-cover" style={{ background: "oklch(0.76 0.18 148)" }} />
            </div>
            <span className="text-white font-bold text-xl" style={{ fontFamily: "'Sora', sans-serif" }}>
              WhatsApp<span className="text-[oklch(0.76_0.18_148)]">Taxi</span>
            </span>
          </a>
        </div>

        {/* Selección de tipo */}
        {registerType === "select" && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Crear Cuenta</h1>
              <p className="text-white/60">Selecciona cómo quieres registrarte</p>
            </div>
            {pendingTrip && (
              <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: "oklch(0.76 0.18 148 / 0.12)", border: "1px solid oklch(0.76 0.18 148 / 0.3)" }}>
                <div className="text-2xl flex-shrink-0">🚕</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">Viaje pendiente de confirmar</p>
                  <p className="text-white/50 text-xs truncate">{pendingTrip.pickup} → {pendingTrip.destination}</p>
                  {pendingTrip.estimate && <p className="text-[oklch(0.76_0.18_148)] text-xs font-bold mt-0.5">${pendingTrip.estimate.price?.toFixed(2)} · {pendingTrip.estimate.km} km</p>}
                </div>
                <ChevronRight size={16} className="text-white/40 flex-shrink-0" />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-6 cursor-pointer border-2 border-transparent hover:border-green-500/50 bg-white/5 backdrop-blur-sm transition-all hover:scale-[1.02]" onClick={() => setRegisterType("client")}>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                    <User size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Soy Cliente</h3>
                    <p className="text-white/50 text-sm mt-1">Quiero pedir taxis</p>
                  </div>
                  <Button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30">Registrarme</Button>
                </div>
              </Card>
              <Card className="p-6 cursor-pointer border-2 border-transparent hover:border-blue-500/50 bg-white/5 backdrop-blur-sm transition-all hover:scale-[1.02]" onClick={() => setRegisterType("driver")}>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Car size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Soy Conductor</h3>
                    <p className="text-white/50 text-sm mt-1">Quiero ganar dinero</p>
                  </div>
                  <Button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30">Registrarme</Button>
                </div>
              </Card>
              <Card className="p-6 cursor-pointer border-2 border-transparent hover:border-indigo-500/50 bg-white/5 backdrop-blur-sm transition-all hover:scale-[1.02]" onClick={() => setRegisterType("fleet")}>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Building2 size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Soy Empresa</h3>
                    <p className="text-white/50 text-sm mt-1">Gestionar flotilla</p>
                  </div>
                  <Button className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30">Registrarme</Button>
                </div>
              </Card>
            </div>
            <div className="text-center pt-2">
              <p className="text-white/50 text-sm">
                ¿Ya tienes cuenta?{" "}
                <a href="/login" className="text-[oklch(0.76_0.18_148)] hover:underline font-medium">Iniciar Sesión</a>
              </p>
            </div>
            <div className="text-center">
              <a href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors">
                <ArrowLeft size={14} /> Volver al inicio
              </a>
            </div>
          </div>
        )}

        {/* Formulario */}
        {registerType !== "select" && (
          <Card className="p-8 bg-white/5 backdrop-blur-sm border border-white/10">
            <button onClick={() => { setRegisterType("select"); setError(""); }} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft size={14} /> Volver
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${registerType === "client" ? "bg-gradient-to-br from-green-400 to-green-600" : registerType === "driver" ? "bg-gradient-to-br from-blue-400 to-blue-600" : "bg-gradient-to-br from-indigo-400 to-indigo-600"}`}>
                {registerType === "client" ? <User size={20} className="text-white" /> : registerType === "driver" ? <Car size={20} className="text-white" /> : <Building2 size={20} className="text-white" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {registerType === "client" ? "Registro de Cliente" : registerType === "driver" ? "Registro de Conductor" : "Registro de Empresa"}
                </h2>
                <p className="text-white/50 text-sm">Completa tus datos</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Nombre *</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className={inputClass()} placeholder="Tu nombre" />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Apellido</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className={inputClass()} placeholder="Tu apellido" />
                </div>
              </div>

              {registerType === "fleet" && (
                <div>
                  <label className="block text-white/70 text-sm mb-1"><Building2 size={14} className="inline mr-1" /> Nombre de la Empresa *</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} required className={inputClass("indigo")} placeholder="Mi Empresa de Taxis" />
                </div>
              )}

              <div>
                <label className="block text-white/70 text-sm mb-1"><Mail size={14} className="inline mr-1" /> Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required autoComplete="email" className={inputClass()} placeholder="tu@email.com" />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1"><Phone size={14} className="inline mr-1" /> Teléfono *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className={inputClass()} placeholder="+1 234 567 8900" />
              </div>

              {registerType === "driver" && (
                <>
                  <div>
                    <label className="block text-white/70 text-sm mb-1"><FileText size={14} className="inline mr-1" /> Número de Licencia *</label>
                    <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} required className={inputClass("blue")} placeholder="DL-123456" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Marca *</label>
                      <input type="text" name="vehicleMake" value={formData.vehicleMake} onChange={handleInputChange} required className={inputClass("blue")} placeholder="Toyota" />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Modelo *</label>
                      <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleInputChange} required className={inputClass("blue")} placeholder="Corolla" />
                    </div>
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Placa *</label>
                      <input type="text" name="vehiclePlate" value={formData.vehiclePlate} onChange={handleInputChange} required className={inputClass("blue")} placeholder="ABC-123" />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-white/70 text-sm mb-1"><Lock size={14} className="inline mr-1" /> Contraseña *</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} required autoComplete="new-password" className={`${inputClass()} pr-12`} placeholder="Mínimo 6 caracteres" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1"><Lock size={14} className="inline mr-1" /> Confirmar Contraseña *</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required autoComplete="new-password" className={inputClass()} placeholder="Repite tu contraseña" />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full py-3 font-semibold text-base shadow-lg mt-2 ${registerType === "driver" ? "bg-blue-600 hover:bg-blue-700 text-white" : registerType === "fleet" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}`}
                style={registerType === "client" ? { background: "oklch(0.76 0.18 148)", color: "oklch(0.08 0.02 148)" } : {}}
              >
                {loading ? "Registrando..." : `Crear Cuenta ${registerType === "client" ? "de Cliente" : registerType === "driver" ? "de Conductor" : "de Empresa"}`}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
