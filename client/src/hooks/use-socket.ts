import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

let globalSocket: Socket | null = null;
let socketToken: string | null = null;

async function fetchSocketToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/socket-token", { credentials: "include" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.token || null;
  } catch {
    return null;
  }
}

export function useSocket() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(async () => {
    if (globalSocket?.connected) {
      socketRef.current = globalSocket;
      return;
    }

    const token = await fetchSocketToken();
    if (!token) return;
    socketToken = token;

    const socket = io({
      path: "/ws/socket.io",
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect_error", (err) => {
      console.warn("[socket] connect error:", err.message);
    });

    socket.on("score_updated", () => {
      qc.invalidateQueries({ queryKey: ["/api/parent/child-progress"] });
      qc.invalidateQueries({ queryKey: ["/api/parent/readiness"] });
      qc.invalidateQueries({ queryKey: ["/api/parent/activity-feed"] });
    });

    socket.on("report_updated", () => {
      qc.invalidateQueries({ queryKey: ["/api/parent/child-progress"] });
      qc.invalidateQueries({ queryKey: ["/api/parent/monthly-summary"] });
    });

    socket.on("readiness_recalculated", () => {
      qc.invalidateQueries({ queryKey: ["/api/parent/readiness"] });
    });

    socket.on("subjects_changed", () => {
      qc.invalidateQueries({ queryKey: ["/api/user/onboarding"] });
      qc.invalidateQueries({ queryKey: ["/api/subjects"] });
    });

    socket.on("link_delivery_updated", () => {
      qc.invalidateQueries({ queryKey: ["/api/parent/onboarding-link-history"] });
      qc.invalidateQueries({ queryKey: ["/api/subscribe/onboarding-link-status"] });
    });

    globalSocket = socket;
    socketRef.current = socket;
  }, [qc]);

  const disconnect = useCallback(() => {
    if (globalSocket) {
      globalSocket.disconnect();
      globalSocket = null;
    }
    socketRef.current = null;
  }, []);

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }
    return () => {};
  }, [user, connect, disconnect]);

  return { socket: socketRef.current, isConnected: socketRef.current?.connected ?? false };
}
