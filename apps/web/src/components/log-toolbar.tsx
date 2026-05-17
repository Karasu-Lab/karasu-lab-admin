"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, Copy, Eraser } from "lucide-react";

interface LogToolbarProps {
  lines: string[];
  autoScroll: boolean;
  onAutoScrollChange: (value: boolean) => void;
  onClear: () => void;
}

export function LogToolbar({ lines, autoScroll, onAutoScrollChange, onClear }: LogToolbarProps) {
  const t = useTranslations("Logs");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(lines.join("\n"));
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant={autoScroll ? "secondary" : "ghost"}
        aria-label={t("autoScroll")}
        onClick={() => onAutoScrollChange(!autoScroll)}
      >
        {autoScroll ? <Lock className="size-4" /> : <Unlock className="size-4" />}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        aria-label={t("copyAll")}
        onClick={() => void handleCopy()}
      >
        <Copy className="size-4" />
      </Button>
      <Button size="icon" variant="ghost" aria-label={t("clear")} onClick={onClear}>
        <Eraser className="size-4" />
      </Button>
    </div>
  );
}
