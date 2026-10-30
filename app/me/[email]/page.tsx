import { Suspense } from "react";
import Profile from "../../components/Profile/Profile";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  return (
    <Suspense
      fallback={(
        <main className="min-h-screen bg-[#faf7f2]">
          <div className="h-[300px] animate-pulse bg-gradient-to-br from-[#40233e] via-[#30172f] to-[#211821]" />
          <div className="mx-auto -mt-16 max-w-5xl px-5">
            <div className="h-64 animate-pulse rounded-2xl border border-[#eadfd8] bg-[#fffdfa] shadow-xl" />
          </div>
        </main>
      )}
    >
      <ResolvedUserProfile params={params} />
    </Suspense>
  );
}

async function ResolvedUserProfile({
  params,
}: {
  params: Promise<{ email: string }>;
}) {
  const { email } = await params;
  return <Profile email={email} />;
}
