"use client";

import { useEffect, useState } from "react";
import { connectSocket, disconnectSocket, socket } from "@/lib/socket";

export interface LayerState {
  status: string;
  progress?: string;
}

interface LayerProgressEvent {
  containerId: string;
  layerId: string;
  status: string;
  progress?: string;
}

export function useContainerLayers(containerId: string) {
  const [layers, setLayers] = useState<Map<string, LayerState>>(new Map());

  useEffect(() => {
    connectSocket();

    const progressHandler = (data: LayerProgressEvent) => {
      if (data.containerId !== containerId) return;
      setLayers((prev) => {
        const next = new Map(prev);
        next.set(data.layerId, { status: data.status, progress: data.progress });
        return next;
      });
    };

    const updateHandler = (data: { containerId: string; status: string }) => {
      if (data.containerId !== containerId) return;
      if (data.status === "done" || data.status === "stopping") {
        setLayers(new Map());
      }
    };

    socket.on("update-layer-progress", progressHandler);
    socket.on("update-progress", updateHandler);
    return () => {
      socket.off("update-layer-progress", progressHandler);
      socket.off("update-progress", updateHandler);
      disconnectSocket();
    };
  }, [containerId]);

  return { layers };
}
