import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Car, Users, MapPin, DollarSign, Plus, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function FleetDashboard() {
  const [, navigate] = useLocation();

  const fleetDrivers = [
    { id: 1, name: "Carlos M.", vehicle: "Toyota Corolla", plate: "ABC-123", status: "online", trips: 5, earnings: "$125.00" },
    { id: 2, name: "Pedro R.", vehicle: "Honda Civic", plate: "DEF-456", status: "offline", trips: 3, earnings: "$78.50" },
    { id: 3, name: "Luis S.", vehicle: "Nissan Sentra", plate: "GHI-789", status: "on_trip", trips: 7, earnings: "$198.00" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold">F</div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Panel de Flotilla</h1>
              <p className="text-sm text-slate-500">Gestiona tu flota de taxis</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
            <LogOut size={16} /> Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Car size={20} className="text-blue-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">3</p>
                <p className="text-sm text-slate-500">Vehículos</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><Users size={20} className="text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">3</p>
                <p className="text-sm text-slate-500">Conductores</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><MapPin size={20} className="text-purple-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">15</p>
                <p className="text-sm text-slate-500">Viajes Hoy</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center"><DollarSign size={20} className="text-yellow-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">$401.50</p>
                <p className="text-sm text-slate-500">Ingresos Hoy</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Drivers Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Mis Conductores</h2>
            <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700 text-white">
              <Plus size={14} /> Agregar Conductor
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Conductor</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Vehículo</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Placa</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Estado</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Viajes Hoy</th>
                  <th className="text-left py-3 px-2 text-slate-500 font-medium">Ganancias</th>
                </tr>
              </thead>
              <tbody>
                {fleetDrivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 font-medium text-slate-900">{driver.name}</td>
                    <td className="py-3 px-2 text-slate-600">{driver.vehicle}</td>
                    <td className="py-3 px-2 font-mono text-slate-600">{driver.plate}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        driver.status === "online" ? "bg-green-100 text-green-700" :
                        driver.status === "on_trip" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {driver.status === "online" ? "En línea" : driver.status === "on_trip" ? "En viaje" : "Desconectado"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-900">{driver.trips}</td>
                    <td className="py-3 px-2 font-semibold text-green-600">{driver.earnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}

