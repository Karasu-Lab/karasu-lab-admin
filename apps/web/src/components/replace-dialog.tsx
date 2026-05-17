"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReplaceEvent {
  status: string;
  detail?: string;
}

interface ReplaceDialogProps {
  containerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReplaceDialog({ containerId, open, onOpenChange }: ReplaceDialogProps) {
  const t = useTranslations("Containers.replaceDialog");
  const [newImage, setNewImage] = useState("");
  const [progress, setProgress] = useState<ReplaceEvent | null>(null);
  const [running, setRunning] = useState(false);

  const handleReplace = async () => {
    if (!newImage.trim()) return;
    setRunning(true);
    setProgress({ status: "pulling" });

    const response = await fetch(`/api/containers/${containerId}/replace`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ newImage }),
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      const match = text.match(/data: (.*)\n/);
      if (match) {
        try {
          const event = JSON.parse(match[1]) as ReplaceEvent;
          setProgress(event);
          if (event.status === "done") {
            setRunning(false);
            break;
          }
        } catch {
          /* ignore parse errors */
        }
      }
    }
  };

  const statusLabel = () => {
    if (!progress) return null;
    const map: Record<string, string> = {
      pulling: t("pulling"),
      stopping: t("stopping"),
      starting: t("starting"),
      done: t("done"),
    };
    return map[progress.status] ?? progress.status;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-image">{t("newImage")}</Label>
            <Input
              id="new-image"
              placeholder={t("newImagePlaceholder")}
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              disabled={running}
            />
          </div>
          {progress && <p className="text-sm text-muted-foreground">{statusLabel()}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={running}>
            {t("cancel")}
          </Button>
          <Button onClick={handleReplace} disabled={running || !newImage.trim()}>
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
