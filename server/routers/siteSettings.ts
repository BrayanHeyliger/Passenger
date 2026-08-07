import { z } from "zod";
import { eq } from "drizzle-orm";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { siteSettings } from "../../drizzle/schema";

const SITE_CONFIG_KEY = "site_config";

export const siteSettingsRouter = router({
  // Get site config — public so the landing page can load it without auth
  getConfig: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return null;
      const rows = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, SITE_CONFIG_KEY))
        .limit(1);
      if (rows.length === 0) return null;
      return JSON.parse(rows[0].value);
    } catch (err) {
      console.error("[siteSettings] getConfig error:", err);
      return null;
    }
  }),

  // Save site config — public procedure (admin auth handled client-side via LocalAuth)
  saveConfig: publicProcedure
    .input(z.object({ config: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        // Validate it's valid JSON
        JSON.parse(input.config);
        await db
          .insert(siteSettings)
          .values({ key: SITE_CONFIG_KEY, value: input.config })
          .onDuplicateKeyUpdate({ set: { value: input.config } });
        return { success: true };
      } catch (err) {
        console.error("[siteSettings] saveConfig error:", err);
        throw err;
      }
    }),
});
