'use client';
import React, { useState, useEffect } from "react";
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import styles from './decricao-produto.module.css';

const DescricaoProduto = () => {
  const searchParams = useSearchParams();
  const carroId = searchParams.get('id'); // ID do carro via query param
  const API_BASE_URL = 'https://webcars.dev.vilhena.ifro.edu.br/api';

  const [carro, setCarro] = useState(null);
  const [concessionaria, setConcessionaria] = useState(null);
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!carroId) {
      setError('ID do carro não fornecido.');
      setLoading(false);
      return;
    }

    const fetchCarroData = async () => {
      try {
        // Buscar dados do carro
        const resCarro = await fetch(`${API_BASE_URL}/carro/${carroId}`);
        if (!resCarro.ok) throw new Error('Erro ao buscar dados do carro');
        const dataCarro = await resCarro.json();
        setCarro(dataCarro.dados);

        // Buscar concessionária associada
        const resConcessionaria = await fetch(`${API_BASE_URL}/concessionaria/${dataCarro.dados.concessionaria_id}`);
        if (!resConcessionaria.ok) throw new Error('Erro ao buscar concessionária');
        const dataConcessionaria = await resConcessionaria.json();
        setConcessionaria(dataConcessionaria.dados);

        // Buscar imagens do carro (assumindo múltiplas imagens)
        // Nota: Ajuste o endpoint se a API tiver uma rota específica para múltiplas imagens
        const imageIds = [1, 2, 3, 4, 5]; // Simulação de IDs de imagens (ajuste conforme a API)
        const imagePromises = imageIds.map(async (_, index) => {
          try {
            const resImg = await fetch(`${API_BASE_URL}/carro/imagem/${carroId}?index=${index}`);
            if (!resImg.ok) throw new Error('Erro ao buscar imagem');
            const blob = await resImg.blob();
            return URL.createObjectURL(blob);
          } catch {
            return '/images/VW-Gol-lateral.jpg'; // Imagem padrão em caso de erro
          }
        });
        const imageUrls = await Promise.all(imagePromises);
        setImages(imageUrls);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarroData();
  }, [carroId]);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const changeImage = (index) => {
    setCurrentImageIndex(index);
  };

  if (loading) return <div className={styles.loading}>Carregando...</div>;
  if (error) return <div className={styles.error}>Erro: {error}</div>;
  if (!carro) return <div className={styles.error}>Carro não encontrado.</div>;

  return (
    <>
      <Head>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet" />
      </Head>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.secaoImagens}>
            {images.length > 0 ? (
              <Image
                id="imagemPrincipal"
                src={images[currentImageIndex]}
                alt={`Imagem principal do ${carro.nome || 'carro'}`}
                width={600}
                height={400}
                className={styles.imagemPrincipal}
              />
            ) : (
              <p>Imagem indisponível</p>
            )}
            <div className={styles.carrosselImagens}>
              <img
                src="/images/seta esquerda.jpg"
                alt="Seta para esquerda"
                className={styles.botaoSeta}
                onClick={handlePreviousImage}
              />
              {images.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Miniatura ${index + 1}`}
                  className={`${styles.miniatura} ${index === currentImageIndex ? styles.miniaturaAtiva : ''}`}
                  onClick={() => changeImage(index)}
                />
              ))}
              <img
                src="/images/seta direita.jpg"
                alt="Seta para direita"
                className={styles.botaoSeta}
                onClick={handleNextImage}
              />
            </div>
          </div>

          <div className={styles.secaoPrecos}>
            <h2>{carro.nome || 'Carro'}</h2>
            <p className={styles.precoAntigo}>R$ {carro.preco_antigo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 'N/A'}</p>
            <p className={styles.desconto}>-{carro.desconto || 0}%</p>
            <p className={styles.precoNovo}>
              R$ {carro.preco_novo?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 'N/A'} <span className={styles.detalheDesconto}>à vista</span>
            </p>
            <p className={styles.textoOu}>ou</p>
            <p className={styles.parcelas}>{carro.parcelas || 'N/A'} sem juros</p>
            <button className={styles.botaoListaDesejos}>
              <Link href="/TelaDesejos">Adicionar à Lista de Desejos</Link>
            </button>
            <button className={styles.botaoLoja}>
              <Link href={`/TelaDaConcessionaria?id=${carro.concessionaria_id}`}>Ver na Loja</Link>
            </button>
          </div>

          <div className={styles.secaoContatos}>
            <h3>Formas de Contato</h3>
            <div className={styles.opcaoContato}>
              <a href={`https://wa.me/${concessionaria?.telefone || '5511999999999'}`} target="_blank" rel="noopener noreferrer">
                <i className="bi-whatsapp"></i>
                WhatsApp
              </a>
            </div>
            <div className={styles.opcaoContato}>
              <a href={`mailto:${concessionaria?.email || 'profissional@email.com'}`}>
                <div className={styles.gmail}>
                  <i className="bi-envelope-fill"></i>
                </div>
                E-mail Profissional
              </a>
            </div>
          </div>

          <div className={styles.detalhesCarro}>
            <div className={styles.gridDetalhes}>
              <div>
                <p><strong>Marca</strong></p>
                <p>{carro.marca || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Modelo</strong></p>
                <p>{carro.modelo || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Ano</strong></p>
                <p>{carro.ano || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Câmbio</strong></p>
                <p>{carro.cambio || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Estado</strong></p>
                <p>{carro.estado || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Categoria</strong></p>
                <p>{carro.categoria || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Aro</strong></p>
                <p>{carro.aro || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Quilometragem</strong></p>
                <p>{carro.quilometragem?.toLocaleString('pt-BR') || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Tipo de Combustível</strong></p>
                <p>{carro.tipo_combustivel || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Ano de Compra</strong></p>
                <p>{carro.ano_compra || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Seguro</strong></p>
                <p>{carro.seguro ? 'Sim' : 'Não'}</p>
                {carro.seguro && <p className={styles.detalheData}>Até {carro.seguro_data || 'N/A'}</p>}
              </div>
              <div>
                <p><strong>IPVA</strong></p>
                <p>{carro.ipva ? 'Pago' : 'Não pago'}</p>
                {carro.ipva && <p className={styles.detalheData}>Até {carro.ipva_data || 'N/A'}</p>}
              </div>
              <div>
                <p><strong>Blindagem</strong></p>
                <p>{carro.blindagem ? 'Sim' : 'Não'}</p>
              </div>
            </div>
          </div>

          <div className={styles.secaoEspecificacoes}>
            <h3>Detalhes</h3>
            <div className={styles.mensagem}>
              <p>{carro.especificacoes || 'Especificações gerais do carro'}</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default DescricaoProduto;