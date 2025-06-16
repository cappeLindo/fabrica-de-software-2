'use client'
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './telaLogin.module.css';
import valorUrl from "../../../rotaUrl.js";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(true);
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Tenta como cliente
            let response = await fetch(`${valorUrl}/auth/cliente/login`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ email, senha })
            });

            if (response.ok) {
                // Autenticado como cliente
                router.push('/'); // ou para o painel do cliente
                return;
            }

            // Se não deu, tenta como concessionária
            response = await fetch(`${valorUrl}/auth/concessionaria/login`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });

            if (response.ok) {
                // Autenticado como concessionária
                router.push('/'); // ou para o painel da concessionária
                return;
            }

            // Se chegou até aqui, quer dizer que os dois deram errado
            alert("Não foi possível efetuar o login. Verifique suas credenciais.");

        } catch (error) {
            console.error(error);
            alert("Ocorreu um erro na autenticação.");
        }
    };

    return (
        <div className={styles.containerLogin}>
            <div className={styles.leftRed}>
                <h2>Seja bem-vindo novamente!</h2>
            </div>
            <div className={styles.conteudoLogin}>
                <div className={styles.campoImagem}>
                    <Image src={'/images/logo.png'} width={50} height={50} alt="Logo" />
                    <p>Web Cars</p>
                </div>
                <div className={styles.containerFormulario}>
                    <h2>Login</h2>
                    <form className={styles.formulario} onSubmit={handleSubmit}>
                        <div className={styles.conteudoFormulario}>
                            <div className={styles.containerImage}>
                                <Image src={'/images/logo.png'} width={100} height={100} alt="Logo" />
                            </div>
                            <div className={styles.containerInputs}>
                                <div className={styles.campoInput}>
                                   <label>Email:</label>
                                   <div className={styles.inputLogin}>
                                      <input
                                         id={styles.inputEmail}
                                         type="email"
                                         value={email}
                                         onChange={(e) => setEmail(e.target.value)}
                                      />
                                   </div>
                                </div>
                                <div className={styles.campoInput}>
                                   <label>Senha:</label>
                                   <div className={styles.inputLogin}>
                                      <input
                                         type={showPassword ? "password" : "text"}
                                         value={senha}
                                         onChange={(e) => setSenha(e.target.value)}
                                      />
                                      <button
                                         className={styles.bottonEye}
                                         type="button"
                                         onClick={() => setShowPassword(!showPassword)}
                                      >
                                         {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                      </button>
                                   </div>
                                </div>
                            </div>
                            <div className={styles.campoBotoes}>
                                <div className={styles.containerAncoras}>
                                   <Link href='/TrocarSenha' className={styles.ancora}>
                                      Esqueceu sua senha?
                                   </Link>
                                   <Link href='/TelaCadastroCliente' className={styles.ancora}>
                                      Criar conta
                                   </Link>
                                </div>
                                <button className={styles.buttonSubmit} type="submit">
                                   Entrar
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

