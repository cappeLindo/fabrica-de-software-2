'use client';
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from "./TelaDaConcessionaria.module.css";

const TelaDaConcessionaria = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [concessionaria, setConcessionaria] = useState(null);
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fotoConcessionaria, setFotoConcessionaria] = useState(null);

  const API_BASE_URL = 'http://localhost:9000';

  useEffect(() => {
    if (!id) return;

    const fetchConcessionaria = async () => {
      try {
        // Dados da concessionária
        const resConcessionaria = await fetch(`${API_BASE_URL}/concessionaria/${id}`);
        if (!resConcessionaria.ok) throw new Error('Erro ao buscar concessionária');
        const dataConcessionaria = await resConcessionaria.json();
        setConcessionaria(dataConcessionaria.dados);

        // Imagem da concessionária
        const resImagem = await fetch(`${API_BASE_URL}/concessionaria/imagem/${id}`);
        if (resImagem.ok) {
          const blob = await resImagem.blob();
          setFotoConcessionaria(URL.createObjectURL(blob));
        }

        // Carros da concessionária
        const resCarros = await fetch(`${API_BASE_URL}/carro?concessionaria_id=${id}`);
        if (!resCarros.ok) throw new Error('Erro ao buscar carros');
        const dataCarros = await resCarros.json();

        const carrosComImagem = await Promise.all(
          dataCarros.dados.map(async (carro) => {
            try {
              const resImg = await fetch(`${API_BASE_URL}/carro/imagem/${carro.id}`);
              if (!resImg.ok) throw new Error('Erro ao buscar imagem');
              const blob = await resImg.blob();
              const imageUrl = URL.createObjectURL(blob);
              return { ...carro, imageUrl };
            } catch {
              return { ...carro, imageUrl: '/images/VW-Gol-lateral.jpg' };
            }
          })
        );

        setCarros(carrosComImagem);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConcessionaria();
  }, [id]);

  if (loading) return <div className={styles.loading}>Carregando...</div>;
  if (error) return <div className={styles.error}>Erro: {error}</div>;
  if (!concessionaria) return <div className={styles.error}>Concessionária não encontrada.</div>;

  return (
    <main className={styles.conteudoPrincipal}>
      <section className={styles.secaoFoto}>
        <div className={styles.containerFoto}>
          {fotoConcessionaria ? (
            <Image
              src={fotoConcessionaria}
              alt={`Imagem da ${concessionaria.nome || 'concessionária'}`}
              width={600}
              height={300}
              className={styles.imagemConcessionaria}
            />
          ) : (
            <p className={styles.textoFoto}>Foto da concessionária indisponível</p>
          )}
        </div>
      </section>

      <section className={styles.secaoInformacoes}>
        <div className={styles.containerSobre}>
          <h2>Sobre</h2>
          <div className={styles.conteudoSobre}>
            <p><strong>Nome:</strong> {concessionaria.nome}</p>
            <p><strong>Localidade:</strong> {concessionaria.localidade || 'Porto Velho, RO'}</p>
            <p><strong>Horário:</strong> 08 às 20 horas</p>
            <p><strong>Telefone:</strong> {concessionaria.telefone}</p>
            <p><strong>Carros anunciados:</strong> {carros.length}</p>
          </div>
        </div>
        <div className={styles.containerContatos}>
          <h2>Contatos</h2>
          <div className={styles.itemContato}>
            <i className="bi bi-whatsapp"></i> Agende um horário
          </div>
          <div className={styles.itemContato}>
            <i className="bi bi-instagram"></i> Veja mais sobre
          </div>
          <div className={styles.itemContato}>
            <i className="bi bi-facebook"></i> Veja mais sobre
          </div>
        </div>
      </section>

      <section className={styles.secaoProdutos}>
        <h2>Produtos do vendedor</h2>
        <div className={styles.containerProdutos}>
          {carros.length > 0 ? (
            carros.map((carro) => (
              <div key={carro.id} className={styles.cartaoProduto}>
                <Image
                  src={carro.imageUrl}
                  alt={carro.nome || 'Imagem do carro'}
                  width={160}
                  height={120}
                />
                <p>{carro.nome}</p>
                <button>
                  <Link href={`/descricaoProduto/${carro.id}`}>Veja mais</Link>
                </button>
              </div>
            ))
          ) : (
            <p>Nenhum carro anunciado por esta concessionária.</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default TelaDaConcessionaria;
