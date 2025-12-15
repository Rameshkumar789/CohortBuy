import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cohort - Supplier Portal',
  description: 'Manage your products and deals on Cohort',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
