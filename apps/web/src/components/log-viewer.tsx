"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogViewerProps {
  containerId: string;
  tail?: number;
  lines: string[];
  autoScroll: boolean;
  onLine: (line: string) => void;
}

export function LogViewer({ containerId, tail = 100, lines, autoScroll, onLine }: LogViewerProps) {
  const t = useTranslations("Logs");
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const onLineRef = useRef(onLine);

  useEffect(() => {
    onLineRef.current = onLine;
  });

  useEffect(() => {
    const es = new EventSource(`/api/containers/${containerId}/logs?tail=${tail}`);
    es.onopen = () => setConnected(true);
    es.onmessage = (e: MessageEvent<string>) => {
      onLineRef.current(e.data);
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [containerId, tail]);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [lines, autoScroll]);

  return (
    <ScrollArea className="h-full max-h-[calc(100vh-10rem)] min-h-96 w-full rounded-md border bg-muted/30 p-4 font-mono text-xs">
      {!connected && <p className="text-muted-foreground">{t("connecting")}</p>}
      {connected && lines.length === 0 && <p className="text-muted-foreground">{t("empty")}</p>}
      {lines.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap break-all">
          {line}
        </div>
      ))}
      <div ref={bottomRef} />
    </ScrollArea>
  );
}
