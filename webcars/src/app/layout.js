import "./globals.css";
import { Suspense } from 'react';
export const metadata = {
  title: "Web Cars", // Título da página
  description: "The best repository made by students on IFRO", // Descrição da página
  keywords: ["cars", "IFRO", "repository"], // Palavras-chave relevantes para a página
  author: "Hiago, Nathan, Julia, Vitor, Maria e Carlos", // Autor do conteúdo
  viewport: "width=device-width, initial-scale=1.0", // Configurações de exibição para dispositivos móveis
  charset: "UTF-8", // Codificação de caracteres
};

export default function RootLayout({ children }) {
  return (

    <html lang="pt-br">
      <Suspense fallback={<div>Carregando...</div>}>
        <body>
          {children}
        </body>
      </Suspense >
    </html>

  );
}
