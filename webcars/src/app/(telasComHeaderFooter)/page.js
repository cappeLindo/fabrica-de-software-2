"use client";

import { useState, useEffect, useMemo } from 'react';
import { useEstado } from '../../context/EstadoContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import valorUrl from '../../../rotaUrl.js';
import { Heart } from "lucide-react";
import Cookies from 'js-cookie';

export default function Home() {
  const [concessionarias, setConcessionarias] = useState([]);
  const [enderecos, setEnderecos] = useState([]);
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [typeUser, settypeUser] = useState(null);
  const { estadoSelecionado } = useEstado();
  const API_BASE_URL = valorUrl;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Buscar concessionárias
        const concessionariasResponse = await fetch(`${API_BASE_URL}/concessionaria`);
        if (!concessionariasResponse.ok) throw new Error('Erro ao buscar concessionárias');
        const concessionariasData = await concessionariasResponse.json();

        // Buscar endereços
        const enderecosResponse = await fetch(`${API_BASE_URL}/endereco`);
        if (!enderecosResponse.ok) throw new Error('Erro ao buscar endereços');
        const enderecosData = await enderecosResponse.json();

        // Adicionar imagem (apenas se existir na rota)
        const concessionariasWithImages = await Promise.all(
          (concessionariasData.dados || []).map(async (conc) => {
            const imageUrl = `${API_BASE_URL}/concessionaria/imagem/${conc.id}`;
            try {
              const response = await fetch(imageUrl, { method: 'HEAD' });
              return { ...conc, imageUrl: response.ok ? imageUrl : '/images/fundo.jpg' };
            } catch {
              return { ...conc, imageUrl: '/images/fundo.jpg' };
            }
          })
        );

        // Buscar carros
        const carrosResponse = await fetch(`${API_BASE_URL}/carro`);
        if (!carrosResponse.ok) throw new Error('Erro ao buscar carros');
        const carrosData = await carrosResponse.json();

        // Adicionar imagem dos carros (se existir)
        const carrosWithImages = await Promise.all(
          (carrosData.dados || []).map(async (carro) => {
            try {
              const idImagem = carro.imagens?.[0];
              if (!idImagem) throw new Error('Sem imagem');
              const imageUrl = `${API_BASE_URL}/carro/imagem/${idImagem}`;
              const response = await fetch(imageUrl, { method: 'HEAD' });
              return { ...carro, imageUrl: response.ok ? imageUrl : '/images/VW-Gol-lateral.jpg' };
            } catch {
              return { ...carro, imageUrl: '/images/VW-Gol-lateral.jpg' };
            }
          })
        );

        setConcessionarias(concessionariasWithImages);
        setEnderecos(enderecosData.dados || []);
        setCarros(carrosWithImages);
        settypeUser(Cookies.get('typeUser') || null);
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
      return endereco?.estado === estadoSelecionado;
    }).slice(0, 5);
  }, [concessionarias, enderecos, estadoSelecionado]);

  const carrosFiltrados = useMemo(() => {
    if (!estadoSelecionado) return carros.slice(0, 6);
    return carros.filter(carro => {
      const conc = concessionarias.find(c => c.id === carro.concessionaria_id);
      const endereco = conc && enderecos.find(e => e.id === conc.endereco_id);
      return endereco?.estado === estadoSelecionado;
    }).slice(0, 6);
  }, [carros, concessionarias, enderecos, estadoSelecionado]);

  function toggleFavorito(id) {
    setFavoritos(prev => (
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    ));
  }

  return (
    <div>
      <nav className={styles.nav}>
        <ul className={styles.menu}>
          <li className={styles.menu_item}>
            <Link href="/telaFiltroCarrosVGC">Categorias</Link>
            <ul className={styles.dropdown}>
              {[1, 2, 3, 4, 5].map(num => (
                <li key={num}><Link href="#">Categoria {num}</Link></li>
              ))}
            </ul>
          </li>
          <li className={styles.menu_item}><Link href="/telaFiltroCarrosVGC">Catálogo 0Km</Link></li>
          <li className={styles.menu_item}><Link href="/telaFiltroCarrosVGC">Seminovos</Link></li>
          <li className={styles.menu_item}>
            {typeUser === 'concessionaria'
              ? <Link href="/adicionarProduto">Vender</Link>
              : <Link href="/adicionarAlerta">Criar Filtro</Link>}
          </li>
        </ul>
      </nav>

      <div className={styles.destaque}>
        <h1>Concessionárias em destaque</h1>
        {loading && <p>Carregando...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && (
          <div className={styles.fundo_cards}>
            {concessionariasFiltradas.length === 0 && (
              <p>Nenhuma concessionária encontrada para este estado.</p>
            )}
            {concessionariasFiltradas.map(conc => (
              <div className={styles.cards_cs} key={conc.id}>
                <Image
                  src={conc.imageUrl}
                  alt={conc.nome || 'Imagem da concessionária'}
                  width={100}
                  height={100}
                />
                <p>{conc.nome}</p>
                <button><Link href={`/TelaDaConcessionaria?id=${conc.id}`}>veja mais</Link></button>
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
            {carrosFiltrados.map(carro => {
              const isFavorito = favoritos.includes(carro.id);
              return (
                <div className={styles.card_carros} key={carro.id}>
                  <div
                    className={`${styles.heart_icon} ${isFavorito ? styles.favoritado : ''}`}
                    onClick={() => toggleFavorito(carro.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') toggleFavorito(carro.id); }}
                    aria-label={isFavorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                  >
                    <Heart
                      size={20}
                      color={isFavorito ? '#fff' : '#aaa'}
                      fill={isFavorito ? '#e63946' : 'none'}
                    />
                  </div>
                  <Image
                    src={carro.imageUrl}
                    alt={carro.carro_nome || carro.nome || 'Imagem do carro'}
                    width={160}
                    height={120}
                  />
                  <p>{carro.carro_nome || carro.nome}</p>
                  <button><Link href={`/descricaoProduto?id=${carro.id}`}>veja mais</Link></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
