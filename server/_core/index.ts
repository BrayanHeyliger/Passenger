import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

type DemoAuthUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "client" | "driver" | "fleet" | "admin" | "dispatcher";
  phone?: string;
};

const demoAuthUsers = new Map<string, DemoAuthUser>([
  [
    "demo@safetaxi.app",
    {
      id: 1001,
      name: "Demo Client",
      email: "demo@safetaxi.app",
      password: "demo123456",
      role: "client",
      phone: "+1 (407) 555-0100",
    },
  ],
  [
    "driver@unpasajero.com",
    {
      id: 1002,
      name: "Demo Driver",
      email: "driver@unpasajero.com",
      password: "demo123456",
      role: "driver",
      phone: "+1 (407) 555-0101",
    },
  ],
]);

function publicDemoUser(user: DemoAuthUser) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ── Socket.io — Real-time chat & trip events ────────────────────────────────
  const io = new SocketIOServer(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    path: "/socket.io",
  });

  // In-memory store: roomId → messages[]
  const chatRooms = new Map<
    string,
    {
      id: string;
      sender: string;
      senderRole: string;
      text: string;
      time: string;
    }[]
  >();

  io.on("connection", socket => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join a trip chat room
    socket.on(
      "join_room",
      ({
        roomId,
        userId,
        role,
      }: {
        roomId: string;
        userId: string;
        role: string;
      }) => {
        socket.join(roomId);
        socket.data.userId = userId;
        socket.data.role = role;
        socket.data.roomId = roomId;
        // Send message history to the new joiner
        const history = chatRooms.get(roomId) || [];
        socket.emit("message_history", history);
        console.log(`[Socket.io] ${role} ${userId} joined room ${roomId}`);
      }
    );

    // Send a chat message
    socket.on(
      "send_message",
      ({
        roomId,
        message,
      }: {
        roomId: string;
        message: {
          id: string;
          sender: string;
          senderRole: string;
          text: string;
          time: string;
        };
      }) => {
        if (!chatRooms.has(roomId)) chatRooms.set(roomId, []);
        const room = chatRooms.get(roomId)!;
        room.push(message);
        // Keep last 100 messages per room
        if (room.length > 100) room.splice(0, room.length - 100);
        // Broadcast to all in room (including sender for confirmation)
        io.to(roomId).emit("new_message", message);
      }
    );

    // Typing indicator
    socket.on(
      "typing",
      ({ roomId, sender }: { roomId: string; sender: string }) => {
        socket.to(roomId).emit("user_typing", { sender });
      }
    );

    // Trip status updates (driver → client)
    socket.on(
      "trip_status",
      ({
        roomId,
        status,
        data,
      }: {
        roomId: string;
        status: string;
        data?: any;
      }) => {
        io.to(roomId).emit("trip_status_update", {
          status,
          data,
          time: new Date().toISOString(),
        });
      }
    );

    // ── WebRTC Voice Call Signaling ────────────────────────────────────────────
    // call_offer: caller sends SDP offer to the other party in the room
    socket.on(
      "call_offer",
      ({
        roomId,
        offer,
        from,
        callerName,
      }: {
        roomId: string;
        offer: RTCSessionDescriptionInit;
        from: string;
        callerName: string;
      }) => {
        socket.to(roomId).emit("call_incoming", { offer, from, callerName });
      }
    );

    // call_answer: callee sends SDP answer back to caller
    socket.on(
      "call_answer",
      ({
        roomId,
        answer,
        from,
      }: {
        roomId: string;
        answer: RTCSessionDescriptionInit;
        from: string;
      }) => {
        socket.to(roomId).emit("call_answered", { answer, from });
      }
    );

    // call_ice: exchange ICE candidates
    socket.on(
      "call_ice",
      ({
        roomId,
        candidate,
        from,
      }: {
        roomId: string;
        candidate: RTCIceCandidateInit;
        from: string;
      }) => {
        socket.to(roomId).emit("call_ice_candidate", { candidate, from });
      }
    );

    // call_end: either party hangs up
    socket.on(
      "call_end",
      ({ roomId, from }: { roomId: string; from: string }) => {
        socket.to(roomId).emit("call_ended", { from });
      }
    );

    // call_reject: callee rejects incoming call
    socket.on(
      "call_reject",
      ({ roomId, from }: { roomId: string; from: string }) => {
        socket.to(roomId).emit("call_rejected", { from });
      }
    );

    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  // Expose io for use in routes if needed
  (app as any).io = io;

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // QA-only local authentication for the public demo. It is intentionally
  // disabled unless the server is started with DEMO_AUTH_ENABLED=true.
  app.post("/api/auth", (req, res) => {
    if (process.env.DEMO_AUTH_ENABLED !== "true") {
      return res
        .status(503)
        .json({ error: "Autenticación de demo no habilitada." });
    }
    const action = req.body?.action;
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son obligatorios." });
    }
    if (action === "login") {
      const user = demoAuthUsers.get(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Credenciales incorrectas." });
      }
      return res.json({ user: publicDemoUser(user) });
    }
    if (action === "register") {
      if (demoAuthUsers.has(email)) {
        return res
          .status(409)
          .json({ error: "Ya existe una cuenta con este email." });
      }
      const role = [
        "client",
        "driver",
        "fleet",
        "admin",
        "dispatcher",
      ].includes(req.body?.role)
        ? req.body.role
        : "client";
      const user: DemoAuthUser = {
        id: Date.now(),
        name:
          [req.body?.firstName, req.body?.lastName].filter(Boolean).join(" ") ||
          "Nuevo usuario",
        email,
        password,
        role,
        phone: req.body?.phone || undefined,
      };
      demoAuthUsers.set(email, user);
      return res.status(201).json({ user: publicDemoUser(user) });
    }
    return res
      .status(400)
      .json({ error: "Acción de autenticación no válida." });
  });
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
