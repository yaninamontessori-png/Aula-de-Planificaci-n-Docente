"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/nueva", label: "Nueva" },
  { href: "/planificaciones", label: "Mis planificaciones" },
  { href: "/perfil", label: "Perfil" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-20 flex justify-around gap-1 border-t border-border bg-bg/95 px-2 py-2 backdrop-blur md:hidden"
    >
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 flex-1 items-center justify-center rounded-lg px-2 text-center text-xs font-semibold ${
              active ? "bg-brand-2 text-white" : "text-muted"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones" className="hidden items-center gap-1 md:flex">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              active ? "bg-surface-2 text-brand" : "text-muted hover:text-brand"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
