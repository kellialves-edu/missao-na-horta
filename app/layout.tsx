import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Missão na Horta | Jogo de Ciências',
  description: 'Jogo educativo sobre as partes da planta e a origem dos alimentos para o 3º ano.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
