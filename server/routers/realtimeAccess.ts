import { SignJWT } from "jose";
import { and, eq, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { clients, drivers, tripDriverOffers, trips } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

type RealtimeRole = "passenger" | "driver" | "support";

function signingKey() {
  const secret = process.env.SAYTAXI_REALTIME_JWT_SECRET;
  if (!secret) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "La conexión en tiempo real de producción aún no está configurada.",
    });
  }
  return new TextEncoder().encode(secret);
}

async function realtimeRoleForTrip(userId: number, userRole: string | null | undefined, tripId: number): Promise<RealtimeRole> {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Base de datos operativa no disponible." });
  const [trip] = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
  if (!trip) throw new TRPCError({ code: "NOT_FOUND", message: "Viaje no encontrado." });

  if (userRole === "admin" || userRole === "dispatcher") return "support";

  if (userRole === "client") {
    const [client] = await db.select().from(clients).where(eq(clients.userId, userId)).limit(1);
    if (client?.id === trip.clientId) return "passenger";
  }

  if (userRole === "driver") {
    const [driver] = await db.select().from(drivers).where(eq(drivers.userId, userId)).limit(1);
    if (driver && (trip.driverId === driver.id || trip.selectedDriverId === driver.id)) return "driver";
    if (driver) {
      const [offer] = await db
        .select({ id: tripDriverOffers.id })
        .from(tripDriverOffers)
        .where(and(eq(tripDriverOffers.tripId, trip.id), eq(tripDriverOffers.driverId, driver.id), or(eq(tripDriverOffers.status, "pending"), eq(tripDriverOffers.status, "accepted"))))
        .limit(1);
      if (offer) return "driver";
    }
  }

  throw new TRPCError({ code: "FORBIDDEN", message: "No tienes acceso a la sala de este viaje." });
}

export const realtimeAccessRouter = router({
  issueTripToken: protectedProcedure
    .input(z.object({ tripId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const role = await realtimeRoleForTrip(ctx.user.id, ctx.user.role, input.tripId);
      const token = await new SignJWT({ role })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(String(ctx.user.id))
        .setIssuer("saytaxi-passenger")
        .setAudience("saytaxi-realtime")
        .setIssuedAt()
        .setExpirationTime("10m")
        .sign(signingKey());
      return { token, roomId: `trip-${input.tripId}`, expiresInSeconds: 600 };
    }),
});
