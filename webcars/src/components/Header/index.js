"use client"; // Garante que o código seja executado no lado do cliente

import { useState, useEffect } from "react";
import styles from "./header.module.css";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import { Menu } from "lucide-react";
import CarrinhoImg from "/public/images/carrinho.png";
import { usePathname } from "next/navigation"; // Importando usePathname para verificar a rota atual
import valorUrl from "../../../rotaUrl";
import { useRouter } from "next/navigation";

const SelectCidades = () => {
  const [cidade, setCidade] = useState("Vilhena");
  const [cidades, setCidades] = useState([])

  async function getCidades() {
    try {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/11/municipios')
      if (!response.ok) {
        throw new Error("Erro ao buscar dados:" + response.statusText);

      }
      const data = await response.json();
      setCidades(data)
    } catch (error) {
      console.log('Ocorreu algum erro:' + error)
    }
  }



  useEffect(() => {
    getCidades()
  }, [])

  return (
    <select
      name="cidades"
      className={styles.cidades}
      value={cidade}
      onChange={(e) => setCidade(e.target.value)}
    >
      {
        cidades.map((cidade) =>
          <option value={cidade.nome} key={`${cidade.nome}_key`}>{cidade.nome}</option>
        )
      }
    </select>
  );
};

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname(); // Obtém a rota atual

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    
    try {

      // Tenta como cliente
      let response = await fetch(`${valorUrl}/auth/cliente/logout`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });

      if (response.ok) {
        Cookies.remove('token');
        Cookies.remove('id');
        Cookies.remove('userType')
        toggleMenu();
        // Autenticado como cliente
        router.refresh();
        router.push('/'); // ou para o painel do cliente
        return;
      }

      // Se não deu, tenta como concessionária
      response = await fetch(`${valorUrl}/auth/concessionaria/logout`, {
        method: 'POST',
      });

      if (response.ok) {
        Cookies.remove('token');
        Cookies.remove('id');
        Cookies.remove('userType')
        toggleMenu();
        // Autenticado como concessionária]
        router.refresh();
        router.push('/'); // ou para o painel da concessionária
        return;
      }

      // Se chegou até aqui, quer dizer que os dois deram errado
      alert("Não foi possível efetuar o login. Verifique suas credenciais.");

    } catch (error) {
      console.error(error);
      alert("Ocorreu um erro na autenticação.");
    }
  };

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css"
        rel="stylesheet"
      />
      <div className={styles.header}>
        <Link href="/">
          <div className={styles.logo}>
            <Image src="/images/logo.png" alt="logo" width={60} height={60} />
          </div>
        </Link>


        <div className={styles.menuIcon} onClick={toggleMenu}>
          <Menu color="black" size={33} />
        </div>

        {/* Menu lateral */}
        <nav className={`${styles.menuLateral} ${menuOpen ? styles.open : ""}`}>
          <Link href="adicionarAlerta">Criar Filtro</Link>
          <Link href="perfil">Perfil</Link>
          <Link href="Suporte">Ajuda</Link>
          <button onClick={handleLogout}>Sair</button>
        </nav>

        {/* Exibindo o botão Voltar somente se não estiver na Home */}
        {pathname !== "/" && (
          <div className={`${styles.voltar} ${menuOpen ? styles.hidden : ""}`}>
            <Link href="/">Voltar</Link>
          </div>
        )}

        <div className={styles.localRegiao}>
          <i className="bi bi-geo-fill"></i>
          <SelectCidades />
        </div>

        <div className={styles.barraPesquisa}>
          <input type="text" placeholder="BUSCAR CARROS, MARCAS ETC..." />
          <button className={styles.lupa}>
            <i className="bi bi-search"></i>
          </button>
        </div>

        <div className={styles.entrarLogar}>
          <Link href="/TelaCadastroCliente">Criar sua conta</Link>
          <Link href="/telaLogin">Login</Link>
        </div>

        <div className={styles.perfilCarrinho}>
          <div className={styles.carrinho}>
            <Link href='/TelaDesejos' className={styles.perfil}>
              <Image src={CarrinhoImg} alt="carrinho" width={50} height={50} />
            </Link>
          </div>
          <div className={styles.perfil}>
            <Link href='/perfil' className={styles.linkPerfil}>
              <i className="bi bi-person-circle"></i>
            </Link>

          </div>
        </div>
      </div>
    </>
  );
}