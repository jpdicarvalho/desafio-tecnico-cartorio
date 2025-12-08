import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cartório - Painel de Pagamentos",
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
          {/* Header */}
          <header className="app-header">
            <div className="app-header-inner">
              {/* Logo + Nome do cartório */}
              <div className="header-brand">
                {/* Espaço reservado para a logo */}
                <div className="brand-logo-placeholder">
                  {/* Quando tiver logo, substitua por <Image /> ou <img /> */}
                  C1
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