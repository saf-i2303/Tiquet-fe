import { StatusBadge } from "@/components/shared/status-badge";
import { refundStatusMeta } from "@/lib/constants";

/** Badge status refund dengan label dan tone yang konsisten di area admin. */
export function RefundStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return <StatusBadge value={status} map={refundStatusMeta} className={className} />;
}
