import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { db } from "./db";
import { parentLinks } from "@shared/schema";
import { eq, and } from "drizzle-orm";

let io: SocketIOServer | null = null;

const JWT_SECRET_ENV = process.env.SESSION_SECRET;

function getSigningKey(): string {
  if (!JWT_SECRET_ENV) {
    throw new Error("SESSION_SECRET is not set — cannot sign/verify socket tokens");
  }
  return JWT_SECRET_ENV;
}

function extractToken(socket: Socket): string | null {
  const auth = socket.handshake.auth?.token as string | undefined;
  if (auth) return auth;
  const query = socket.handshake.query?.token as string | undefined;
  if (query) return query;
  return null;
}

async function verifySocketUser(token: string): Promise<{ userId: string; role: string } | null> {
  try {
    const decoded = jwt.verify(token, getSigningKey()) as any;
    const userId = decoded?.sub || decoded?.userId;
    const role = decoded?.role || "learner";
    if (!userId) return null;
    return { userId, role };
  } catch {
    return null;
  }
}

async function autoJoinParentLearnerRooms(socket: Socket, parentId: string): Promise<void> {
  try {
    const links = await db
      .select({ learnerUserId: parentLinks.learnerUserId })
      .from(parentLinks)
      .where(and(eq(parentLinks.parentUserId, parentId), eq(parentLinks.status, "activated")));
    for (const link of links) {
      socket.join(`learner:${link.learnerUserId}`);
    }
  } catch {
  }
}

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: false,
    },
    path: "/ws/socket.io",
    transports: ["websocket", "polling"],
  });

  io.use(async (socket, next) => {
    const token = extractToken(socket);
    if (!token) {
      return next(new Error("Authentication required"));
    }
    let user: { userId: string; role: string } | null = null;
    try {
      user = await verifySocketUser(token);
    } catch {
      return next(new Error("Socket auth unavailable"));
    }
    if (!user) {
      return next(new Error("Invalid token"));
    }
    (socket as any).userId = user.userId;
    (socket as any).userRole = user.role;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId as string;
    const userRole = (socket as any).userRole as string;

    socket.join(`user:${userId}`);

    if (userRole === "parent" || userRole === "admin") {
      socket.join(`parent:${userId}`);
      autoJoinParentLearnerRooms(socket, userId);
    }

    socket.on("subscribe_learner", async (learnerId: string) => {
      if (userRole !== "parent" && userRole !== "admin") return;
      try {
        const linked = await storage.isParentOfLearner(userId, learnerId);
        if (linked || userRole === "admin") {
          socket.join(`learner:${learnerId}`);
        }
      } catch {
      }
    });

    socket.on("disconnect", () => {
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function emitToUser(userId: string, event: string, data: unknown): void {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}

export function emitToLearnerParents(learnerId: string, event: string, data: unknown): void {
  if (!io) return;
  io.to(`learner:${learnerId}`).emit(event, data);
}

export function emitScoreUpdated(learnerId: string, payload: {
  subjectName: string;
  accuracy: number;
  questionsAnswered: number;
}): void {
  emitToLearnerParents(learnerId, "score_updated", { learnerId, ...payload, timestamp: new Date().toISOString() });
}

export function emitReadinessRecalculated(learnerId: string, payload: {
  subjectName: string;
  readinessScore: number;
  masteryBand: string;
}): void {
  emitToLearnerParents(learnerId, "readiness_recalculated", { learnerId, ...payload, timestamp: new Date().toISOString() });
}

export function emitReportUpdated(learnerId: string): void {
  emitToLearnerParents(learnerId, "report_updated", { learnerId, timestamp: new Date().toISOString() });
}

export function emitSubjectsChanged(userId: string): void {
  emitToUser(userId, "subjects_changed", { timestamp: new Date().toISOString() });
}

export function emitLinkDeliveryUpdated(learnerId: string, payload: {
  jti: string;
  deliveryStatus: string;
  deliveryError: string | null;
  deliveryUpdatedAt: string;
}): void {
  emitToLearnerParents(learnerId, "link_delivery_updated", { learnerId, ...payload, timestamp: new Date().toISOString() });
}

export function signSocketToken(userId: string, role: string): string {
  return jwt.sign({ sub: userId, role }, getSigningKey(), { expiresIn: "8h" });
}
