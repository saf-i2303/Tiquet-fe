"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, UserCog } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { LogoutForm } from "@/components/layout/logout-form";
import type { Role, SessionUser } from "@/types/user";

/** Tujuan menu profil/pengaturan untuk tiap role. */
const destinations: Record<Role, { profile: string; settings: string }> = {
  customer: { profile: "/profile", settings: "/profile" },
  organizer: { profile: "/organizer/profile", settings: "/organizer/profile" },
  super_admin: { profile: "/profile", settings: "/admin/settings" },
  gate_staff: { profile: "/profile", settings: "/profile" },
};

/**
 * Dropdown profil di navbar. Dipakai bersama oleh header publik dan
 * dashboard organizer/admin supaya tiap role punya menu yang sama.
 */
export function ProfileMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const target = destinations[user.role] ?? destinations.customer;

  useEffect(() => {
    if (!open) return;

    const closeOnOutside = (event: MouseEvent) => {
      if (
        container.current &&
        !container.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={container}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Menu profil ${user.name}`}
        className="flex items-center gap-2 rounded-control border border-line bg-white py-1 pl-1 pr-2.5 text-sm font-medium text-navy-900 transition hover:bg-canvas"
      >
        <Avatar name={user.name} size="sm" />
        <span className="hidden max-w-28 truncate sm:block">
          {user.name.split(" ")[0]}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 text-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Menu profil"
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-control border border-line bg-white shadow-card"
        >
          <div className="border-b border-line px-3 py-2.5">
            <div className="truncate text-sm font-semibold text-navy-900">
              {user.name}
            </div>
            <div className="truncate text-xs text-muted">{user.email}</div>
          </div>
          <Link
            role="menuitem"
            href={target.profile}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-navy-800 transition hover:bg-canvas"
          >
            <UserCog className="h-4 w-4 text-muted" aria-hidden="true" /> Profil
          </Link>
          <Link
            role="menuitem"
            href={target.settings}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-navy-800 transition hover:bg-canvas"
          >
            <Settings className="h-4 w-4 text-muted" aria-hidden="true" />{" "}
            Pengaturan
          </Link>
          <LogoutForm onComplete={() => setOpen(false)}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2 border-t border-line px-3 py-2 text-left text-sm text-danger transition hover:bg-danger-soft"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" /> Keluar
            </button>
          </LogoutForm>
        </div>
      )}
    </div>
  );
}
