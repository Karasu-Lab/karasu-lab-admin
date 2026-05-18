"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useContainerUpdate } from "@/hooks/use-container-update";
import { ContainerToggleButton } from "./container-toggle-button";

interface ContainerPort {
  IP: string;
  PrivatePort: number;
  PublicPort?: number;
  Type: string;
}

interface ContainerInfo {
  id: string;
  names: string[];
  image: string;
  status: string;
  state: string;
  ports: ContainerPort[];
}

interface ContainerCardProps {
  container: ContainerInfo;
}

export function ContainerCard({ container }: ContainerCardProps) {
  const t = useTranslations("Containers");
  const router = useRouter();
  const { trigger, status, detail, pending } = useContainerUpdate(container.id);

  const displayName = container.names[0]?.replace(/^\//, "") ?? container.id.slice(0, 12);

  return (
    <Card
      className="cursor-pointer relative overflow-hidden h-full"
      onClick={() => router.push(`/containers/${container.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{displayName}</CardTitle>
          <Badge variant={container.state === "running" ? "default" : "secondary"}>
            {container.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-3">
        <p className="text-xs text-muted-foreground">{container.image}</p>
        {container.ports.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {container.ports.map((p, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {p.PublicPort ? `${p.PublicPort}:${p.PrivatePort}` : p.PrivatePort}/{p.Type}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-1 mt-auto">
          <ContainerToggleButton containerId={container.id} state={container.state} />
          <Button
            size="icon"
            variant="ghost"
            aria-label={t("update")}
            disabled={pending}
            onClick={(e) => {
              e.stopPropagation();
              void trigger();
            }}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
          </Button>
        </div>
      </CardContent>

      {pending && (
        <div className="absolute inset-0 rounded-xl bg-green-500/10 pointer-events-none flex items-end pb-3 px-4">
          <p className="text-xs text-green-700 dark:text-green-400 font-medium">
            {status ? t(`updateProgress.${status}` as Parameters<typeof t>[0]) : ""}
            {detail && <span className="ml-1 text-muted-foreground">{detail}</span>}
          </p>
        </div>
      )}
    </Card>
  );
}
