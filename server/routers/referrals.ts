/**
 * referrals.ts — tRPC router for referral system (clients + drivers)
 * and dispatcher management
 */
import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";

// ── Helpers ────────────────────────────────────────────────────────────────────

async function query(sql: string, params: any[] = []) {
  const db = await getDb();
  if (!db) throw new Error("Base de datos no disponible");
  const result = await (db as any).$client.query(sql, params);
  return Array.isArray(result[0]) ? result[0] : (result as any[]);
}

function generateCode(name: string): string {
  const base = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
}

// ── Referral Router ────────────────────────────────────────────────────────────

export const referralsRouter = router({

  /** Get or create referral code for a user */
  getMyCode: publicProcedure
    .input(z.object({ userId: z.number(), userRole: z.enum(["client", "driver"]), name: z.string() }))
    .query(async ({ input }) => {
      const rows = await query(`SELECT * FROM referralCodes WHERE userId = ? AND userRole = ? LIMIT 1`, [input.userId, input.userRole]);
      if (rows.length > 0) return rows[0];

      // Create new code
      const code = generateCode(input.name);
      await query(`INSERT INTO referralCodes (userId, userRole, code) VALUES (?, ?, ?)`, [input.userId, input.userRole, code]);
      const createdRows = await query(`SELECT * FROM referralCodes WHERE userId = ? AND userRole = ? LIMIT 1`, [input.userId, input.userRole]);
      return createdRows[0];
    }),

  /** Get referral credits/wallet for a user */
  getMyCredits: publicProcedure
    .input(z.object({ userId: z.number(), userRole: z.enum(["client", "driver"]) }))
    .query(async ({ input }) => {
      const rows = await query(`SELECT * FROM referralCredits WHERE userId = ? AND userRole = ? LIMIT 1`, [input.userId, input.userRole]);
      if (rows.length > 0) {
        const row = rows[0];
        return {
          ...row,
          discountCoupons: row.discountCoupons ? JSON.parse(row.discountCoupons) : [],
          badges: row.badges ? JSON.parse(row.badges) : [],
        };
      }
      // Initialize credits record
      await query(`INSERT INTO referralCredits (userId, userRole, balance, totalEarned, totalUsed, freeTripsCoupon, discountCoupons, badges) VALUES (?, ?, 0, 0, 0, 0, '[]', '[]')`, [input.userId, input.userRole]);
      return { balance: 0, totalEarned: 0, totalUsed: 0, freeTripsCoupon: 0, discountCoupons: [], badges: [] };
    }),

  /** Get referral history for a user */
  getMyHistory: publicProcedure
    .input(z.object({ userId: z.number(), userRole: z.enum(["client", "driver"]) }))
    .query(async ({ input }) => {
      return await query(`SELECT * FROM referralHistory WHERE referrerId = ? AND referrerRole = ? ORDER BY createdAt DESC LIMIT 50`, [input.userId, input.userRole]);
    }),

  /** Get all rewards config (for display in panels) */
  getRewards: publicProcedure
    .input(z.object({ userRole: z.enum(["client", "driver"]) }))
    .query(async ({ input }) => {
      return await query(`SELECT * FROM referralRewards WHERE userRole = ? AND isActive = 1 ORDER BY sortOrder ASC`, [input.userRole]);
    }),

  /** Apply a referral code during registration */
  applyCode: publicProcedure
    .input(z.object({ code: z.string(), newUserId: z.number(), newUserRole: z.enum(["client", "driver"]) }))
    .mutation(async ({ input }) => {
      const codeRows = await query(`SELECT * FROM referralCodes WHERE code = ? LIMIT 1`, [input.code.toUpperCase()]);
      if (codeRows.length === 0) return { success: false, message: "Código no válido" };

      const referrer = codeRows[0];
      if (referrer.userId === input.newUserId) return { success: false, message: "No puedes usar tu propio código" };

      // Record the referral
      await query(`INSERT INTO referralHistory (referrerId, referrerRole, referredUserId, referralCode, status, eventType) VALUES (?, ?, ?, ?, 'pending', 'referral_registered')`, [referrer.userId, referrer.userRole, input.newUserId, input.code.toUpperCase()]);
      await query(`UPDATE referralCodes SET totalReferrals = totalReferrals + 1 WHERE id = ?`, [referrer.id]);
      const rewardRows = await query(`SELECT * FROM referralRewards WHERE userRole = ? AND eventType = 'referral_registered' AND isActive = 1 LIMIT 1`, [referrer.userRole]);

      if (rewardRows.length > 0) {
        const reward = rewardRows[0];
        // Add credit to referrer
        const creditVal = reward.rewardType === 'credit' ? Number(reward.rewardValue) : 0;
        await query(`INSERT INTO referralCredits (userId, userRole, balance, totalEarned, totalUsed, freeTripsCoupon, discountCoupons, badges) VALUES (?, ?, ?, ?, 0, 0, '[]', '[]') ON DUPLICATE KEY UPDATE balance = balance + ?, totalEarned = totalEarned + ?`, [referrer.userId, referrer.userRole, creditVal, creditVal, creditVal, creditVal]);
        await query(`UPDATE referralHistory SET rewardId = ?, rewardEarned = ?, rewardType = ?, rewardLabel = ?, status = 'completed', completedAt = NOW() WHERE referrerId = ? AND referredUserId = ? AND eventType = 'referral_registered'`, [reward.id, reward.rewardValue, reward.rewardType, reward.rewardLabel, referrer.userId, input.newUserId]);
        await query(`UPDATE referralCodes SET totalRewardsEarned = totalRewardsEarned + ? WHERE id = ?`, [reward.rewardValue, referrer.id]);
      }

      return { success: true, message: "¡Código aplicado! Tu amigo recibirá una recompensa." };
    }),

  // ── ADMIN: Rewards management ───────────────────────────────────────────────

  getAllRewardsAdmin: publicProcedure.query(async () => {
    return await query(`SELECT * FROM referralRewards ORDER BY userRole, sortOrder ASC`);
  }),

  saveReward: publicProcedure
    .input(z.object({
      id: z.number().optional(),
      userRole: z.enum(["client", "driver"]),
      eventType: z.string(),
      eventLabel: z.string(),
      rewardType: z.enum(["credit", "free_trip", "discount", "badge", "cash_bonus"]),
      rewardValue: z.number(),
      rewardLabel: z.string(),
      rewardDescription: z.string().optional(),
      triggerCount: z.number().default(1),
      isActive: z.boolean().default(true),
      sortOrder: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      if (input.id) {
        await query(`UPDATE referralRewards SET userRole=?, eventType=?, eventLabel=?, rewardType=?, rewardValue=?, rewardLabel=?, rewardDescription=?, triggerCount=?, isActive=?, sortOrder=? WHERE id=?`, [input.userRole, input.eventType, input.eventLabel, input.rewardType, input.rewardValue, input.rewardLabel, input.rewardDescription || "", input.triggerCount, input.isActive, input.sortOrder, input.id]);
      } else {
        await query(`INSERT INTO referralRewards (userRole, eventType, eventLabel, rewardType, rewardValue, rewardLabel, rewardDescription, triggerCount, isActive, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [input.userRole, input.eventType, input.eventLabel, input.rewardType, input.rewardValue, input.rewardLabel, input.rewardDescription || "", input.triggerCount, input.isActive, input.sortOrder]);
      }
      return { success: true };
    }),

  deleteReward: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await query(`DELETE FROM referralRewards WHERE id = ?`, [input.id]);
      return { success: true };
    }),

  // ── ADMIN: Dispatcher management ────────────────────────────────────────────

  getDispatchers: publicProcedure.query(async () => {
    const rows = await query(`SELECT * FROM dispatchers ORDER BY createdAt DESC`);
    return rows.map((r: any) => ({ ...r, permissions: r.permissions ? JSON.parse(r.permissions) : {} }));
  }),

  saveDispatcher: publicProcedure
    .input(z.object({
      id: z.number().optional(),
      userId: z.number().optional(),
      name: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      status: z.enum(["active", "inactive", "suspended"]).default("active"),
      permissions: z.object({
        viewMap: z.boolean().default(true),
        assignTrips: z.boolean().default(true),
        viewDrivers: z.boolean().default(true),
        contactUsers: z.boolean().default(true),
        viewTripHistory: z.boolean().default(true),
        cancelTrips: z.boolean().default(false),
        viewFinancials: z.boolean().default(false),
        editPrices: z.boolean().default(false),
        editSite: z.boolean().default(false),
      }),
      assignedZone: z.string().optional(),
      createdBy: z.number().default(1),
    }))
    .mutation(async ({ input }) => {
      const permsJson = JSON.stringify(input.permissions);
      if (input.id) {
        await query(`UPDATE dispatchers SET name=?, email=?, phone=?, status=?, permissions=?, assignedZone=? WHERE id=?`, [input.name, input.email, input.phone || "", input.status, permsJson, input.assignedZone || "", input.id]);
      } else {
        // Create user account for dispatcher
        const userId = input.userId || Math.floor(Math.random() * 90000) + 10000;
        await query(`INSERT INTO dispatchers (userId, name, email, phone, status, permissions, assignedZone, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [userId, input.name, input.email, input.phone || "", input.status, permsJson, input.assignedZone || "", input.createdBy]);
      }
      return { success: true };
    }),

  deleteDispatcher: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await query(`DELETE FROM dispatchers WHERE id = ?`, [input.id]);
      return { success: true };
    }),

  getDispatcherByUserId: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const rows = await query(`SELECT * FROM dispatchers WHERE userId = ? AND status = 'active' LIMIT 1`, [input.userId]);
      if (rows.length === 0) return null;
      const r = rows[0];
      return { ...r, permissions: r.permissions ? JSON.parse(r.permissions) : {} };
    }),

  logDispatcherAction: publicProcedure
    .input(z.object({
      dispatcherId: z.number(),
      action: z.string(),
      details: z.any().optional(),
      tripId: z.number().optional(),
      driverId: z.number().optional(),
      clientId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      await query(`INSERT INTO dispatcherLogs (dispatcherId, action, details, tripId, driverId, clientId) VALUES (?, ?, ?, ?, ?, ?)`, [input.dispatcherId, input.action, JSON.stringify(input.details || {}), input.tripId || null, input.driverId || null, input.clientId || null]);
      return { success: true };
    }),

  // Admin: get all referral history
  getAllReferralHistory: publicProcedure.query(async () => {
    return await query(`SELECT rh.*, rc.code FROM referralHistory rh LEFT JOIN referralCodes rc ON rh.referralCode = rc.code ORDER BY rh.createdAt DESC LIMIT 100`);
  }),
});
