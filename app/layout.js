import { Kanit, IBM_Plex_Sans_Thai, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const head = Kanit({ subsets: ['thai', 'latin'], weight: ['500', '700'], variable: '--font-head' });
const body = IBM_Plex_Sans_Thai({ subsets: ['thai', 'latin'], weight: ['400', '600'], variable: '--font-body' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata = { title: { default: 'Roblox Creator Hub', template: '%s | Roblox Creator Hub' }, description: 'เส้นทางจากผู้เล่นสู่ผู้สร้างเกมบน Roblox Studio' };

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={`${head.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
