import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/widget/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeSwitcher } from "@/components/widget/theme-switcher"
import { LanguageSwitcher } from "@/components/widget/language-switcher"
import { UserNav } from "@/components/widget/user-nav"
import { MenuSearch } from "@/components/widget/menu-search"
import { ProtectedRoute } from "@/features/auth/components/protected-route"
import { MenuProvider } from "@/features/dashboard/providers/menu-provider"
import { DynamicBreadcrumb } from "@/components/widget/dynamic-breadcrumb"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <MenuProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-background border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 h-4"
                />
                <DynamicBreadcrumb />
              </div>
              <div className="flex-1 flex items-center justify-center px-4 max-w-2xl mx-auto">
                <MenuSearch className="w-full" />
              </div>
              <div className="ml-auto flex items-center gap-2 px-4">
                <LanguageSwitcher />
                <ThemeSwitcher />
                <UserNav />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </MenuProvider>
    </ProtectedRoute>
  )
}