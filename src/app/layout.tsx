// app/layout.tsx
import { Orbitron } from 'next/font/google';
import './globals.css';

// Load Orbitron (aggressive racing vibe)
const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-racing',
  weight: ['800', '900'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Add orbitron.variable to the <html> tag
    <html lang="en" className={`${orbitron.variable} dark`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}