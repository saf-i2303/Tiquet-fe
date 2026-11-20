import Link from "next/link";
import type { SVGProps } from "react";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/layout/brand-logo";
import { siteConfig } from "@/config/site";

const explore = [
  { href: "/events", label: "Semua Event" },
  { href: "/tickets", label: "Tiket Saya" },
  { href: "/orders", label: "Riwayat Transaksi" },
];

const organizer = [
  { href: "/register", label: "Daftar jadi EO" },
  { href: "/organizer", label: "Dashboard EO" },
  { href: "/organizer/verification", label: "Verifikasi EO" },
];

type IconComponent = (props: SVGProps<SVGSVGElement>) => React.JSX.Element;

const InstagramIcon: IconComponent = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon: IconComponent = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const YoutubeIcon: IconComponent = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

const LinkedinIcon: IconComponent = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TiktokIcon: IconComponent = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const socialIconMap: Record<string, IconComponent> = {
  instagram: InstagramIcon,
  twitter: TwitterIcon,
  x: TwitterIcon,
  youtube: YoutubeIcon,
  linkedin: LinkedinIcon,
  tiktok: TiktokIcon,
};

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white text-navy-800">
      <div className="page-container grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo showTagline />
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {siteConfig.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {siteConfig.socials.map((social) => {
              const Icon = socialIconMap[social.label.toLowerCase()] ?? Globe;
              const href = "href" in social && social.href ? social.href : "#";

              return (
                <Link
                  key={social.label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  aria-label={social.label}
                  title={social.label}
                  className="flex size-9 items-center justify-center rounded-control border border-line bg-canvas text-navy-700 transition hover:border-gold-400 hover:bg-gold-100 hover:text-navy-900"
                >
                  <Icon className="size-4" />
                </Link>
              );
            })}
          </div>
        </div>

        <nav aria-label="Jelajahi">
          <h3 className="type-label mb-3 text-navy-900">Jelajahi</h3>
          <ul className="space-y-2 text-sm text-muted">
            {explore.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition hover:text-navy-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Untuk organizer">
          <h3 className="type-label mb-3 text-navy-900">Untuk Organizer</h3>
          <ul className="space-y-2 text-sm text-muted">
            {organizer.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition hover:text-navy-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="type-label mb-3 text-navy-900">Hubungi Kami</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-navy-700" /> {siteConfig.email}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-navy-700" /> {siteConfig.phone}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-navy-700" /> {siteConfig.city}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line py-4 text-center text-xs text-muted">
        <div className="page-container">
          © {new Date().getFullYear()} {siteConfig.name}. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  );
}
