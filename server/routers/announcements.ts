import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

async function query(sql: string, params: any[] = []) {
  const db = await getDb();
  if (!db) return [];
  const result = await (db as any).$client.execute({ sql, args: params });
  return result.rows ?? result ?? [];
}

export const announcementsRouter = router({
  // Get active announcements for a specific target (clients/drivers/fleet/all)
  getActive: publicProcedure
    .input(z.object({ target: z.enum(["clients", "drivers", "fleet", "all"]) }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];
        const now = Date.now();
        const [rows] = await (db as any).$client.query(
          `SELECT * FROM announcements 
           WHERE active = 1 
           AND (target = 'all' OR target = ?)
           AND (expiresAt IS NULL OR expiresAt > ?)
           ORDER BY pinned DESC, createdAt DESC
           LIMIT 10`,
          [input.target, now]
        );
        return Array.isArray(rows) ? rows : [];
      } catch (e) {
        return [];
      }
    }),

  // Get all announcements for admin panel
  getAll: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return [];
      const [rows] = await (db as any).$client.query(
        `SELECT * FROM announcements ORDER BY createdAt DESC LIMIT 50`
      );
      return Array.isArray(rows) ? rows : [];
    } catch (e) {
      return [];
    }
  }),

  // Create a new announcement
  create: publicProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      message: z.string().min(1),
      type: z.enum(["info", "warning", "success", "urgent"]),
      target: z.enum(["all", "drivers", "clients", "fleet"]),
      pinned: z.boolean().default(false),
      expiresAt: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: false };
        await (db as any).$client.query(
          `INSERT INTO announcements (title, message, type, target, active, pinned, expiresAt, createdAt, createdBy)
           VALUES (?, ?, ?, ?, 1, ?, ?, ?, 'admin')`,
          [input.title, input.message, input.type, input.target, input.pinned ? 1 : 0, input.expiresAt ?? null, Date.now()]
        );
        return { success: true };
      } catch (e) {
        return { success: false, error: String(e) };
      }
    }),

  // Toggle active status
  toggleActive: publicProcedure
    .input(z.object({ id: z.number(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: false };
        await (db as any).$client.query(
          `UPDATE announcements SET active = ? WHERE id = ?`,
          [input.active ? 1 : 0, input.id]
        );
        return { success: true };
      } catch (e) {
        return { success: false };
      }
    }),

  // Delete announcement
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: false };
        await (db as any).$client.query(
          `DELETE FROM announcements WHERE id = ?`,
          [input.id]
        );
        return { success: true };
      } catch (e) {
        return { success: false };
      }
    }),
});
