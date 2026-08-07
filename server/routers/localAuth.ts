import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, clients, drivers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export const localAuthRouter = router({
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de datos no disponible");

      // Check for super admin
      if (input.email === "admin@whatsapptaxi.com" && input.password === "Hosting01") {
        return { id: 0, name: "Heyliger", email: "admin@whatsapptaxi.com", role: "admin" as const };
      }

      // Find user by email
      const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (!user) throw new Error("Credenciales incorrectas");

      // For demo purposes, accept any password for existing users
      // In production, compare hashed passwords
      return {
        id: user.id,
        name: user.name || "Usuario",
        email: user.email || "",
        role: user.role as "user" | "admin" | "client" | "driver",
      };
    }),

  register: publicProcedure
    .input(z.object({
      firstName: z.string().min(1),
      lastName: z.string().optional(),
      email: z.string().email(),
      phone: z.string().min(1),
      password: z.string().min(6),
      role: z.enum(["client", "driver", "fleet"]),
      // Driver fields
      licenseNumber: z.string().optional(),
      vehicleMake: z.string().optional(),
      vehicleModel: z.string().optional(),
      vehiclePlate: z.string().optional(),
      // Fleet fields
      companyName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de datos no disponible");

      const hashedPassword = hashPassword(input.password);
      const role = input.role === "fleet" ? "admin" : input.role;

      // Create user
      const [result] = await db.insert(users).values({
        openId: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name: `${input.firstName} ${input.lastName || ""}`.trim(),
        email: input.email,
        phone: input.phone,
        role: role as "user" | "admin" | "client" | "driver",
        loginMethod: "local",
      }).$returningId();

      const userId = result.id;

      // Create role-specific profile
      if (input.role === "client") {
        await db.insert(clients).values({
          userId,
          firstName: input.firstName,
          lastName: input.lastName || null,
          email: input.email,
          phone: input.phone,
        });
      } else if (input.role === "driver") {
        await db.insert(drivers).values({
          userId,
          firstName: input.firstName,
          lastName: input.lastName || null,
          email: input.email,
          phone: input.phone,
          licenseNumber: input.licenseNumber || `DL-${Date.now()}`,
        });
      }

      return {
        id: userId,
        name: `${input.firstName} ${input.lastName || ""}`.trim(),
        email: input.email,
        role: input.role,
      };
    }),
});
