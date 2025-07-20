'use client';
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import styles from './meusAlertas.module.css';
import { Plus, Filter, Car, MoreVertical } from 'lucide-react';
import Cookies from "js-cookie";
import valorUrl from "../../../../rotaUrl";

export default function MeusAlertas() {
    const [alertas, setAlertas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [menuAbertoId, setMenuAbertoId] = useState(null);
    const userId = Cookies.get('id');

    useEffect(() => {
        if (userId) {
            buscarAlertas();
        }
    }, [userId]);

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

    const excluirAlerta = async (id) => {
        const confirmar = window.confirm("Tem certeza que deseja excluir este alerta?");
        if (!confirmar) return;

        try {
            const resposta = await fetch(`${valorUrl}/filtroAlerta/${id}`, {
                method: 'DELETE',
            });
            if (!resposta.ok) {
                throw new Error("Erro ao excluir alerta");
            }
            setAlertas(alertas.filter(alerta => alerta.id !== id));
        } catch (erro) {
            alert("Erro ao excluir o alerta.");
            console.error(erro);
        }
    };

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
                            <div key={alerta.id} className={styles.cardWrapper}>
                                <Link
                                    href={{
                                        pathname: '/editarAlerta',
                                        query: { id: alerta.id }
                                    }}
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

                                {/* Ícone de três pontos */}
                                <div className={styles.menuIcon} onClick={() => setMenuAbertoId(menuAbertoId === alerta.id ? null : alerta.id)}>
                                    <MoreVertical size={20} />
                                </div>

                                {/* Menu dropdown de exclusão */}
                                {menuAbertoId === alerta.id && (
                                    <div className={styles.menuDropdown}>
                                        <button onClick={() => excluirAlerta(alerta.id)}>Excluir</button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// Formata data para "DD/MM/AAAA"
function formatarData(dataISO) {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
        timeZone: 'America/Porto_Velho',
    });
}
