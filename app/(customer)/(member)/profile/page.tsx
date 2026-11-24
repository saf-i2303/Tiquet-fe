import { AccountProfile } from "@/components/profile/account-profile";

type ProfileSearchParams = Promise<{ saved?: string; error?: string }>;

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: ProfileSearchParams;
}) {
  const { saved, error } = await searchParams;
  return <AccountProfile role="customer" saved={saved} error={error} />;
}
