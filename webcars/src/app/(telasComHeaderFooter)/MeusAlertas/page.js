'use client';
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import styles from './meusAlertas.module.css';
import { Plus, Filter, Car } from 'lucide-react';
import Cookies from "js-cookie";
import valorUrl from "../../../../rotaUrl";

export default function MeusAlertas() {
    const [alertas, setAlertas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const userId = Cookies.get('id');

    useEffect(() => {
        const buscarAlertas = async () => {
            try {
                const resposta = await fetch(`${valorUrl}/filtroAlerta/cliente/${userId}`);
                if (!resposta.ok) {
                    throw new Error("Erro ao buscar alertas");
                }
                const dados = await resposta.json();
                setAlertas(dados);
            } catch (erro) {
                console.error(erro);
            } finally {
                setCarregando(false);
            }
        };

        if (userId) {
            buscarAlertas();
        }
    }, [userId]);

    return (
        <div className={styles.bodyMeusProdutos}>
            <h2>Meus Alertas</h2>
            <div className={styles.container}>
                <div className={styles.conteudoContainer}>
                    <Link href='/adicionarAlerta' id={styles.cardAdicionar}>
                        <div className={styles.conteudoCard}>
                            <div className={styles.iconesCard}>
                                <Plus />
                                <Filter />
                            </div>
                            <p>Adicionar Alerta</p>
                        </div>
                    </Link>

                    {carregando ? (
                        <p>Carregando alertas...</p>
                    ) : (
                        alertas.map((alerta) => (
                            <Link
                                href={{
                                    pathname: '/editarAlerta',
                                    query: { id: alerta.id }
                                }}
                                key={alerta.id}
                                className={styles.card}
                            >
                                <div className={styles.conteudoCard}>
                                    <div className={styles.iconesCard}>
                                        <Filter />
                                        <Car />
                                    </div>
                                    <p>{alerta.nome}</p>
                                    <div className={styles.valoresDatas}>
                                        <p>Criado em: {formatarData(alerta.criado_em_brasil)}</p>
                                        {alerta.atualizado_em_brasil && (
                                            <p>Última alteração: {formatarData(alerta.atualizado_em_brasil)}</p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// Função utilitária para formatar data em "DD/MM/AAAA"
function formatarData(dataISO) {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
        timeZone: 'America/Porto_Velho', // ou 'America/Sao_Paulo'
    });
}
