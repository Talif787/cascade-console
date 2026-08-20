import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { SidebarProvider } from "@/components/app-shell/sidebar-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cascade Console",
  description: "Operator console for the Cascade data-platform control plane",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const environment = process.env.CASCADE_ENVIRONMENT ?? "local";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
        <Providers>
          <SidebarProvider>
            <div className="flex h-dvh w-full overflow-hidden">
              <Sidebar />
              <div className="flex min-w-0 flex-1 flex-col">
                <Topbar environment={environment} />
                <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6">{children}</main>
              </div>
            </div>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
