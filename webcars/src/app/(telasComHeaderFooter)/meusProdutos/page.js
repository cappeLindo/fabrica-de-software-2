'use client';

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';
import styles from './meus-produtos.module.css';
import valorUrl from '../../../../rotaUrl.js';

const MeusProdutos = () => {
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [showButtons, setShowButtons] = useState(null);
  const API_BASE_URL = valorUrl;

  const buscarMeusCarros = async () => {
    try {
      const id = Cookies.get('id');
      const type = Cookies.get('typeUser');

      if (!id || type !== 'concessionaria') {
        setErro('Você precisa estar logado como uma concessionária para acessar essa página.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/carro/concessionaria/${id}`);
      if (!res.ok) {
        // Check for 404 specifically, as it means no cars found, not a server error
        if (res.status === 404) {
          setCarros([]); // Explicitly set to empty array if 404 (no cars found)
        } else {
          throw new Error('Erro ao buscar carros da concessionária');
        }
      } else {
        const data = await res.json();
        setCarros(data.dados || []);
        console.log(carros)
      }
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarMeusCarros();
  }, []);

  const removerCarro = async (idCarro) => {
    if (!confirm('Tem certeza que deseja excluir este carro?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/carro/${idCarro}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Erro ao deletar o carro');
      alert('Carro removido com sucesso!');
      buscarMeusCarros(); // Re-fetch cars after deletion
    } catch (err) {
      alert('Erro: ' + err.message);
    }
  };

  const toggleButtons = (index) => {
    setShowButtons(showButtons === index ? null : index);
  };

  if (loading) return <div className={styles.loading}>Carregando seus produtos...</div>;
  if (erro) return <div className={styles.error}>Erro: {erro}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>Meus Produtos</h1>
      <div className={styles.fundoCarro}>
        {/* Always show the Add Product card */}
        <div className={styles.cardCarros}>
          <Image src="/images/Plus.png" alt="imagePlus" width={70} height={70} className={styles.imagemPlus} />
          <Link href="/adicionarProduto">
            <button className={styles.bot}>Adicionar</button>
          </Link>
        </div>

        {/* Conditional rendering for no cars */}
        {carros.length === 0 ? (
          <div className={styles.noProductsMessage}>
          </div>
        ) : (
          // Map through cars if there are any
          carros.map((carro, index) => (
            <div key={carro.id} className={styles.cardCarros}>
              <div className={styles.imageContainer}>
                <img
                  src={carro.imagens
                    ? `${valorUrl}/carro/imagem/${carro.imagens[0]}`
                    : '/images/placeholder-car.png'}
                  alt={carro.carro_nome}
                  className={styles.imagemCarro}
                />
                <i
                  className={`bi bi-three-dots ${styles.icon}`}
                  onClick={() => toggleButtons(index)}
                ></i>
                {showButtons === index && (
                  <div className={styles.butao}>
                    <Link href={`/editarProduto?id=${carro.id}`} className={styles.editar}>
                      Editar
                    </Link>
                    <button className={styles.delete} onClick={() => removerCarro(carro.id)}>
                      Excluir
                    </button>
                  </div>
                )}
              </div>
              <p>{carro.carro_nome}</p>
              <Link href={`/descricaoProduto?id=${carro.id}`}>
                <button className={styles.bot}>Veja mais</button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MeusProdutos;
