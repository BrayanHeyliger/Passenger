import { and, desc, eq, inArray, isNotNull, ne } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  clients,
  driverDirectPaymentMethods,
  driverPresenceSnapshots,
  drivers,
  tripDriverOffers,
  tripOperationEvents,
  trips,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

const DIRECT_METHOD_LABEL: Record<"cash" | "zelle" | "cash_app" | "paypal" | "transfer", string> = {
  cash: "Efectivo", zelle: "Zelle", cash_app: "Cash App", paypal: "PayPal", transfer: "Transferencia",
};
const openTripStatuses = ["requested", "choosing_driver", "awaiting_driver", "driver_declined", "searching", "expired"] as const;

function requireDispatcher(role: string | null | undefined) {
  if (role !== "admin" && role !== "dispatcher") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Se requiere permiso de dispatcher." });
  }
}

function requireRole(role: string | null | undefined, required: "client" | "driver") {
  if (role !== required) throw new TRPCError({ code: "FORBIDDEN", message: `Se requiere rol ${required}.` });
}

async function database() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Base de datos operativa no disponible." });
  return db;
}

async function requireClientProfile(userId: number) {
  const db = await database();
  const [profile] = await db.select().from(clients).where(eq(clients.userId, userId)).limit(1);
  if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "No existe perfil de cliente." });
  return { db, profile };
}

async function requireDriverProfile(userId: number) {
  const db = await database();
  const [profile] = await db.select().from(drivers).where(eq(drivers.userId, userId)).limit(1);
  if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "No existe perfil de conductor." });
  return { db, profile };
}

async function appendEvent(
  db: Awaited<ReturnType<typeof database>>,
  tripId: number,
  actorRole: "client" | "driver" | "dispatcher" | "admin" | "system",
  eventType: "trip_requested" | "driver_selected" | "offer_created" | "offer_accepted" | "offer_declined" | "offer_expired" | "autosearch_started" | "dispatcher_assigned" | "trip_cancelled" | "dispatcher_note" | "realtime_message" | "notification_requested",
  actorUserId?: number | null,
  detail?: Record<string, unknown>,
) {
  await db.insert(tripOperationEvents).values({ tripId, actorUserId: actorUserId ?? null, actorRole, eventType, detail: detail ?? null });
}

async function paymentLabels(db: Awaited<ReturnType<typeof database>>, driverId: number) {
  const rows = await db.select().from(driverDirectPaymentMethods).where(and(eq(driverDirectPaymentMethods.driverId, driverId), eq(driverDirectPaymentMethods.enabled, true)));
  return rows.map(row => row.publicLabel || DIRECT_METHOD_LABEL[row.method]);
}

