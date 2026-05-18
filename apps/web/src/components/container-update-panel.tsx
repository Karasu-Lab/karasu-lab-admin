"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Loader2, RefreshCw } from "lucide-react";
import { useContainerUpdate } from "@/hooks/use-container-update";
import { useContainerLayers } from "@/hooks/use-container-layers";

interface ContainerUpdatePanelProps {
  containerId: string;
}

const LAYER_STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  "Pull complete": "default",
  "Already exists": "secondary",
  Extracting: "outline",
  Downloading: "outline",
};

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-4 pb-1">
      {title}
    </p>
  );
}

export function ContainerUpdatePanel({ containerId }: ContainerUpdatePanelProps) {
  const t = useTranslations("Containers");
  const { trigger, status, pending } = useContainerUpdate(containerId);
  const { layers } = useContainerLayers(containerId);

  return (
    <>
      <div className="flex items-center gap-2 pt-1">
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          aria-label={t("update")}
          onClick={() => void trigger()}
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin mr-1" />
          ) : (
            <RefreshCw className="size-4 mr-1" />
          )}
          {t("update")}
        </Button>
        {status && (
          <span className="text-xs text-muted-foreground">
            {t(`updateProgress.${status}` as Parameters<typeof t>[0])}
          </span>
        )}
      </div>

      {layers.size > 0 && (
        <div className="max-w-xl">
          <SectionHeader title="Pull Progress" />
          {Array.from(layers.entries()).map(([layerId, layer]) => (
            <div
              key={layerId}
              className="flex items-center gap-4 py-2 border-b border-border last:border-0"
            >
              <Layers className="size-4 text-muted-foreground shrink-0" />
              <span className="font-mono text-xs text-muted-foreground w-28 shrink-0">
                {layerId.slice(0, 12)}
              </span>
              <Badge
                variant={LAYER_STATUS_VARIANT[layer.status] ?? "outline"}
                className="text-xs shrink-0"
              >
                {layer.status}
              </Badge>
              {layer.progress && (
                <span className="text-xs font-mono text-muted-foreground truncate">
                  {layer.progress}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
