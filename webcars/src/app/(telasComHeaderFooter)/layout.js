import Header from "@/components/Header/";
import Footer from "@/components/Footer/";

export default function RootLayout({ children }) {
  return (
    <div>
      <header>
        <Header />
      </header>
      <main>
        {children}
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
