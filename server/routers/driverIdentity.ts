import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { driverIdentitySubmissions, drivers } from "../../drizzle/schema";
import { getDb } from "../db";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { storageGetSignedUrl, storagePut } from "../storage";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const CONSENT_VERSION = "2026-08-22";
const reviewStatuses = ["approved", "resubmission_required", "rejected"] as const;

const imageInput = z.object({
  filename: z.string().min(1).max(120),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  base64: z.string().min(16),
});

function decodeImage(input: z.infer<typeof imageInput>) {
  const normalized = input.base64.replace(/^data:[^;]+;base64,/, "");
  const bytes = Buffer.from(normalized, "base64");
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cada imagen debe tener un tamaño máximo de 5 MB.",
    });
  }
  return bytes;
}

function extensionFor(mimeType: z.infer<typeof imageInput>["mimeType"]) {
  return mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
}

async function requireDriver(userId: number) {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Base de datos no disponible." });
  const [driver] = await db.select().from(drivers).where(eq(drivers.userId, userId)).limit(1);
  if (!driver) throw new TRPCError({ code: "NOT_FOUND", message: "No existe un perfil de conductor para esta sesión." });
  return { db, driver };
}

export const driverIdentityRouter = router({
  approvedProfiles: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Base de datos no disponible." });
    return db
      .select({
        id: drivers.id,
        firstName: drivers.firstName,
        lastName: drivers.lastName,
        profileImage: drivers.profileImage,
        averageRating: drivers.averageRating,
        currentLocation: drivers.currentLocation,
      })
      .from(drivers)
      .where(and(eq(drivers.identityVerificationStatus, "approved"), eq(drivers.status, "active"), eq(drivers.isOnline, true), isNotNull(drivers.profileImage)));
  }),

  getMine: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "driver") throw new TRPCError({ code: "FORBIDDEN", message: "Solo los conductores pueden consultar esta verificación." });
    const { db, driver } = await requireDriver(ctx.user.id);
    const [latest] = await db
      .select()
      .from(driverIdentitySubmissions)
      .where(eq(driverIdentitySubmissions.driverId, driver.id))
      .orderBy(desc(driverIdentitySubmissions.submittedAt))
      .limit(1);

    return {
      status: driver.identityVerificationStatus,
      submittedAt: driver.identitySubmittedAt,
      reviewedAt: driver.identityReviewedAt,
      reviewNote: driver.identityReviewNote,
      resubmissionCount: driver.identityResubmissionCount,
      profileImage: driver.identityVerificationStatus === "approved" ? driver.profileImage : null,
      latestSubmissionId: latest?.id ?? null,
    };
  }),

  submit: protectedProcedure
    .input(z.object({
      profilePhoto: imageInput,
      selfie: imageInput,
      licenseFront: imageInput,
      consent: z.literal(true),
      consentVersion: z.literal(CONSENT_VERSION),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "driver") throw new TRPCError({ code: "FORBIDDEN", message: "Solo el conductor puede enviar sus evidencias." });
      const { db, driver } = await requireDriver(ctx.user.id);
      const prefix = `private/driver-identity/${driver.id}/${Date.now()}`;
      const [profilePhoto, selfie, licenseFront] = await Promise.all([
        storagePut(`${prefix}/profile.${extensionFor(input.profilePhoto.mimeType)}`, decodeImage(input.profilePhoto), input.profilePhoto.mimeType),
        storagePut(`${prefix}/selfie.${extensionFor(input.selfie.mimeType)}`, decodeImage(input.selfie), input.selfie.mimeType),
        storagePut(`${prefix}/license-front.${extensionFor(input.licenseFront.mimeType)}`, decodeImage(input.licenseFront), input.licenseFront.mimeType),
      ]);
      const now = new Date();
      await db.insert(driverIdentitySubmissions).values({
        driverId: driver.id,
        profilePhotoKey: profilePhoto.key,
        selfieKey: selfie.key,
        licenseFrontKey: licenseFront.key,
        status: "pending_review",
        consentAt: now,
        consentVersion: input.consentVersion,
      });
      await db.update(drivers).set({
        identityVerificationStatus: "pending_review",
        identitySubmittedAt: now,
        identityReviewedAt: null,
        identityReviewedBy: null,
        identityReviewNote: null,
        identityConsentAt: now,
        identityConsentVersion: input.consentVersion,
        identityResubmissionCount: driver.identityResubmissionCount + 1,
        isOnline: false,
      }).where(eq(drivers.id, driver.id));

      return { status: "pending_review" as const };
    }),

  pendingForReview: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Base de datos no disponible." });
    return db
      .select({
        submissionId: driverIdentitySubmissions.id,
        driverId: drivers.id,
        driverName: drivers.firstName,
        driverLastName: drivers.lastName,
        driverEmail: drivers.email,
        submittedAt: driverIdentitySubmissions.submittedAt,
        resubmissionCount: drivers.identityResubmissionCount,
      })
      .from(driverIdentitySubmissions)
      .innerJoin(drivers, eq(driverIdentitySubmissions.driverId, drivers.id))
      .where(eq(driverIdentitySubmissions.status, "pending_review"))
      .orderBy(desc(driverIdentitySubmissions.submittedAt));
  }),

  evidenceForReview: adminProcedure
    .input(z.object({ submissionId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Base de datos no disponible." });
      const [submission] = await db.select().from(driverIdentitySubmissions).where(eq(driverIdentitySubmissions.id, input.submissionId)).limit(1);
      if (!submission) throw new TRPCError({ code: "NOT_FOUND", message: "Envío de identidad no encontrado." });
      const [profilePhotoUrl, selfieUrl, licenseFrontUrl] = await Promise.all([
        storageGetSignedUrl(submission.profilePhotoKey),
        storageGetSignedUrl(submission.selfieKey),
        storageGetSignedUrl(submission.licenseFrontKey),
      ]);
      return { profilePhotoUrl, selfieUrl, licenseFrontUrl, consentAt: submission.consentAt, consentVersion: submission.consentVersion };
    }),

  review: adminProcedure
    .input(z.object({
      submissionId: z.number().int().positive(),
      decision: z.enum(reviewStatuses),
      reviewNote: z.string().trim().max(1_000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Base de datos no disponible." });
      const [submission] = await db.select().from(driverIdentitySubmissions).where(eq(driverIdentitySubmissions.id, input.submissionId)).limit(1);
      if (!submission) throw new TRPCError({ code: "NOT_FOUND", message: "Envío de identidad no encontrado." });
      const now = new Date();
      await db.update(driverIdentitySubmissions).set({
        status: input.decision,
        reviewedAt: now,
        reviewedBy: ctx.user.id,
        reviewNote: input.reviewNote || null,
      }).where(eq(driverIdentitySubmissions.id, submission.id));
      await db.update(drivers).set({
        identityVerificationStatus: input.decision,
        identityReviewedAt: now,
        identityReviewedBy: ctx.user.id,
        identityReviewNote: input.reviewNote || null,
        profileImage: input.decision === "approved" ? `/manus-storage/${submission.profilePhotoKey}` : null,
        isOnline: input.decision === "approved" ? undefined : false,
      }).where(and(eq(drivers.id, submission.driverId)));
      return { status: input.decision };
    }),
});
