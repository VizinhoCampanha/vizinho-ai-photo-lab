import "./globals.css";

export const metadata = {
  title: "Worm Graphics — Sua moto. Sua identidade.",
  description: "Gráficos e identidade visual personalizados para motos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
