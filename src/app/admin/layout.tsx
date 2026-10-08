import type { Metadata } from "next";
import { RegisterServiceWorker } from "@/components/pwa/RegisterServiceWorker";
import { loadBrand, loadProfile } from "@/lib/data/safe";
import { statusBarFor } from "@/lib/pwa/manifest";

// The command center is the installable app: its title, manifest and home screen icon live here, and search engines
// are kept out. Public pages never carry them.
export async function generateMetadata(): Promise<Metadata> {
  const [profile, brand] = await Promise.all([loadProfile(), loadBrand()]);
  return {
    title: "Command center",
    robots: { index: false, follow: false },
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, title: profile.business, statusBarStyle: statusBarFor(brand) },
    icons: { apple: "/pwa/apple-touch-icon.png" },
  };
}

// The app worker registers only where the app lives, so public visitors never install it.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RegisterServiceWorker />
    </>
  );
}
