"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogViewerProps {
  containerId: string;
  tail?: number;
}

export function LogViewer({ containerId, tail = 100 }: LogViewerProps) {
  const t = useTranslations("Containers.logs");
  const [lines, setLines] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource(`/api/containers/${containerId}/logs?tail=${tail}`);
    es.onopen = () => setConnected(true);
    es.onmessage = (e: MessageEvent<string>) => {
      setLines((prev) => [...prev, e.data]);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [containerId, tail]);

  return (
    <ScrollArea className="h-96 rounded-md border bg-black p-4 font-mono text-xs text-green-400">
      {!connected && <p className="text-zinc-500">{t("connecting")}</p>}
      {connected && lines.length === 0 && <p className="text-zinc-500">{t("empty")}</p>}
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      <div ref={bottomRef} />
    </ScrollArea>
  );
}
