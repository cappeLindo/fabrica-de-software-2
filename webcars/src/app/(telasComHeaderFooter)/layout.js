import Header from "@/components/Header/";
import Footer from "@/components/Footer/";
import styles from './estiloLayout.module.css';
export default function RootLayout({ children }) {
  return (
    <div className={styles.body}>
      <header>
        <Header />
      </header>
      <main className={styles.main}>
        {children}
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
