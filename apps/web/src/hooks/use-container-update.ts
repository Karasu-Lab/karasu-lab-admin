"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { connectSocket, disconnectSocket, socket } from "@/lib/socket";

interface UpdateProgressEvent {
  containerId: string;
  status: string;
  detail?: string;
}

export function useContainerUpdate(containerId: string) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | undefined>();

  useEffect(() => {
    connectSocket();

    const handler = (data: UpdateProgressEvent) => {
      if (data.containerId !== containerId) return;
      setStatus(data.status);
      setDetail(data.detail);
      if (data.status === "done" || data.status === "error") {
        setTimeout(() => {
          setStatus(null);
          setDetail(undefined);
          router.refresh();
        }, 800);
      }
    };

    socket.on("update-progress", handler);
    return () => {
      socket.off("update-progress", handler);
      disconnectSocket();
    };
  }, [containerId, router]);

  const trigger = useCallback(async () => {
    await fetch(`/api/containers/${containerId}/update`, { method: "POST" });
  }, [containerId]);

  return {
    trigger,
    status,
    detail,
    pending: !!status && status !== "done" && status !== "error",
  };
}
