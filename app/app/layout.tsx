import { UserProvider } from "@/contexts/user-context";
import Header from "@/modules/header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <UserProvider>
          <Header />
          <div className="mt-20">
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  );
}