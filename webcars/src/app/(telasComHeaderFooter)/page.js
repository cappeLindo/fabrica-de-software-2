"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const [concessionarias, setConcessionarias] = useState([]);
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:9000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar concessionárias
        const concessionariasResponse = await fetch(`${API_BASE_URL}/concessionaria`);
        if (!concessionariasResponse.ok) throw new Error('Erro ao buscar concessionárias');
        const concessionariasData = await concessionariasResponse.json();

        const concessionariasWithImages = await Promise.all(
          concessionariasData.dados.map(async (conc) => {
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
        setConcessionarias(concessionariasWithImages.slice(0, 5));

        // Buscar carros
        const carrosResponse = await fetch(`${API_BASE_URL}/carro`);
        if (!carrosResponse.ok) throw new Error('Erro ao buscar carros');
        const carrosData = await carrosResponse.json();

        const carrosWithImages = await Promise.all(
          carrosData.dados.map(async (carro) => {
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
        setCarros(carrosWithImages.slice(0, 6));

        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar dados.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
            {concessionarias.map((concessionaria) => (
              <div className={styles.cards_cs} key={concessionaria.id}>
                <Image
                  src={concessionaria.imageUrl}
                  alt={concessionaria.nome}
                  width={100}
                  height={100}
                />
                <p>{concessionaria.nome}</p>
                <button><Link href="/TelaDaConcessionaria">veja mais</Link></button>
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
            {carros.map((carro) => (
              <div className={styles.card_carros} key={carro.id}>
                <Image
                  src={carro.imageUrl}
                  alt={carro.nome}
                  width={160}
                  height={120}
                />
                <p>{carro.nome}</p>
                <button><Link href="/descricaoProduto">veja mais</Link></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}