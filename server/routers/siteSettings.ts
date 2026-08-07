import { z } from "zod";
import { eq } from "drizzle-orm";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { siteSettings } from "../../drizzle/schema";
import nodemailer from "nodemailer";

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

  // Send contact form email
  sendContactEmail: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      company: z.string().optional(),
      message: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      try {
        // Get config from DB to find notification email and SMTP settings
        const db = await getDb();
        let notificationEmail = "admin@whatsapptaxi.com";
        let smtpConfig: any = null;

        if (db) {
          const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, "site_config")).limit(1);
          if (rows.length > 0) {
            const cfg = JSON.parse(rows[0].value);
            if (cfg.notificationEmail) notificationEmail = cfg.notificationEmail;
            if (cfg.smtpHost && cfg.smtpUser && cfg.smtpPass) {
              smtpConfig = { host: cfg.smtpHost, port: parseInt(cfg.smtpPort || "587"), auth: { user: cfg.smtpUser, pass: cfg.smtpPass }, from: cfg.smtpFrom || cfg.smtpUser };
            }
          }
        }

        const subject = `[WhatsApp Taxi] Nuevo mensaje de ${input.name}${input.company ? ` (${input.company})` : ""}`;
        const html = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:12px;">
            <div style="background:#25D366;padding:16px 20px;border-radius:8px 8px 0 0;">
              <h2 style="color:white;margin:0;font-size:18px;">🚕 Nuevo mensaje de contacto</h2>
            </div>
            <div style="background:white;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:120px;">Nombre:</td><td style="padding:8px 0;font-weight:600;color:#111827;">${input.name}</td></tr>
                <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Email:</td><td style="padding:8px 0;color:#2563eb;">${input.email}</td></tr>
                ${input.company ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Empresa:</td><td style="padding:8px 0;color:#111827;">${input.company}</td></tr>` : ""}
              </table>
              <div style="margin-top:16px;padding:16px;background:#f3f4f6;border-radius:8px;border-left:4px solid #25D366;">
                <p style="color:#6b7280;font-size:12px;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.05em;">Mensaje:</p>
                <p style="color:#111827;font-size:15px;line-height:1.6;margin:0;">${input.message.replace(/\n/g, "<br>")}</p>
              </div>
              <p style="color:#9ca3af;font-size:12px;margin-top:20px;text-align:center;">Enviado desde el formulario de contacto de WhatsApp Taxi SaaS</p>
            </div>
          </div>`;

        if (smtpConfig) {
          const transporter = nodemailer.createTransport({ host: smtpConfig.host, port: smtpConfig.port, secure: smtpConfig.port === 465, auth: smtpConfig.auth });
          await transporter.sendMail({ from: smtpConfig.from, to: notificationEmail, subject, html });
        } else {
          // Log to console if no SMTP configured (for development)
          console.log(`[Contact Form] New message from ${input.name} <${input.email}> to ${notificationEmail}:\n${input.message}`);
        }

        return { success: true, sentTo: notificationEmail };
      } catch (err) {
        console.error("[siteSettings] sendContactEmail error:", err);
        throw new Error("No se pudo enviar el mensaje. Por favor intenta de nuevo.");
      }
    }),
});
