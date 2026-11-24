import { AccountProfile } from "@/components/profile/account-profile";

type ProfileSearchParams = Promise<{ saved?: string; error?: string }>;

export default async function GateProfilePage({
  searchParams,
}: {
  searchParams: ProfileSearchParams;
}) {
  const { saved, error } = await searchParams;
  return <AccountProfile role="gate_staff" saved={saved} error={error} />;
}
