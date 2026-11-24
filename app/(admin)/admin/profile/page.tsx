import { AccountProfile } from "@/components/profile/account-profile";

type ProfileSearchParams = Promise<{ saved?: string; error?: string }>;

export default async function AdminProfilePage({
  searchParams,
}: {
  searchParams: ProfileSearchParams;
}) {
  const { saved, error } = await searchParams;
  return <AccountProfile role="super_admin" saved={saved} error={error} />;
}
