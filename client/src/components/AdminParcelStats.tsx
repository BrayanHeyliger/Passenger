import { useState } from "react";
import { Loader2, Package, TrendingUp, DollarSign, Clock, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";

export function AdminParcelStats() {
  const [filter, setFilter] = useState<"all" | "pending" | "in_transit" | "delivered">("all");

  const { data: stats, isLoading: loadingStats } = trpc.parcels.getStats.useQuery();
  const { data: allOrders, isLoading: loadingOrders } = trpc.parcels.listAll.useQuery();

  const filteredOrders = (allOrders as any[])?.filter((order: any) => {
    if (filter === "all") return true;
    return order.status === filter;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "in_transit":
        return "bg-orange-100 text-orange-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: "Pendiente",
      accepted: "Aceptado",
      in_transit: "En Transito",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  if (loadingStats || loadingOrders) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-green-500" size={32} />
      </div>
    );
  }

  const stats_data = stats as any;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Paquetes</p>
              <p className="text-2xl font-bold text-slate-900">{stats_data?.total || 0}</p>
            </div>
            <Package size={32} className="text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats_data?.byStatus?.pending || 0}</p>
            </div>
            <Clock size={32} className="text-yellow-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Entregados</p>
              <p className="text-2xl font-bold text-green-600">{stats_data?.byStatus?.delivered || 0}</p>
            </div>
            <CheckCircle size={32} className="text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-600">${(stats_data?.totalRevenue || 0).toFixed(2)}</p>
            </div>
            <DollarSign size={32} className="text-green-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Filtros y Lista */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Todas las Entregas</h2>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {(["all", "pending", "in_transit", "delivered"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? "bg-green-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f === "all" ? "Todos" : f === "pending" ? "Pendientes" : f === "in_transit" ? "En Transito" : "Entregados"}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No hay paquetes en esta categoría</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Código</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Cliente</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Conductor</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Origen</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Destino</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Precio</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Estado</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-green-600">{order.trackingCode}</td>
                    <td className="py-3 px-4 text-slate-700">{order.clientName || "N/A"}</td>
                    <td className="py-3 px-4 text-slate-700">{order.driverName || "Pendiente"}</td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-xs">{order.pickupAddress}</td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-xs">{order.deliveryAddress}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">${order.totalPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("es-ES")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
