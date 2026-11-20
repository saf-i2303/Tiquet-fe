import { Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { requestPayoutAction } from "@/lib/actions/organizer.action";
import { formatRupiah } from "@/lib/utils";

export function PayoutRequestForm({ available }: { available: number }) {
  return (
    <form action={requestPayoutAction} className="space-y-6">
      <Card className="space-y-5 p-5 sm:p-6">
        <CardHeader title="Ajukan pencairan" description="Pilih periode dan nominal yang ingin dicairkan." />
        <p className="text-sm text-muted">
          Saldo tersedia: <span className="font-semibold text-navy-900">{formatRupiah(available)}</span>.
          Biaya pencairan 3%.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Periode" htmlFor="period">
            <Input
              id="period"
              name="period"
              defaultValue={new Intl.DateTimeFormat("id-ID", {
                month: "long",
                year: "numeric",
              }).format(new Date())}
            />
          </Field>

          <Field
            label="Nominal (Rp)"
            htmlFor="amount"
            hint={`Maksimal ${formatRupiah(available)}.`}
          >
            <Input
              id="amount"
              name="amount"
              type="number"
              min={1}
              max={available}
              step={1000}
              required
              defaultValue={available}
            />
          </Field>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={available <= 0}>
          <Banknote className="h-4 w-4" aria-hidden="true" /> Ajukan pencairan
        </Button>
      </div>
    </form>
  );
}
