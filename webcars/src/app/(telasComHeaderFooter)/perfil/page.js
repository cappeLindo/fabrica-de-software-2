'use client';
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './perfil.module.css';
import valorUrl from "../../../../rotaUrl.js";
import Cookies from "js-cookie";

const Perfil = () => {
  const searchParams = useSearchParams();
  const userId = Cookies.get('id');
  const userType = Cookies.get('typeUser');
  const API_BASE_URL = valorUrl;

  const [isModalVisivel, setModalVisivel] = useState(false);
  const [logicPerfil, setLogicPerfil] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError('ID do usuário não fornecido.');
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        
        const resUser = await fetch(`${API_BASE_URL}/${userType}/${userId}`);
        if (!resUser.ok) throw new Error('Erro ao buscar dados do usuário');
        const dataUser = await resUser.json();
        setUserData(dataUser.dados);

        const resImage = await fetch(`${API_BASE_URL}/${userType}/imagem/${userId}`);
        if (resImage.ok) {
          const blob = await resImage.blob();
          setProfileImage(URL.createObjectURL(blob));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, userType]);

  const handleExcluirClick = () => {
    setModalVisivel(true);
  };

  const handleFecharClick = () => {
    setModalVisivel(false);
  };

  const handleConcluirClick = async () => {
    try {
      
      const res = await fetch(`${API_BASE_URL}/${userType}/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!res.ok) throw new Error('Erro ao excluir conta');

      // Remove cookies
      Cookies.remove('id');
      Cookies.remove('tipo_usuario');

      // Alerta e redirecionamento
      alert("Conta excluída com sucesso!");
      window.location.href = '/telaLogin';
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);

      const formData = new FormData();
      formData.append('imagem', file);
      try {
        
        const res = await fetch(`${API_BASE_URL}/${userType}/imagem/${userId}`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Erro ao enviar imagem');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleImageClick = () => {
    if (!logicPerfil) {
      document.getElementById('imageInput').click();
    }
  };

  const handleInputChange = (e, field, index = null) => {
    if (index !== null) {
      const newTelefones = [...userData.telefones];
      newTelefones[index] = e.target.value;
      setUserData({ ...userData, telefones: newTelefones });
    } else {
      setUserData({ ...userData, [field]: e.target.value });
    }
  };

  const handleSalvarAlteracoes = async (e) => {
    e.preventDefault();
    try {
      
      const res = await fetch(`${API_BASE_URL}/${userType}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      if (!res.ok) throw new Error('Erro ao salvar alterações');
      setLogicPerfil(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    Cookies.remove('id');
    Cookies.remove('typeUser');
    window.location.href = '/telaLogin';
  };

  if (loading) return <div className={styles.loading}>Carregando...</div>;
  if (error) return <div className={styles.error}>Erro: {error}</div>;
  if (!userData) return <div className={styles.error}>Usuário não encontrado.</div>;

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
      
      {/* Modal de exclusão */}
      <div className={`${styles.janelaExclusao} ${isModalVisivel ? styles.mostrar : ''}`} id="janelaExclusao">
        <div className={styles.exclusao}>
          <h1>Atenção!</h1>
          <p>Tem certeza de que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão permanentemente apagados.</p>
          <div className={styles.botoesFechar}>
            <button className={styles.concluir} id="concluir" onClick={handleConcluirClick}>Excluir</button>
            <button className={styles.fechar} id="fechar" onClick={handleFecharClick}>Fechar</button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className={styles.container}>
        <aside className={styles.barraLateral}>
          <div className={styles.perfil1}>
            <input
              type="file"
              id="imageInput"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            {profileImage ? (
              <img
                src={profileImage}
                alt="Foto de perfil"
                className={styles.profileImage}
                onClick={handleImageClick}
              />
            ) : (
              <i
                className="bi bi-person-circle"
                onClick={handleImageClick}
                style={{ cursor: !logicPerfil ? 'pointer' : 'default' }}
              ></i>
            )}
            <button 
              className={logicPerfil ? styles.botaoEditar : styles.botaoEditarNclick} 
              onClick={() => setLogicPerfil(!logicPerfil)}
            >
              {logicPerfil ? 'Editar perfil' : 'Cancelar edição'}
            </button>
          </div>
          <div className={styles.menu}>
            <ul className={styles.ul}>
              <li>
                <Link href="/TelaDesejos">
                  <button className={styles.botaoMenu}>Lista de desejo</button>
                </Link>
                <Link href="/MeusAlertas">
                  <button className={styles.botaoMenu}>Meus alertas</button>
                </Link>
                <Link href="/meusProdutos">
                  <button className={styles.botaoMenu}>Meus produtos</button>
                </Link>
              </li>
              <li>
                <button className={styles.botaoMenu} onClick={handleLogout}>
                  Sair
                </button>
              </li>
              <li>
                <button className={styles.excluirConta} id="excluirConta" onClick={handleExcluirClick}>
                  Excluir conta
                </button>
              </li>
            </ul>
          </div>
        </aside>

        <main className={styles.conteudo}>
          <form className={styles.informaçoesPessoais} onSubmit={handleSalvarAlteracoes}>
            <h2>Meus dados</h2>
            <div className={styles.informaçoes}>
              <input 
                type="text" 
                placeholder="Nome completo" 
                value={userData.nome || ''} 
                onChange={(e) => handleInputChange(e, 'nome')} 
                disabled={logicPerfil}
              />
              <input 
                type="email" 
                placeholder="Email" 
                value={userData.email || ''} 
                onChange={(e) => handleInputChange(e, 'email')} 
                disabled={logicPerfil}
              />
            </div>
            <div className={styles.informaçoes}>
              <input 
                type="text" 
                placeholder="CPF/CNPJ" 
                value={userData.cpf || ''} 
                onChange={(e) => handleInputChange(e, 'cpf_cnpj')} 
                disabled={logicPerfil}
              />
              <input 
                type="text" 
                placeholder="Data de nascimento" 
                value={userData.data_nascimento || ''} 
                onChange={(e) => handleInputChange(e, 'data_nascimento')} 
                disabled={logicPerfil}
              />
            </div>

            <hr className={styles.hr} />

            <h2>Telefones</h2>
            <div className={styles.informaçoes}>
              <input 
                type="text" 
                placeholder="+(00) 00 00000-0000" 
                value={userData.telefone || ''} 
                onChange={(e) => handleInputChange(e, 'telefones', 0)} 
                disabled={logicPerfil}
              />
              <input 
                type="text" 
                placeholder="+(00) 00 00000-0000" 
                value={userData.telefones?.[1] || ''} 
                onChange={(e) => handleInputChange(e, 'telefones', 1)} 
                disabled={logicPerfil}
              />
            </div>

            <hr className={styles.hr} />

            <h2>Endereço</h2>
            <div className={styles.informaçoes}>
              <input 
                type="text" 
                placeholder="CEP" 
                value={userData.cep || ''} 
                onChange={(e) => handleInputChange(e, 'cep')} 
                disabled={logicPerfil}
              />
              <input 
                type="text" 
                placeholder="Estado" 
                value={userData.estado || ''} 
                onChange={(e) => handleInputChange(e, 'estado')} 
                disabled={logicPerfil}
              />
            </div>
            <div className={styles.informaçoes}>
              <input 
                type="text" 
                placeholder="Cidade" 
                value={userData.cidade || ''} 
                onChange={(e) => handleInputChange(e, 'cidade')} 
                disabled={logicPerfil}
              />
              <input 
                type="text" 
                placeholder="Bairro" 
                value={userData.bairro || ''} 
                onChange={(e) => handleInputChange(e, 'bairro')} 
                disabled={logicPerfil}
              />
            </div>
            <div className={styles.informaçoes}>
              <input 
                type="text" 
                placeholder="Endereço" 
                value={userData.endereco || ''} 
                onChange={(e) => handleInputChange(e, 'endereco')} 
                disabled={logicPerfil}
              />
              <input 
                type="text" 
                placeholder="Número" 
                value={userData.numero || ''} 
                onChange={(e) => handleInputChange(e, 'numero')} 
                disabled={logicPerfil}
              />
            </div>

            <div className={styles.botaoSalvar}>
              <button 
                disabled={logicPerfil} 
                className={logicPerfil ? styles.btnNclicavel : styles.btnClicavel} 
                type="submit"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
};

export default Perfil;
