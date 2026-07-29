// app/layout.tsx
import { Orbitron, Geist } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


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
    <html lang="en" className={cn("dark", orbitron.variable, "font-sans", geist.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  );
}