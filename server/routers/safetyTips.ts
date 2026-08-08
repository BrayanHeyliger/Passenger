import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

export const safetyTipsRouter = router({
  // Get tips for a specific audience
  getByAudience: publicProcedure
    .input(z.object({ audience: z.enum(["clients", "drivers", "fleet"]) }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];
        const [rows] = await (db as any).$client.query(
          `SELECT * FROM safetyTips WHERE audience = ? AND active = 1 ORDER BY priority DESC, id ASC`,
          [input.audience]
        );
        return Array.isArray(rows) ? rows : [];
      } catch { return []; }
    }),

  // Get all tips for admin
  getAll: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return [];
      const [rows] = await (db as any).$client.query(
        `SELECT * FROM safetyTips ORDER BY audience, category, priority DESC`
      );
      return Array.isArray(rows) ? rows : [];
    } catch { return []; }
  }),

  // Create tip
  create: publicProcedure
    .input(z.object({
      audience: z.enum(["clients", "drivers", "fleet"]),
      category: z.string().min(1).max(100),
      title: z.string().min(1).max(255),
      tip: z.string().min(1),
      icon: z.string().max(10).default("💡"),
      priority: z.number().default(5),
    }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: false };
        await (db as any).$client.query(
          `INSERT INTO safetyTips (audience, category, title, tip, icon, priority, active, createdAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
          [input.audience, input.category, input.title, input.tip, input.icon, input.priority, Date.now()]
        );
        return { success: true };
      } catch (e) { return { success: false, error: String(e) }; }
    }),

  // Update tip
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      category: z.string().optional(),
      title: z.string().optional(),
      tip: z.string().optional(),
      icon: z.string().optional(),
      priority: z.number().optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: false };
        const { id, ...fields } = input;
        const sets: string[] = [];
        const vals: any[] = [];
        if (fields.category !== undefined) { sets.push("category = ?"); vals.push(fields.category); }
        if (fields.title !== undefined) { sets.push("title = ?"); vals.push(fields.title); }
        if (fields.tip !== undefined) { sets.push("tip = ?"); vals.push(fields.tip); }
        if (fields.icon !== undefined) { sets.push("icon = ?"); vals.push(fields.icon); }
        if (fields.priority !== undefined) { sets.push("priority = ?"); vals.push(fields.priority); }
        if (fields.active !== undefined) { sets.push("active = ?"); vals.push(fields.active ? 1 : 0); }
        if (sets.length === 0) return { success: true };
        vals.push(id);
        await (db as any).$client.query(`UPDATE safetyTips SET ${sets.join(", ")} WHERE id = ?`, vals);
        return { success: true };
      } catch (e) { return { success: false }; }
    }),

  // Delete tip
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: false };
        await (db as any).$client.query(`DELETE FROM safetyTips WHERE id = ?`, [input.id]);
        return { success: true };
      } catch { return { success: false }; }
    }),
});