export const tripOperationsRouter = router({
  availableDrivers: publicProcedure.query(async () => {
    const db = await database();
    const rows = await db
      .select({
        id: drivers.id,
        firstName: drivers.firstName,
        lastName: drivers.lastName,
        profileImage: drivers.profileImage,
        averageRating: drivers.averageRating,
        currentLocation: drivers.currentLocation,
        presenceStatus: driverPresenceSnapshots.status,
        lastSeenAt: driverPresenceSnapshots.lastSeenAt,
      })
      .from(drivers)
      .leftJoin(driverPresenceSnapshots, eq(driverPresenceSnapshots.driverId, drivers.id))
      .where(and(eq(drivers.identityVerificationStatus, "approved"), eq(drivers.status, "active"), eq(drivers.isOnline, true), isNotNull(drivers.profileImage)));
    return Promise.all(rows.map(async row => ({
      ...row,
      paymentMethods: await paymentLabels(db, row.id),
    })));
  }),

  dispatcherQueue: protectedProcedure.query(async ({ ctx }) => {
    requireDispatcher(ctx.user.role);
    const db = await database();
    const queue = await db.select().from(trips).where(inArray(trips.status, [...openTripStatuses]));
    return Promise.all(queue.map(async trip => {
      const [latestOffer] = await db.select().from(tripDriverOffers).where(eq(tripDriverOffers.tripId, trip.id)).orderBy(desc(tripDriverOffers.createdAt)).limit(1);
      const selectedDriver = trip.selectedDriverId
        ? (await db.select().from(drivers).where(eq(drivers.id, trip.selectedDriverId)).limit(1))[0] ?? null
        : null;
      return {
        trip,
        latestOffer,
        selectedDriver: selectedDriver ? {
          id: selectedDriver.id,
          name: [selectedDriver.firstName, selectedDriver.lastName].filter(Boolean).join(" "),
          profileImage: selectedDriver.identityVerificationStatus === "approved" ? selectedDriver.profileImage : null,
          paymentMethods: await paymentLabels(db, selectedDriver.id),
        } : null,
      };
    }));
  }),

  createManualOffer: protectedProcedure
    .input(z.object({ tripId: z.number().int().positive(), driverId: z.number().int().positive(), responseTimeoutSeconds: z.number().int().min(5).max(300).default(30) }))
    .mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "client");
      const { db, profile } = await requireClientProfile(ctx.user.id);
      const [trip] = await db.select().from(trips).where(and(eq(trips.id, input.tripId), eq(trips.clientId, profile.id))).limit(1);
      if (!trip) throw new TRPCError({ code: "NOT_FOUND", message: "Viaje no encontrado." });
      const [driver] = await db.select().from(drivers).where(eq(drivers.id, input.driverId)).limit(1);
      if (!driver || driver.identityVerificationStatus !== "approved" || driver.status !== "active" || !driver.isOnline) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "El conductor seleccionado no está disponible o no está verificado." });
      }
      const now = new Date();
      const expiresAt = new Date(now.getTime() + input.responseTimeoutSeconds * 1000);
      await db.update(trips).set({ status: "awaiting_driver", assignmentMode: "manual", selectedDriverId: driver.id, responseDeadlineAt: expiresAt, driverId: null }).where(eq(trips.id, trip.id));
      await db.insert(tripDriverOffers).values({ tripId: trip.id, driverId: driver.id, offeredByUserId: ctx.user.id, offeredByRole: "client", mode: "manual", status: "pending", expiresAt });
      await appendEvent(db, trip.id, "client", "driver_selected", ctx.user.id, { driverId: driver.id, expiresAt: expiresAt.toISOString(), mode: "manual" });
      await appendEvent(db, trip.id, "client", "notification_requested", ctx.user.id, { channel: "trips", recipientDriverId: driver.id, reason: "manual_offer" });
      return { tripId: trip.id, driverId: driver.id, expiresAt };
    }),

  respondToOffer: protectedProcedure
    .input(z.object({ offerId: z.number().int().positive(), decision: z.enum(["accepted", "declined"]), declineReason: z.string().trim().max(400).optional() }))
    .mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "driver");
      const { db, profile } = await requireDriverProfile(ctx.user.id);
      if (profile.identityVerificationStatus !== "approved") throw new TRPCError({ code: "FORBIDDEN", message: "La identidad del conductor debe estar aprobada." });
      const [offer] = await db.select().from(tripDriverOffers).where(and(eq(tripDriverOffers.id, input.offerId), eq(tripDriverOffers.driverId, profile.id), eq(tripDriverOffers.status, "pending"))).limit(1);
      if (!offer) throw new TRPCError({ code: "NOT_FOUND", message: "Oferta pendiente no encontrada." });
      const now = new Date();
      if (offer.expiresAt && offer.expiresAt < now) {
        await db.update(tripDriverOffers).set({ status: "expired", respondedAt: now }).where(eq(tripDriverOffers.id, offer.id));
        await db.update(trips).set({ status: "expired" }).where(eq(trips.id, offer.tripId));
        await appendEvent(db, offer.tripId, "system", "offer_expired", null, { offerId: offer.id });
        throw new TRPCError({ code: "BAD_REQUEST", message: "La oferta ya venció." });
      }
      await db.update(tripDriverOffers).set({ status: input.decision, respondedAt: now, declineReason: input.declineReason || null }).where(eq(tripDriverOffers.id, offer.id));
      if (input.decision === "accepted") {
        await db.update(trips).set({ status: "accepted", driverId: profile.id, selectedDriverId: profile.id, acceptedAt: now, responseDeadlineAt: null }).where(eq(trips.id, offer.tripId));
        await appendEvent(db, offer.tripId, "driver", "offer_accepted", ctx.user.id, { offerId: offer.id, driverId: profile.id });
      } else {
        await db.update(trips).set({ status: "driver_declined", responseDeadlineAt: null }).where(eq(trips.id, offer.tripId));
        await appendEvent(db, offer.tripId, "driver", "offer_declined", ctx.user.id, { offerId: offer.id, reason: input.declineReason || null });
      }
      return { tripId: offer.tripId, status: input.decision };
    }),

  dispatcherAutosearch: protectedProcedure
    .input(z.object({ tripId: z.number().int().positive(), responseTimeoutSeconds: z.number().int().min(5).max(300).default(30) }))
    .mutation(async ({ ctx, input }) => {
      requireDispatcher(ctx.user.role);
      const db = await database();
      const [trip] = await db.select().from(trips).where(eq(trips.id, input.tripId)).limit(1);
      if (!trip || (trip.status !== "driver_declined" && trip.status !== "expired")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Autobúsqueda solo se permite tras rechazo o vencimiento de la oferta anterior." });
      }
      const candidates = await db.select().from(drivers).where(and(eq(drivers.identityVerificationStatus, "approved"), eq(drivers.status, "active"), eq(drivers.isOnline, true), ne(drivers.id, trip.selectedDriverId ?? -1)));
      const driver = candidates[0];
      if (!driver) throw new TRPCError({ code: "NOT_FOUND", message: "No hay conductores verificados disponibles para Autobúsqueda." });
      const now = new Date();
      const expiresAt = new Date(now.getTime() + input.responseTimeoutSeconds * 1000);
      await db.update(trips).set({ status: "awaiting_driver", assignmentMode: "autosearch", selectedDriverId: driver.id, autoSearchStartedAt: now, responseDeadlineAt: expiresAt, driverId: null }).where(eq(trips.id, trip.id));
      await db.insert(tripDriverOffers).values({ tripId: trip.id, driverId: driver.id, offeredByUserId: ctx.user.id, offeredByRole: "dispatcher", mode: "autosearch", status: "pending", expiresAt });
      await appendEvent(db, trip.id, ctx.user.role === "admin" ? "admin" : "dispatcher", "autosearch_started", ctx.user.id, { driverId: driver.id, expiresAt: expiresAt.toISOString() });
      await appendEvent(db, trip.id, ctx.user.role === "admin" ? "admin" : "dispatcher", "notification_requested", ctx.user.id, { channel: "trips", recipientDriverId: driver.id, reason: "autosearch_offer" });
      return { tripId: trip.id, driverId: driver.id, expiresAt };
    }),

  updateDriverPresence: protectedProcedure
    .input(z.object({ status: z.enum(["online", "away", "on_trip", "offline"]), latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional(), activeTripId: z.number().int().positive().optional() }))
    .mutation(async ({ ctx, input }) => {
      requireRole(ctx.user.role, "driver");
      const { db, profile } = await requireDriverProfile(ctx.user.id);
      if (profile.identityVerificationStatus !== "approved" && input.status !== "offline") throw new TRPCError({ code: "FORBIDDEN", message: "La identidad debe estar aprobada antes de publicar presencia." });
      const now = new Date();
      await db.insert(driverPresenceSnapshots).values({ driverId: profile.id, status: input.status, latitude: input.latitude?.toFixed(7) ?? null, longitude: input.longitude?.toFixed(7) ?? null, activeTripId: input.activeTripId ?? null, lastSeenAt: now }).onDuplicateKeyUpdate({ set: { status: input.status, latitude: input.latitude?.toFixed(7) ?? null, longitude: input.longitude?.toFixed(7) ?? null, activeTripId: input.activeTripId ?? null, lastSeenAt: now } });
      await db.update(drivers).set({ isOnline: input.status !== "offline", currentLocation: input.latitude != null && input.longitude != null ? { lat: input.latitude, lng: input.longitude } : profile.currentLocation }).where(eq(drivers.id, profile.id));
      return { updatedAt: now };
    }),

  addDispatcherNote: protectedProcedure
    .input(z.object({ tripId: z.number().int().positive(), body: z.string().trim().min(1).max(1_000) }))
    .mutation(async ({ ctx, input }) => {
      requireDispatcher(ctx.user.role);
      const db = await database();
      await appendEvent(db, input.tripId, ctx.user.role === "admin" ? "admin" : "dispatcher", "dispatcher_note", ctx.user.id, { body: input.body });
      return { ok: true };
    }),

  tripAudit: protectedProcedure
    .input(z.object({ tripId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      requireDispatcher(ctx.user.role);
      const db = await database();
      return db.select().from(tripOperationEvents).where(eq(tripOperationEvents.tripId, input.tripId)).orderBy(desc(tripOperationEvents.createdAt));
    }),
});
