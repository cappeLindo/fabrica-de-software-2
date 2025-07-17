'use client';
import { useState, useEffect } from 'react';
import styles from './header.module.css';
import Image from 'next/image';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { Menu } from 'lucide-react';
import CarrinhoImg from '/public/images/carrinho.png';
import { usePathname, useRouter } from 'next/navigation';
import valorUrl from '../../../rotaUrl';
import { useEstado } from '../../context/EstadoContext';

const SelectEstados = () => {
  const { estadoSelecionado, setEstadoSelecionado } = useEstado();
  const [estados, setEstados] = useState([]);

  useEffect(() => {
    async function fetchEstados() {
      try {
        const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
        if (!res.ok) throw new Error('Erro ao buscar estados');
        const data = await res.json();
        setEstados(data);
      } catch {
        setEstados([]);
      }
    }
    fetchEstados();
  }, []);

  return (
    <select
      name='estados'
      className={styles.cidades}
      value={estadoSelecionado}
      onChange={(e) => setEstadoSelecionado(e.target.value)}
    >
      <option value=''>Selecione um estado</option>
      {estados.map((estado) => (
        <option value={estado.sigla} key={estado.id}>
          {estado.nome}
        </option>
      ))}
    </select>
  );
};


export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [carros, setCarros] = useState([]);
  const [userId, setUserId] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [imagemPerfil, setImagemPerfil] = useState(null);

  const router = useRouter();
  const pathname = usePathname();

  // Garante que só monta no cliente
  useEffect(() => {
    setHasMounted(true);
    const storedId = Cookies.get('id');
    setUserId(storedId || null);

    if (storedId) {
      fetch(`${valorUrl}/cliente/imagem/${storedId}`).then((res) => {
        if (res.ok) {
          setImagemPerfil(`${valorUrl}/cliente/imagem/${storedId}`);
        } else {
          setImagemPerfil(null);
        }
      });
    }
  }, []);


  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = async () => {
    try {
      let response = await fetch(`${valorUrl}/auth/cliente/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Cookies.get('token')}` },
        credentials: 'include',
      });

      if (response.ok) {
        Cookies.remove('token');
        Cookies.remove('id');
        Cookies.remove('userType');
        setUserId(null);
        toggleMenu();
        router.refresh();
        router.push('/');
        return;
      }

      response = await fetch(`${valorUrl}/auth/concessionaria/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Cookies.get('token')}` },
      });

      if (response.ok) {
        Cookies.remove('token');
        Cookies.remove('id');
        Cookies.remove('userType');
        setUserId(null);
        toggleMenu();
        router.refresh();
        router.push('/');
        return;
      }

      alert('Não foi possível efetuar o logout.');
    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro no logout.');
    }
  };

  const buscarCarros = async (termo) => {
    if (!termo) {
      setCarros([]);
      return;
    }

    try {
      const url = `${valorUrl}/carro/`;
      console.log('Buscando carros em:', url);

      const res = await fetch(url, {
        headers: Cookies.get('token') ? { Authorization: `Bearer ${Cookies.get('token')}` } : {},
      });

      if (!res.ok) {
        throw new Error(`Erro ao buscar carros. Status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Resposta da API:', data);

      const carrosArray = Array.isArray(data) ? data : data.dados || data.results || [];
      const carrosFiltrados = carrosArray.filter((carro) =>
        carro.carro_nome.toLowerCase().includes(termo.toLowerCase())
      );

      setCarros(carrosFiltrados);
    } catch (error) {
      console.error('Erro ao buscar carros:', error);
      setCarros([]);
    }
  };


  return (
    <>
      <link href='https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css' rel='stylesheet' />

      <div className={styles.header}>
        <div className={styles.elementosEsquerda}>
          <Link href='/'>
            <div className={styles.logo}>
              <Image src='/images/logo.png' alt='logo' width={60} height={60} />
            </div>
          </Link>

          <div className={styles.menuIcon} onClick={toggleMenu}>
            <Menu color='black' size={33} />
          </div>

          <nav className={`${styles.menuLateral} ${menuOpen ? styles.open : ''}`}>
            <Link href='adicionarAlerta'>Criar Filtro</Link>
            <Link href={userId ? `/perfil?id=${userId}` : '/telaLogin'}>Perfil</Link>
            <button onClick={handleLogout}>Sair</button>
          </nav>
          <div className={styles.localRegiao}>
            <i className='bi bi-geo-fill'></i>
            <SelectEstados />
          </div>
        </div>


        {pathname !== '/' && (
          <div className={`${styles.voltar} ${menuOpen ? styles.hidden : ''}`}>
            <Link href='/'>Voltar</Link>
          </div>
        )}



        <div className={styles.barraPesquisa}>
          <input
            type='text'
            placeholder='BUSCAR CARROS, MARCAS ETC...'
            value={busca}
            onChange={(e) => {
              const termo = e.target.value;
              setBusca(termo);
              buscarCarros(termo);
            }}
          />
          <button className={styles.lupa}>
            <i className='bi bi-search'></i>
          </button>
        </div>
        <div className={styles.elementosDireita}>
          {hasMounted && !userId && (
            <div className={styles.entrarLogar}>
              <Link href='/TelaCadastroCliente'>Criar sua conta</Link>
              <Link href='/telaLogin'>Login</Link>
            </div>
          )}

          {hasMounted && (
            <div className={styles.perfilCarrinho}>
              <div className={styles.carrinho}>
                <Link href='/TelaDesejos' className={styles.perfil}>
                  <Image src={CarrinhoImg} alt='carrinho' width={50} height={50} />
                </Link>
              </div>
              <div className={styles.perfil}>
                <Link href={userId ? `/perfil?id=${userId}` : '/telaLogin'} className={styles.linkPerfil}>
                  {imagemPerfil ? (
                    <img className={styles.fotoPerfil} src={imagemPerfil} alt='imagem_perfil_usuario' />
                  ) : (
                    <i className='bi bi-person-circle'></i>
                  )}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {busca && (
        <div className={styles.resultadosBusca}>
          {carros.length > 0 ? (
            carros.map((carro) => (
              <div key={carro.id} className={styles.cardResultado}>
                <Link href={`/descricaoProduto?id=${carro.id}`}>
                  <p>
                    <strong>{carro.carro_nome}</strong>
                  </p>
                </Link>
              </div>
            ))
          ) : (
            <p style={{ marginLeft: '1rem' }}>Nenhum carro encontrado.</p>
          )}
        </div>
      )}
    </>
  );
};