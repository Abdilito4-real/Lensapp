import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { DesktopNav } from "@/components/desktop-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <DesktopNav />
      <main className="flex-1 container py-0 md:py-0">
        <div className="pb-16 md:pb-0">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
