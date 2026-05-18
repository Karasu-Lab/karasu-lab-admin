"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertCircle,
  Archive,
  Check,
  CheckCircle2,
  CheckCheck,
  Circle,
  Clock,
  Download,
  Layers,
  Loader2,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useContainerUpdate } from "@/hooks/use-container-update";
import { useContainerLayers, type LayerState } from "@/hooks/use-container-layers";

interface ContainerUpdatePanelProps {
  containerId: string;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-4 pb-1">
      {title}
    </p>
  );
}

const UPDATE_STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  pulling: Download,
  stopping: Circle,
  starting: Circle,
  done: CheckCircle2,
  error: AlertCircle,
};

const UPDATE_STATUS_COLOR: Record<string, string> = {
  pulling: "text-blue-500",
  stopping: "text-amber-500",
  starting: "text-amber-500",
  done: "text-green-500",
  error: "text-destructive",
};

const LAYER_STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Waiting: Clock,
  "Pulling fs layer": Download,
  Downloading: Download,
  "Download complete": Check,
  "Pull complete": PackageCheck,
  "Already exists": CheckCheck,
  Extracting: Archive,
  "Verifying Checksum": ShieldCheck,
};

const LAYER_STATUS_COLOR: Record<string, string> = {
  Waiting: "text-muted-foreground",
  "Pulling fs layer": "text-blue-500",
  Downloading: "text-blue-500",
  "Download complete": "text-green-400",
  "Pull complete": "text-green-500",
  "Already exists": "text-muted-foreground",
  Extracting: "text-amber-500",
  "Verifying Checksum": "text-muted-foreground",
};

function StatusIcon({
  label,
  icon: Icon,
  className,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger className="cursor-default">
        <Icon className={`size-4 shrink-0 ${className ?? "text-muted-foreground"}`} />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function LayerRow({ layerId, layer }: { layerId: string; layer: LayerState }) {
  const Icon = LAYER_STATUS_ICON[layer.status] ?? Circle;
  const color = LAYER_STATUS_COLOR[layer.status] ?? "text-muted-foreground";

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <Layers className="size-4 text-muted-foreground shrink-0" />
      <span className="font-mono text-xs text-muted-foreground w-28 shrink-0">
        {layerId.slice(0, 12)}
      </span>
      <span className="text-xs font-mono text-muted-foreground flex-1 min-w-0 truncate">
        {layer.progress ?? ""}
      </span>
      <StatusIcon label={layer.status} icon={Icon} className={color} />
    </div>
  );
}

export function ContainerUpdatePanel({ containerId }: ContainerUpdatePanelProps) {
  const t = useTranslations("Containers");
  const { trigger, status, pending } = useContainerUpdate(containerId);
  const { layers } = useContainerLayers(containerId);

  const StatusIconComponent = status ? (UPDATE_STATUS_ICON[status] ?? Circle) : null;
  const statusColor = status ? (UPDATE_STATUS_COLOR[status] ?? "text-muted-foreground") : "";
  const statusLabel = status ? t(`updateProgress.${status}` as Parameters<typeof t>[0]) : "";

  return (
    <>
      <div className="flex items-center justify-between pt-1">
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
        {StatusIconComponent && status && (
          <StatusIcon label={statusLabel} icon={StatusIconComponent} className={statusColor} />
        )}
      </div>

      {layers.size > 0 && (
        <div className="max-w-xl">
          <SectionHeader title="Pull Progress" />
          {Array.from(layers.entries()).map(([layerId, layer]) => (
            <LayerRow key={layerId} layerId={layerId} layer={layer} />
          ))}
        </div>
      )}
    </>
  );
}
