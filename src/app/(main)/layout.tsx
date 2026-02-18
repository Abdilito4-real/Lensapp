import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 container py-8 md:py-12">
        <div className="pb-16 md:pb-0">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
