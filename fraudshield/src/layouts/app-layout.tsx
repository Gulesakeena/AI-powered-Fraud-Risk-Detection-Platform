import type { ReactNode } from "react"
import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { PageContainer } from "@/components/layout/page-container"
import { CommandPalette } from "@/components/layout/command-palette"
import { NotificationDrawer } from "@/components/layout/notification-drawer"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar
        mobileSidebarOpen={mobileSidebarOpen}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
        <main className="w-full min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <PageContainer>{children}</PageContainer>
        </main>
      </div>
      <CommandPalette />
      <NotificationDrawer />
    </div>
  )
}