'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import styles from './CardCarro.module.css'; // crie um CSS específico se quiser
import Cookies from 'js-cookie';
export default function CardCarro({ carro, isFavorito, onToggleFavorito }) {
  const [idUser, setIdUser] = useState("")
  const [typeUser, setTypeUser] = useState("")

  useEffect(() => {
    const valorIdCookies = Cookies.get("id")
    const valorTypeUserCookies = Cookies.get("typeUser")
    setTypeUser(valorTypeUserCookies);
    setIdUser(valorIdCookies)
  }, [idUser, typeUser])

  return (
    <div className={styles.card_carros}>
      {typeUser == "cliente" &&
        <div
          className={`${styles.heart_icon} ${isFavorito ? styles.favoritado : ''}`}
          onClick={() => onToggleFavorito(carro.id)}
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter') onToggleFavorito(carro.id); }}
          aria-label={isFavorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >

          < Heart
            size={20}
            color={isFavorito ? '#fff' : '#aaa'}
            fill={isFavorito ? '#e63946' : 'none'}
          />
        </div>}

      <Image
        src={carro.imageUrl}
        alt={carro.carro_nome || carro.nome || carro.nomeCarro || 'Imagem do carro'}
        width={160}
        height={120}
      />
      <p>{carro.carro_nome || carro.nome || carro.nomeCarro}</p>
      <button>
        <Link href={`/descricaoProduto?id=${carro.id}`}>veja mais</Link>
      </button>
    </div>
  );
}
