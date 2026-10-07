import { RegisterServiceWorker } from "@/components/pwa/RegisterServiceWorker";

// The app worker registers only where the app lives, so public visitors never install it.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RegisterServiceWorker />
    </>
  );
}
