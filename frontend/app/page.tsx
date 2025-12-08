export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
      }}
    >
      <h1>Frontend Cartório</h1>
      <p>Aplicação Next.js está rodando corretamente.</p>
      <p>Em breve vamos integrar com a API do backend.</p>
    </main>
  );
}