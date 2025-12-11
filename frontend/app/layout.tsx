import type { Metadata } from "next";
import Image from "next/image";

import "./styles/globals.css";
import "./styles/header.css";
import "./styles/page.css";
import "./styles/table.css";
import "./styles/modal.css";
import "./styles/dropdown.css";
import "./styles/details.css";
import "./styles/layout.css";

export const metadata: Metadata = {
  title: "Cartório 1º Ofício de Notas e Registro de Imóveis de Santarém - PA",
  description:
    "Gestão de pagamentos do Cartório 1º Ofício de Notas e Registro de Imóveis de Santarém - PA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="body-root">
        <div className="app-shell">
          <header className="app-header">
            <div className="app-header-inner">
              <div className="header-brand">
                <div className="brand-logo-placeholder">
                  <Image
                    src="/logo-cartorio.png"
                    alt="Cartório 1º Ofício - Notas e Registro de Imóveis"
                    width={52}
                    height={52}
                    className="brand-logo"
                    priority
                  />
                </div>

                <div className="brand-text">
                  <span className="brand-kicker">Painel financeiro</span>
                  <h1 className="brand-title">
                    Cartório{" "}
                    <span className="brand-title-accent">
                      1º Ofício de Notas e Registro de Imóveis
                    </span>
                    <span className="brand-subtitle">Santarém - PA</span>
                  </h1>
                </div>
              </div>

              {/* Área para status / ações globais */}
              <div className="header-status">
                <span className="header-env">Ambiente de testes</span>
                <span className="header-status-pill">
                  <span className="header-status-dot" /> Online
                </span>
              </div>
            </div>
          </header>

          {/* Conteúdo principal */}
          <main className="app-main">
            <div className="app-main-inner">
              <div className="app-card">{children}</div>
            </div>
          </main>

          {/* Footer */}
          <footer className="app-footer">
            <div className="app-footer-inner">
              <span>
                © {new Date().getFullYear()} Cartório 1º Ofício - Santarém - PA
              </span>
              <span className="app-footer-secondary">
                Desafio técnico – Gestão de pagamentos
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}