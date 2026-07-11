import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestor de Solicitudes",
  description: "Aplicación para administrar solicitudes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
          <Link href="/">Inicio</Link> |{" "}
          <Link href="/login">Login</Link> |{" "}
          <Link href="/register">Registro</Link> |{" "}
          <Link href="/solicitudes">Solicitudes</Link>
        </nav>

        {children}
      </body>
    </html>
  );
}