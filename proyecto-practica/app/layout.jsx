import './globals.css';
import { Roboto } from 'next/font/local';

const roboto = Roboto({
  src: [
    {
      path: '../public/fonts/Roboto-Regular.ttf',
      weight: '500',
    },
  ],
  variable: '--font-roboto',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>{children}</body>
    </html>
  );
}