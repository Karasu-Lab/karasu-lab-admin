"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Container, Image as ImageIcon, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavSidebar() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();

  const items = [
    { href: "/", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/containers", label: t("containers"), icon: Container },
    { href: "/images", label: t("images"), icon: ImageIcon },
  ] as const;

  return (
    <aside className="flex flex-col w-56 min-h-screen border-r bg-background px-3 py-4 gap-1">
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
            pathname === href && "bg-muted text-foreground",
          )}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </aside>
  );
}
