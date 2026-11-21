import { ButtonLink } from "@/components/ui/button-link";
import { DashboardNav } from "@/components/layout/role-menu";
import { Logo } from "@/components/layout/brand-logo";
import { ProfileMenu } from "@/components/layout/profile-dropdown";
import type { NavItem } from "@/config/navigation";
import type { SessionUser } from "@/types/user";

/** Bungkus standar halaman dashboard: sidebar kiri + header atas + konten. */
export function DashboardShell({
  user,
  nav,
  roleLabel,
  children,
}: {
  user: SessionUser;
  nav: NavItem[];
  roleLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface p-5 lg:flex">
        <Logo />
        <div className="mt-8 text-xs font-semibold uppercase tracking-widest text-muted">
          {roleLabel}
        </div>
        <div className="mt-3 flex-1 overflow-y-auto scrollbar-none">
          <DashboardNav items={nav} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <div className="lg:hidden">
              <Logo />
            </div>
            <div className="hidden min-w-0 lg:block">
              <div className="eyebrow text-muted">{roleLabel}</div>
              <div className="truncate text-sm font-semibold text-navy-900">
                Selamat datang, {user.name}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ButtonLink href="/" variant="outline" size="sm">
                Lihat Situs
              </ButtonLink>
              <ProfileMenu user={user} />
            </div>
          </div>
          <div className="border-t border-line px-4 py-2 lg:hidden">
            <DashboardNav items={nav} variant="horizontal" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
