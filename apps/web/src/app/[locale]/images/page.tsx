"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { NavSidebar } from "@/components/nav-sidebar";
import { PullProgress } from "@/components/pull-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ImageInfo {
  Id: string;
  RepoTags: string[] | null;
  Size: number;
  Created: number;
}

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString();
}

export default function ImagesPage() {
  const t = useTranslations("Images");
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [pullImage, setPullImage] = useState("");
  const [pulling, setPulling] = useState(false);
  const [activePull, setActivePull] = useState<string | null>(null);

  const loadImages = async () => {
    try {
      const res = await fetch("/api/images");
      const data = (await res.json()) as ImageInfo[];
      setImages(data);
    } catch {
      /* ignore network errors */
    }
  };

  useEffect(() => {
    void loadImages();
  }, []);

  const handlePull = () => {
    if (!pullImage.trim()) return;
    setActivePull(pullImage.trim());
    setPulling(true);
  };

  const handlePullDone = () => {
    setPulling(false);
    setActivePull(null);
    setPullImage("");
    void loadImages();
  };

  return (
    <div className="flex flex-1">
      <NavSidebar />
      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>

        <div className="space-y-2 max-w-sm">
          <Label htmlFor="pull-image">{t("pull.image")}</Label>
          <div className="flex gap-2">
            <Input
              id="pull-image"
              placeholder={t("pull.imagePlaceholder")}
              value={pullImage}
              onChange={(e) => setPullImage(e.target.value)}
              disabled={pulling}
            />
            <Button onClick={handlePull} disabled={pulling || !pullImage.trim()}>
              {t("pull.start")}
            </Button>
          </div>
          {activePull && <PullProgress imageName={activePull} onDone={handlePullDone} />}
        </div>

        {images.length === 0 ? (
          <p className="text-muted-foreground">{t("noImages")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("repository")}</TableHead>
                <TableHead>{t("tag")}</TableHead>
                <TableHead>{t("size")}</TableHead>
                <TableHead>{t("created")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {images.map((img) => {
                const tags = img.RepoTags ?? ["<none>:<none>"];
                return tags.map((tag) => {
                  const [repo, tagPart] = tag.split(":");
                  return (
                    <TableRow key={`${img.Id}-${tag}`}>
                      <TableCell className="font-mono text-xs">{repo}</TableCell>
                      <TableCell className="font-mono text-xs">{tagPart}</TableCell>
                      <TableCell className="text-xs">{formatBytes(img.Size)}</TableCell>
                      <TableCell className="text-xs">{formatDate(img.Created)}</TableCell>
                    </TableRow>
                  );
                });
              })}
            </TableBody>
          </Table>
        )}
      </main>
    </div>
  );
}
