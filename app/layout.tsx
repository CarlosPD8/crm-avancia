import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { SidebarProvider } from "@/components/layout/SidebarContext";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CRM Avancia",
  description: "Panel de gestión comercial — Avancia Tech",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isPrint = pathname.endsWith("/print");

  return (
    <html lang="es" className={`${jakartaSans.variable} h-full`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('crm-theme')||'dark';document.documentElement.classList.toggle('dark',t==='dark')})()`,
          }}
        />
      </head>
      <body className="h-full antialiased">
        {isPrint ? (
          children
        ) : (
          <ThemeProvider>
            <SidebarProvider>
              <div className="flex h-full">
                <Sidebar />
                <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                  <Header />
                  {children}
                </div>
              </div>
            </SidebarProvider>
          </ThemeProvider>
        )}
      </body>
    </html>
  );
}
