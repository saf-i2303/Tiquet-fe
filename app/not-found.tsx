import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-6 py-12">
      <div className="w-full max-w-md">
        <p className="eyebrow mb-3 text-center text-muted">
          404
        </p>
        <EmptyState
          title="Halaman tidak ditemukan"
          description="Tautan yang kamu tuju tidak tersedia atau sudah dipindahkan."
          action={
            <ButtonLink href="/" variant="navy">
              Kembali ke Beranda
            </ButtonLink>
          }
        />
      </div>
    </main>
  );
}
