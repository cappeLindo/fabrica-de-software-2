'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './decricao-produto.module.css';
import valorUrl from '../../../../rotaUrl';

const PLACEHOLDER_IMG = '/images/placeholder-car.png'; // certifique-se de que este arquivo exista em /public/images

export default function CarroDetalhes() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [carData, setCarData] = useState(null);
    const [carImages, setCarImages] = useState([]);
    const [currentImg, setCurrentImg] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setCarImages([]);
        setCurrentImg(0);
        if (!id) return;

        const fetchData = async () => {
            try {
                const carRes = await fetch(`${valorUrl}/carro/${id}`);
                if (!carRes.ok) throw new Error(`Erro ao buscar dados do carro: ${carRes.status}`);
                const { dados: carro } = await carRes.json();
                setCarData(carro);

                if (!carro.imagens || carro.imagens.length === 0) {
                    setCarImages([PLACEHOLDER_IMG]);
                    return;
                }

                console.log('carrolenght', carro.imagens.length);

                const imagensPromises = carro.imagens.map(async (element) => {
                    console.log('Buscando imagem para o ID:', element);
                    const imgRes = await fetch(`${valorUrl}/carro/imagem/${element}`);
                    if (imgRes.status === 404 || !imgRes.ok) {
                        return PLACEHOLDER_IMG;
                    }
                    const blob = await imgRes.blob();
                    return URL.createObjectURL(blob);
                });

                const results = await Promise.all(imagensPromises);

                const unicas = Array.from(new Set(results));
                setCarImages(unicas);

            } catch (err) {
                console.error('Erro ao buscar dados ou imagem:', err);
                setError(err.message);
                setCarImages([PLACEHOLDER_IMG]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);


    const nextImg = () => setCurrentImg((i) => (i + 1) % carImages.length);
    const prevImg = () => setCurrentImg((i) => (i - 1 + carImages.length) % carImages.length);
    const goToImg = (index) => setCurrentImg(index);
    const fmtDate = (str) => (str ? new Date(str).toLocaleDateString('pt-BR') : 'N/A');

    if (loading) return <p>Carregando dados do carro…</p>;
    if (error) return <p>Erro ao carregar dados do carro: {error}</p>;
    if (!carData) return <p>Nenhum dado de carro encontrado.</p>;

    const originalPrice = Number(carData.valor);
    const discountPct = 0.05;
    const discountedPrice = originalPrice * (1 - discountPct);
    const twoInstallments = originalPrice / 2;

    return (
        <>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet" />
            <div className={styles.container}>
                {/* IMAGENS */}
                <div className={styles.secaoImagens}>
                    <img
                        id="imagemPrincipal"
                        src={carImages[currentImg]}
                        alt={`Imagem ${currentImg + 1} de ${carData.carro_nome}`}
                    />
                    <div className={styles.carrosselImagens}>
                        {carImages.length > 1 && (
                            <img src="/images/seta esquerda.jpg" alt="Anterior" className={styles.botaoSeta} onClick={prevImg} />
                        )}
                        {carImages.map((src, idx) => (
                            <img
                                key={idx}
                                src={src}
                                alt={`Miniatura ${idx + 1}`}
                                className={`${styles.miniatura} ${idx === currentImg ? styles.miniaturaAtiva : ''}`}
                                onClick={() => goToImg(idx)}
                            />
                        ))}
                        {carImages.length > 1 && (
                            <img src="/images/seta direita.jpg" alt="Próxima" className={styles.botaoSeta} onClick={nextImg} />
                        )}
                    </div>
                </div>

                {/* PREÇOS */}
                <div className={styles.secaoPrecos}>
                    <h2>{carData.carro_nome} {carData.modelo_name}</h2>
                    <p className={styles.precoAntigo}>
                        R$ {originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <button className={styles.botaoLoja}>
                        <Link href={`/concessionaria/${carData.concessionaria_id}`} className={styles.botaoLoja1}>
                            Ver na Loja
                        </Link>
                    </button>
                </div>

                {/* CONTATOS */}
                <div className={styles.secaoContatos}>
                    <h3>Formas de Contato</h3>
                    <div className={styles.opcaoContato}>
                        <a href={`https://wa.me/55${carData.concessionaria_telefone}`} target="_blank" rel="noopener noreferrer">
                            <i className="bi-whatsapp" /> WhatsApp
                        </a>
                    </div>
                    <div className={styles.opcaoContato}>
                        <a href={`mailto:${carData.concessionaria_email}`}>
                            <i className="bi-envelope-fill" /> E‑mail Profissional
                        </a>
                    </div>
                </div>

                {/* DETALHES */}
                <div className={styles.detalhesCarro}>
                    <div className={styles.gridDetalhes}>
                        <div><p><strong>Marca</strong></p><p>{carData.marca_name}</p></div>
                        <div><p><strong>Modelo</strong></p><p>{carData.modelo_name}</p></div>
                        <div><p><strong>Cor</strong></p><p>{carData.cor_nome}</p></div>
                        <div><p><strong>Ano</strong></p><p>{carData.ano}</p></div>
                        <div><p><strong>Câmbio</strong></p><p>{carData.cambio_nome}</p></div>
                        <div><p><strong>Estado</strong></p><p>{carData.condicao}</p></div>
                        <div><p><strong>Categoria</strong></p><p>{carData.categoria_name}</p></div>
                        <div><p><strong>Aro</strong></p><p>{carData.aro_name}</p></div>
                        <div><p><strong>Quilometragem</strong></p><p>{carData.quilometragem?.toLocaleString('pt-BR') || 'N/A'}</p></div>
                        <div><p><strong>Combustível</strong></p><p>{carData.combustivel_name}</p></div>
                        <div><p><strong>Ano de Compra</strong></p><p>{fmtDate(carData.data_compra)}</p></div>
                        <div><p><strong>IPVA</strong></p><p>{carData.ipva_pago ? 'Pago' : 'Não Pago'}</p><p className={styles.detalheData}>Até {fmtDate(carData.data_ipva)}</p></div>
                        <div><p><strong>Blindagem</strong></p><p>{carData.blindagem ? 'Sim' : 'Não'}</p></div>
                    </div>
                </div>

                {/* ESPECIFICAÇÕES */}
                <div className={styles.secaoEspecificacoes}>
                    <h3>Detalhes</h3>
                    <div className={styles.mensagem}>
                        <p>{carData.detalhes_veiculo}</p>
                    </div>
                </div>
            </div>
        </>
    );
}
