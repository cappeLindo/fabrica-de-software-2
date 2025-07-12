"use client";

import { useState, useEffect, useMemo } from 'react';
import { useEstado } from '../../context/EstadoContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import valorUrl from '../../../rotaUrl.js';

export default function Home() {
  const [concessionarias, setConcessionarias] = useState([]);
  const [enderecos, setEnderecos] = useState([]);
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { estadoSelecionado } = useEstado();

  const API_BASE_URL = valorUrl;

  // (Removido: busca de estados, pois agora é global no Header)

  // Buscar concessionárias e carros conforme o estado selecionado
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Buscar todas as concessionárias
        const concessionariasResponse = await fetch(`${API_BASE_URL}/concessionaria`);
        if (!concessionariasResponse.ok) throw new Error('Erro ao buscar concessionárias');
        const concessionariasData = await concessionariasResponse.json();

        // Buscar todos os endereços
        const enderecosResponse = await fetch(`${API_BASE_URL}/endereco`);
        if (!enderecosResponse.ok) throw new Error('Erro ao buscar endereços');
        const enderecosData = await enderecosResponse.json();

        // Relacionar imagens às concessionárias
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
        setConcessionarias(concessionariasWithImages);
        setEnderecos(enderecosData.dados || []);

        // Buscar carros normalmente (mantém filtro por estado se necessário)
        const carrosResponse = await fetch(`${API_BASE_URL}/carro`);
        if (!carrosResponse.ok) throw new Error('Erro ao buscar carros');
        const carrosData = await carrosResponse.json();

        const carrosWithImages = await Promise.all(
          (carrosData.dados || []).map(async (carro) => {
            try {
              const imagemResponse = await fetch(`${API_BASE_URL}/carro/imagem/${carro.id}`);
              if (!imagemResponse.ok) throw new Error('Erro ao buscar imagem');
              const imageBlob = await imagemResponse.blob();
              const imageUrl = URL.createObjectURL(imageBlob);
              return { ...carro, imageUrl };
            } catch (err) {
              return { ...carro, imageUrl: '/images/VW-Gol-lateral.jpg' };
            }
          })
        );
        setCarros(carrosWithImages);

        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar dados.');
        setLoading(false);
      }
    }
    fetchData();
  }, [API_BASE_URL]);

  // Filtrar concessionárias pelo estado do endereço
  const concessionariasFiltradas = useMemo(() => {
    if (!estadoSelecionado) return concessionarias.slice(0, 5);
    return concessionarias.filter(conc => {
      const endereco = enderecos.find(e => e.id === conc.endereco_id);
      return endereco && endereco.estado === estadoSelecionado;
    }).slice(0, 5);
  }, [concessionarias, enderecos, estadoSelecionado]);

  // Filtrar carros pelo estado do endereço da concessionária
  const carrosFiltrados = useMemo(() => {
    if (!estadoSelecionado) return carros.slice(0, 6);
    return carros.filter(carro => {
      // Supondo que cada carro tem concessionaria_id
      const conc = concessionarias.find(c => c.id === carro.concessionaria_id);
      if (!conc) return false;
      const endereco = enderecos.find(e => e.id === conc.endereco_id);
      return endereco && endereco.estado === estadoSelecionado;
    }).slice(0, 6);
  }, [carros, concessionarias, enderecos, estadoSelecionado]);

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
          <li className={styles.menu_item}><Link href="/adicionarProduto">Vender</Link></li>
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
              <div className={styles.card_carros} key={carro.id}>
                <Image
                  src={carro.imageUrl}
                  alt={carro.nome || 'Imagem do carro'}
                  width={160}
                  height={120}
                />
                <p>{carro.nome}</p>
                <button><Link href={`/descricaoProduto?id=${carro.id}`}>veja mais</Link></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
