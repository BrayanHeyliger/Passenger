import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { rawQuery, rawMutate } from "../db";
import { TRPCError } from "@trpc/server";

// Generar código de rastreo único
function generateTrackingCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const parcelsRouter = router({
  // Crear nueva orden de paquete
  create: protectedProcedure
    .input(
      z.object({
        pickupAddress: z.string(),
        pickupLat: z.number(),
        pickupLng: z.number(),
        dropoffAddress: z.string(),
        dropoffLat: z.number(),
        dropoffLng: z.number(),
        packageType: z.enum(["small", "medium", "large"]),
        weight: z.number(),
        description: z.string().optional(),
        estimatedPrice: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const trackingCode = generateTrackingCode();
      const now = new Date().toISOString();

      const sql = `
        INSERT INTO parcelOrders (
          clientId, trackingCode, pickupAddress, pickupLat, pickupLng,
          dropoffAddress, dropoffLat, dropoffLng, packageType, weight,
          description, estimatedPrice, status, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await rawMutate(sql, [
        ctx.user?.id || 0,
        trackingCode,
        input.pickupAddress,
        input.pickupLat,
        input.pickupLng,
        input.dropoffAddress,
        input.dropoffLat,
        input.dropoffLng,
        input.packageType,
        input.weight,
        input.description || "",
        input.estimatedPrice,
        "pending",
        now,
      ]);

      return { trackingCode, status: "pending", createdAt: now };
    }),

  // Listar órdenes activas del cliente
  listByClient: protectedProcedure.query(async ({ ctx }) => {
    const sql = `
      SELECT * FROM parcelOrders
      WHERE clientId = ? AND status IN ('pending', 'accepted', 'in_transit')
      ORDER BY createdAt DESC
    `;
    const orders = await rawQuery(sql, [ctx.user?.id || 0]);
    return orders || [];
  }),

  // Listar historial de órdenes completadas del cliente
  historyByClient: protectedProcedure.query(async ({ ctx }) => {
    const sql = `
      SELECT * FROM parcelOrders
      WHERE clientId = ? AND status IN ('delivered', 'cancelled')
      ORDER BY createdAt DESC
      LIMIT 50
    `;
    const orders = await rawQuery(sql, [ctx.user?.id || 0]);
    return orders || [];
  }),

  // Obtener detalle de una orden
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const sql = `SELECT * FROM parcelOrders WHERE id = ? AND clientId = ?`;
      const orders = await rawQuery(sql, [input.id, ctx.user?.id || 0]);
      if (!orders || orders.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return orders[0];
    }),

  // Listar órdenes disponibles para conductores
  listAvailable: protectedProcedure.query(async ({ ctx }) => {
    const sql = `
      SELECT * FROM parcelOrders
      WHERE status = 'pending'
      ORDER BY createdAt ASC
      LIMIT 20
    `;
    const orders = await rawQuery(sql, []);
    return orders || [];
  }),

  // Listar órdenes asignadas a un conductor
  listByDriver: protectedProcedure.query(async ({ ctx }) => {
    const sql = `
      SELECT * FROM parcelOrders
      WHERE driverId = ? AND status IN ('accepted', 'in_transit')
      ORDER BY createdAt DESC
    `;
    const orders = await rawQuery(sql, [ctx.user?.id || 0]);
    return orders || [];
  }),

  // Aceptar orden como conductor
  acceptOrder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();
      const sql = `
        UPDATE parcelOrders
        SET driverId = ?, status = 'accepted', acceptedAt = ?
        WHERE id = ? AND status = 'pending'
      `;
      await rawMutate(sql, [ctx.user?.id || 0, now, input.id]);
      return { status: "accepted", acceptedAt: now };
    }),

  // Actualizar estado de orden
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["in_transit", "delivered", "cancelled"]),
        driverLocation: z
          .object({ lat: z.number(), lng: z.number() })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();
      let sql = `UPDATE parcelOrders SET status = ?, updatedAt = ?`;
      const params: any[] = [input.status, now];

      if (input.status === "delivered") {
        sql += `, deliveredAt = ?`;
        params.push(now);
      }

      if (input.driverLocation) {
        sql += `, driverLat = ?, driverLng = ?`;
        params.push(input.driverLocation.lat, input.driverLocation.lng);
      }

      sql += ` WHERE id = ? AND driverId = ?`;
      params.push(input.id, ctx.user?.id || 0);

      await rawMutate(sql, params);
      return { status: input.status, updatedAt: now };
    }),

  // Listar todas las órdenes para admin
  listAll: protectedProcedure.query(async ({ ctx }) => {
    // Verificar que sea admin
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const sql = `
      SELECT * FROM parcelOrders
      ORDER BY createdAt DESC
      LIMIT 100
    `;
    const orders = await rawQuery(sql, []);
    return orders || [];
  }),

  // Estadísticas de paquetes para admin
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const stats = await rawQuery(
      `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as in_transit,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CAST(REPLACE(estimatedPrice, '$', '') AS DECIMAL(10,2))) as totalRevenue
      FROM parcelOrders
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `,
      []
    );

    return stats?.[0] || {};
  }),

  // Cancelar orden
  cancel: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();
      const sql = `
        UPDATE parcelOrders
        SET status = 'cancelled', updatedAt = ?
        WHERE id = ? AND (clientId = ? OR driverId = ?)
      `;
      await rawMutate(sql, [now, input.id, ctx.user?.id || 0, ctx.user?.id || 0]);
      return { status: "cancelled", updatedAt: now };
    }),
});
