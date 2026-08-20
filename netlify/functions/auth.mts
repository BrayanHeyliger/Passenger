import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

type Role = "client" | "driver" | "fleet" | "admin" | "dispatcher";
type StoredUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  passwordHash?: string;
  passwordSalt?: string;
  password?: string;
};

const USERS_KEY = "users";
const STORE_NAME = "saytaxi-auth";

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function publicUser(user: StoredUser) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone };
}

function toBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), char => char.charCodeAt(0));
}

async function hashPassword(password: string, salt = toBase64(crypto.getRandomValues(new Uint8Array(16)))) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: fromBase64(salt), iterations: 210000, hash: "SHA-256" }, material, 256);
  return { salt, hash: toBase64(new Uint8Array(bits)) };
}

async function matchesPassword(user: StoredUser, password: string) {
  if (user.passwordHash && user.passwordSalt) {
    const candidate = await hashPassword(password, user.passwordSalt);
    return candidate.hash === user.passwordHash;
  }
  return Boolean(user.password && user.password === password);
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return json({ error: "Método no permitido" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Solicitud inválida" }, 400);
  }

  const action = body.action;
  const store = getStore({ name: STORE_NAME });
  const users = (await store.get<StoredUser[]>(USERS_KEY, { type: "json" })) || [];

  if (action === "login") {
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) return json({ error: "Email y contraseña son obligatorios" }, 400);
    const user = users.find(candidate => candidate.email.toLowerCase() === email);
    if (!user || !(await matchesPassword(user, password))) return json({ error: "Credenciales incorrectas" }, 401);
    return json({ user: publicUser(user) });
  }

  if (action === "register") {
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = body.role as Role;
    const allowedRoles: Role[] = ["client", "driver", "fleet"];
    if (!firstName || !email || password.length < 8 || !allowedRoles.includes(role)) return json({ error: "Completa los datos requeridos con una contraseña de al menos 8 caracteres" }, 400);
    if (users.some(candidate => candidate.email.toLowerCase() === email)) return json({ error: "Ya existe una cuenta con este email" }, 409);
    const { hash, salt } = await hashPassword(password);
    const user: StoredUser = { id: Date.now(), name: [firstName, lastName].filter(Boolean).join(" "), email, role, phone: String(body.phone || "").trim() || undefined, passwordHash: hash, passwordSalt: salt };
    await store.set(USERS_KEY, JSON.stringify([...users, user]));
    return json({ user: publicUser(user) }, 201);
  }

  return json({ error: "Acción no compatible" }, 400);
};

export const config: Config = { path: "/api/auth" };
