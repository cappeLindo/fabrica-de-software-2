'use client';
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import style from './listaDesejos.module.css';
import Image from "next/image";
import valorUrl from "../../../../rotaUrl";
import Cookies from 'js-cookie';
import { Heart } from "lucide-react";
import CardCarro from "@/components/CardCarro";
export default function TelaDesejos() {
    const [carrosFavoritos, setCarrosFavoritos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = valorUrl;

    // Buscar favoritos do cliente
    useEffect(() => {
        async function fetchFavoritos() {
            setLoading(true);
            setError(null);
            try {
                const idCliente = Cookies.get('id');
                const response = await fetch(`${API_BASE_URL}/favoritosCarros/cliente/${idCliente}`, {
                    method: 'GET',
                    credentials: 'include', // importante para enviar cookie HTTP-only
                });

                if (!response.ok) throw new Error('Erro ao buscar favoritos');

                const data = await response.json();
                // data.dados deve ser array de objetos que inclui carro_id, carro_nome, imagens etc

                // Para cada favorito, precisamos carregar a imagem do carro (como no Home)
                const carrosComImagem = await Promise.all(
                    data.dados.map(async (fav) => {
                        try {
                            // Supondo que fav.imagens é array de ids de imagem, pegar a primeira
                            const idImagem = fav.imagens?.[0];
                            if (!idImagem) throw new Error('Sem imagem');

                            const imagemResponse = await fetch(`${API_BASE_URL}/carro/imagem/${idImagem}`);
                            if (!imagemResponse.ok) throw new Error('Erro ao buscar imagem');

                            const imageBlob = await imagemResponse.blob();
                            const imageUrl = URL.createObjectURL(imageBlob);

                            return { ...fav, imageUrl };
                        } catch {
                            return { ...fav, imageUrl: '/images/VW-Gol-lateral.jpg' };
                        }
                    })
                );

                setCarrosFavoritos(carrosComImagem);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        }

        fetchFavoritos();
    }, [API_BASE_URL]);

    // Função para remover carro dos favoritos (toggle)
    async function toggleFavorito(idCarro) {
        try {
            const idCliente = Cookies.get('id'); // para seu backend atual, necessário

            const response = await fetch(`${API_BASE_URL}/favoritosCarros/clienteECarro/${idCliente}/${idCarro}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Erro ao remover favorito');
            }

            // Atualizar estado removendo o carro da lista
            setCarrosFavoritos((prev) => prev.filter(carro => carro.carro_id !== idCarro));
        } catch (err) {
            alert('Erro ao remover favorito: ' + err.message);
        }
    }

    if (loading) return <p className={style.loading}>Carregando favoritos...</p>;
    if (error) return <p className={style.error}>Erro: {error}</p>;
    const isFavorito = true;
    return (
        <>
            <h1 className={style.titulo}>LISTA DE DESEJO</h1>

            <div className={style.container}>
                <div className={style.fundoCarro}>

                    {carrosFavoritos.length === 0 && <p>Você não possui carros favoritos.</p>}
                    {carrosFavoritos.map((carro) => (
                        <CardCarro
                            key={carro.carro_id}
                            carro={carro}
                            isFavorito={true}
                            onToggleFavorito={() => toggleFavorito(carro.carro_id)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
