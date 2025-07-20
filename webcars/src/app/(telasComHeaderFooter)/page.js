"use client";

import { useState, useEffect, useMemo } from 'react';
import { useEstado } from '../../context/EstadoContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import valorUrl from '../../../rotaUrl.js';
import { Heart } from "lucide-react";
import Cookies from 'js-cookie';
import CardCarro from '../../components/CardCarro'; // ajuste o caminho conforme a organização da sua pasta
export default function Home() {
  const [concessionarias, setConcessionarias] = useState([]);
  const [enderecos, setEnderecos] = useState([]);
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritos, setFavoritos] = useState([]);  // <-- Estado para favoritos
  const [typeUser, settypeUser] = useState(null);
  const { estadoSelecionado } = useEstado();

  const API_BASE_URL = valorUrl;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const concessionariasResponse = await fetch(`${API_BASE_URL}/concessionaria`);
        if (!concessionariasResponse.ok) throw new Error('Erro ao buscar concessionárias');
        const concessionariasData = await concessionariasResponse.json();

        const enderecosResponse = await fetch(`${API_BASE_URL}/endereco`);
        if (!enderecosResponse.ok) throw new Error('Erro ao buscar endereços');
        const enderecosData = await enderecosResponse.json();

        const concessionariasWithImages = await Promise.all(
          (concessionariasData.dados || []).map(async (conc) => {
            try {
              const imageResponse = await fetch(`${API_BASE_URL}/concessionaria/imagem/${conc.id}`);
              if (!imageResponse.ok) throw new Error('Erro ao buscar imagem');
              const imageBlob = await imageResponse.blob();
              const imageUrl = URL.createObjectURL(imageBlob);
              return { ...conc, imageUrl };
            } catch (err) {
              return { ...conc, imageUrl: '/images/fundo.jpg' };
            }
          })
        );
        const storedTypeUser = Cookies.get('typeUser');
        settypeUser(storedTypeUser || null)
        setConcessionarias(concessionariasWithImages);
        setEnderecos(enderecosData.dados || []);

        const carrosResponse = await fetch(`${API_BASE_URL}/carro`);
        if (!carrosResponse.ok) throw new Error('Erro ao buscar carros');
        const carrosData = await carrosResponse.json();

        const carrosWithImages = await Promise.all(
          (carrosData.dados || []).map(async (carro) => {
            try {
              const idImagem = carro.imagens?.[0];
              if (!idImagem) throw new Error('Sem imagem');

              const imagemResponse = await fetch(`${API_BASE_URL}/carro/imagem/${idImagem}`);
              if (!imagemResponse.ok) throw new Error('Erro ao buscar imagem');
              const imageBlob = await imagemResponse.blob();
              const imageUrl = URL.createObjectURL(imageBlob);

              return { ...carro, imageUrl };
            } catch (err) {
              return { ...carro, imageUrl: '/images/VW-Gol-lateral.jpg' };
            }
          })
        );
        if (storedTypeUser === 'cliente') {
          try {
            const idCliente = Cookies.get('id');
            const favoritosResponse = await fetch(`${API_BASE_URL}/favoritosCarros/cliente/${idCliente}`, {
              method: 'GET',
              credentials: 'include',
            });

            if (favoritosResponse.ok) {
              const favoritosData = await favoritosResponse.json();
              const ids = favoritosData.dados.map(f => f.carro_id);
              setFavoritos(ids);
            }
          } catch (err) {
            console.error('Erro ao buscar favoritos:', err.message);
          }
        }
        setCarros(carrosWithImages);
        setLoading(false);

      } catch (err) {
        setError('Erro ao carregar dados.');
        setLoading(false);
      }
    }

    fetchData();
  }, [API_BASE_URL]);

  const concessionariasFiltradas = useMemo(() => {
    if (!estadoSelecionado) return concessionarias.slice(0, 5);
    return concessionarias.filter(conc => {
      const endereco = enderecos.find(e => e.id === conc.endereco_id);
      return endereco && endereco.estado === estadoSelecionado;
    }).slice(0, 5);
  }, [concessionarias, enderecos, estadoSelecionado]);

  const carrosFiltrados = useMemo(() => {
    if (!estadoSelecionado) return carros.slice(0, 6);
    return carros.filter(carro => {
      const conc = concessionarias.find(c => c.id === carro.concessionaria_id);
      if (!conc) return false;
      const endereco = enderecos.find(e => e.id === conc.endereco_id);
      return endereco && endereco.estado === estadoSelecionado;
    }).slice(0, 6);
  }, [carros, concessionarias, enderecos, estadoSelecionado]);

  // Função para alternar favorito
  async function toggleFavorito(idCarro) {
    const isFavorito = favoritos.includes(idCarro);
    const idCliente = Cookies.get('id'); // ID salvo no login, visível

    const url = isFavorito
      ? `${API_BASE_URL}/favoritosCarros/clienteECarro/${idCliente}/${idCarro}`
      : `${API_BASE_URL}/favoritosCarros/${idCliente}`;

    const options = {
      method: isFavorito ? 'DELETE' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // envia o cookie HTTP-only
      body: isFavorito ? null : JSON.stringify({ idCarro }),
    };

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro?.error || 'Erro ao processar favorito');
      }

      // Atualiza visualmente
      setFavoritos((prev) =>
        isFavorito ? prev.filter((id) => id !== idCarro) : [...prev, idCarro]
      );
    } catch (err) {
      console.log(idCliente, idCarro)
      alert('Você precisa estar logado como cliente para usar favoritos.');
      console.error('Erro ao alterar favorito:', err.message);
    }
  }

  return (
    <div>
      <nav className={styles.nav}>
        <ul className={styles.menu}>
          <li className={styles.menu_item}>
            <Link href="/telaFiltroCarrosVGC">Categorias</Link>
            <ul className={styles.dropdown}>
              {[1, 2, 3, 4, 5].map((num) => (
                <li key={num}><Link href="#">Categoria {num}</Link></li>
              ))}
            </ul>
          </li>
          <li className={styles.menu_item}><Link href="/telaFiltroCarrosVGC">Catálogo 0Km</Link></li>
          <li className={styles.menu_item}><Link href="/telaFiltroCarrosVGC">Seminovos</Link></li>
          <li className={styles.menu_item}>{typeUser && typeUser == 'concessionaria' ? <Link href="/adicionarProduto">Vender</Link> : <Link href='adicionarAlerta'>Criar Filtro</Link>}</li>
        </ul>
      </nav>

      <div className={styles.destaque}>
        <h1>Concessionárias em destaque</h1>
        {loading && <p>Carregando...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && (
          <div className={styles.fundo_cards}>
            {concessionariasFiltradas.length === 0 && <p>Nenhuma concessionária encontrada para este estado.</p>}
            {concessionariasFiltradas.map((concessionaria) => (
              <div className={styles.cards_cs} key={concessionaria.id}>
                <Image
                  src={concessionaria.imageUrl}
                  alt={concessionaria.nome || 'Imagem da concessionária'}
                  width={100}
                  height={100}
                />
                <p>{concessionaria.nome}</p>
                <button><Link href={`/TelaDaConcessionaria?id=${concessionaria.id}`}>veja mais</Link></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.carros_em_destaque}>
        <h1>Carros em destaque</h1>
        {loading && <p>Carregando...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && (
          <div className={styles.fundo_carros}>
            {carrosFiltrados.length === 0 && <p>Nenhum carro encontrado para este estado.</p>}
            {carrosFiltrados.map((carro) => (
              <CardCarro
                key={carro.id}
                carro={carro}
                isFavorito={favoritos.includes(carro.id)}
                onToggleFavorito={toggleFavorito}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
