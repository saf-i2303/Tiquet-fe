"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/brand-logo";
import { ProfileMenu } from "@/components/layout/profile-dropdown";
import { ButtonLink } from "@/components/ui/button-link";
import { customerNav } from "@/config/navigation";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types/user";

const links = customerNav;

/** Landing and dashboard share the same restrained hover state. */
const landingHover = "hover:bg-canvas hover:text-navy-900";

/** Di landing page, menu menuju bagian yang benar-benar ada di halaman tersebut. */
const landingLinks = [
  { href: "/#event", label: "Event" },
  { href: "/#keunggulan", label: "Keunggulan" },
  { href: "/#cara-kerja", label: "Cara Kerja" },
  { href: "/#organizer", label: "Untuk EO" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const navLinks = isLanding ? landingLinks : links;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    if (!isLanding) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isLanding]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, [pathname]);

  const isActive = (href: string) => {
    if (isLanding && href.startsWith("/#")) return activeHash === href.slice(1);
    return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  };

  const handleNavClick = (href: string) => {
    if (isLanding && href.startsWith("/#")) setActiveHash(href.slice(1));
    setOpen(false);
  };

  const navLinkClass = (href: string) => {
    const active = isActive(href);
    return cn(
      "rounded-control px-3 py-2 text-sm font-medium text-navy-700 transition",
      isLanding ? landingHover : "hover:bg-canvas hover:text-navy-900",
      active && "bg-navy-900/5 font-semibold text-navy-900",
    );
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300",
        isLanding
          ? scrolled
            ? "border-line bg-white/95 shadow-card"
            : "border-white/60 bg-white/75"
          : "border-line bg-white/95",
      )}
    >
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => handleNavClick(link.href)}
              className={navLinkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {!isLanding && user ? (
            <ProfileMenu user={user} />
          ) : (
            <>
              <ButtonLink
                href="/login"
                variant="ghost"
                size="sm"
                className={cn("hover:bg-canvas hover:text-navy-900", isLanding && landingHover)}
              >
                Masuk
              </ButtonLink>
              <ButtonLink href="/register" variant="navy" size="sm">
                Daftar
              </ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className={cn(
            "grid h-10 w-10 place-items-center rounded-control border border-line bg-white text-navy-900 transition hover:bg-canvas hover:text-navy-900 md:hidden",
            isLanding && landingHover,
          )}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-white/90 px-4 py-3 backdrop-blur-xl md:hidden">
          <nav id="mobile-navigation" aria-label="Navigasi seluler" className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => handleNavClick(link.href)}
                className={navLinkClass(link.href)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 border-t border-line pt-3">
              {!isLanding && user ? (
                <ProfileMenu user={user} />
              ) : (
                <>
                  <ButtonLink
                    href="/login"
                    onClick={() => setOpen(false)}
                    variant="outline"
                    className={cn(
                      "flex-1 hover:border-navy-900/25 hover:bg-canvas hover:text-navy-900",
                      isLanding && landingHover,
                    )}
                  >
                    Masuk
                  </ButtonLink>
                  <ButtonLink
                    href="/register"
                    onClick={() => setOpen(false)}
                    variant="navy"
                    className="flex-1"
                  >
                    Daftar
                  </ButtonLink>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
