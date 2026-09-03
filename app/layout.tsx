import type { Metadata } from "next";
import {  Readex_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "@/auth/providers";
import { ThemeProvider } from "@/components/theme-provider";

const ar = Readex_Pro({
  weight : "400",
})

export const metadata: Metadata = { 
  title: "حفظ | احفظ القرآن بثبات", 
  description: "احفظ القرآن الكريم، راجع ما حفظت، وتابع تقدمك يومًا بعد يوم.",
 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ar.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
         <Providers>
           <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            
           {children}
          </ThemeProvider>
         </Providers>
        </body>
    </html>
  );
}
