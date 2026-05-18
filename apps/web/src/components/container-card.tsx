"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ReplaceDialog } from "./replace-dialog";
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
  const [replaceOpen, setReplaceOpen] = useState(false);

  const displayName = container.names[0]?.replace(/^\//, "") ?? container.id.slice(0, 12);

  return (
    <>
      <Card className="cursor-pointer" onClick={() => router.push(`/containers/${container.id}`)}>
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
              aria-label={t("replace")}
              onClick={(e) => {
                e.stopPropagation();
                setReplaceOpen(true);
              }}
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      <ReplaceDialog containerId={container.id} open={replaceOpen} onOpenChange={setReplaceOpen} />
    </>
  );
}
