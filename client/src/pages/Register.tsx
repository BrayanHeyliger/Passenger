import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Car, ArrowLeft, Mail, Lock, Phone, FileText, Building2 } from "lucide-react";

type RegisterType = "select" | "client" | "driver" | "fleet";

export default function Register() {
  const [, navigate] = useLocation();
  const [registerType, setRegisterType] = useState<RegisterType>("select");
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
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    // Aquí iría la llamada a la API de registro
    alert(`Registro exitoso como ${registerType === "client" ? "Cliente" : "Conductor"}. Redirigiendo...`);
    if (registerType === "client") {
      navigate("/client-dashboard");
    } else {
      navigate("/driver-dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.13_0.01_250)] to-[oklch(0.08_0.02_250)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-green-500/20">
              <img
                src="/manus-storage/logo-icon_34950e08.png"
                alt="WhatsApp Taxi Logo"
                className="w-full h-full object-cover"
                style={{ background: "oklch(0.76 0.18 148)" }}
              />
            </div>
            <span className="text-white font-bold text-xl" style={{ fontFamily: "'Sora', sans-serif" }}>
              WhatsApp<span className="text-[oklch(0.76_0.18_148)]">Taxi</span>
            </span>
          </a>
        </div>

        {/* Selección de tipo de registro */}
        {registerType === "select" && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
                Crear Cuenta
              </h1>
              <p className="text-white/60">Selecciona cómo quieres registrarte</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Opción Cliente */}
              <Card
                className="p-6 cursor-pointer border-2 border-transparent hover:border-green-500/50 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] group"
                onClick={() => setRegisterType("client")}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                    <User size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Soy Cliente</h3>
                    <p className="text-white/50 text-sm mt-1">Quiero solicitar viajes y pedir taxis</p>
                  </div>
                  <Button className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30">
                    Registrarme como Cliente
                  </Button>
                </div>
              </Card>

              {/* Opción Conductor */}
              <Card
                className="p-6 cursor-pointer border-2 border-transparent hover:border-blue-500/50 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] group"
                onClick={() => setRegisterType("driver")}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Car size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Soy Conductor</h3>
                    <p className="text-white/50 text-sm mt-1">Quiero aceptar viajes y ganar dinero</p>
                  </div>
                  <Button className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30">
                    Registrarme como Conductor
                  </Button>
                </div>
              </Card>

              {/* Opción Flotilla */}
              <Card
                className="p-6 cursor-pointer border-2 border-transparent hover:border-indigo-500/50 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] group"
                onClick={() => setRegisterType("fleet")}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Building2 size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Soy Empresa</h3>
                    <p className="text-white/50 text-sm mt-1">Quiero gestionar mi propia flotilla</p>
                  </div>
                  <Button className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30">
                    Registrar Flotilla
                  </Button>
                </div>
              </Card>
            </div>

            {/* Link a login */}
            <div className="text-center pt-4">
              <p className="text-white/50 text-sm">
                ¿Ya tienes cuenta?{" "}
                <a href="/login" className="text-[oklch(0.76_0.18_148)] hover:underline font-medium">
                  Iniciar Sesión
                </a>
              </p>
            </div>

            {/* Volver al inicio */}
            <div className="text-center">
              <a href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors">
                <ArrowLeft size={14} />
                Volver al inicio
              </a>
            </div>
          </div>
        )}

        {/* Formulario de Cliente */}
        {registerType === "client" && (
          <Card className="p-8 bg-white/5 backdrop-blur-sm border border-white/10">
            <button
              onClick={() => setRegisterType("select")}
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft size={14} />
              Volver
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Registro de Cliente</h2>
                <p className="text-white/50 text-sm">Completa tus datos para solicitar viajes</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Nombre</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Apellido</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">
                  <Mail size={14} className="inline mr-1" /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">
                  <Phone size={14} className="inline mr-1" /> Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">
                  <Lock size={14} className="inline mr-1" /> Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">
                  <Lock size={14} className="inline mr-1" /> Confirmar Contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Repite tu contraseña"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-3 font-semibold text-base shadow-lg shadow-green-500/25"
                style={{ background: "oklch(0.76 0.18 148)", color: "oklch(0.08 0.02 148)" }}
              >
                Crear Cuenta de Cliente
              </Button>
            </form>
          </Card>
        )}

        {/* Formulario de Conductor */}
        {registerType === "driver" && (
          <Card className="p-8 bg-white/5 backdrop-blur-sm border border-white/10">
            <button
              onClick={() => setRegisterType("select")}
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft size={14} />
              Volver
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Car size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Registro de Conductor</h2>
                <p className="text-white/50 text-sm">Completa tus datos para empezar a ganar</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Nombre</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Apellido</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">
                  <Mail size={14} className="inline mr-1" /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">
                  <Phone size={14} className="inline mr-1" /> Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">
                  <FileText size={14} className="inline mr-1" /> Número de Licencia
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="DL-123456"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Marca del Vehículo</label>
                  <input
                    type="text"
                    name="vehicleMake"
                    value={formData.vehicleMake}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Toyota"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Modelo</label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Corolla"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Placa del Vehículo</label>
                <input
                  type="text"
                  name="vehiclePlate"
                  value={formData.vehiclePlate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="ABC-123"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">
                  <Lock size={14} className="inline mr-1" /> Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">
                  <Lock size={14} className="inline mr-1" /> Confirmar Contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/30 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Repite tu contraseña"
                />
              </div>

              <Button
                type="submit"
                className="w-full py-3 font-semibold text-base shadow-lg shadow-blue-500/25 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Crear Cuenta de Conductor
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
