'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import styles from './trocarSenha.module.css';
import emailjs from 'emailjs-com';
import valorUrl from "../../../rotaUrl";

export default function PasswordReset() {
    const router = useRouter();
    const [code, setCode] = useState("");
    const [inputs, setInputs] = useState(["", "", "", "", "", ""]);
    const [step, setStep] = useState(0);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showSenha, setShowSenha] = useState(false);
    const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

    const mostrarMensagem = (tipo, texto) => {
        setMensagem({ tipo, texto });
        setTimeout(() => setMensagem({ tipo: "", texto: "" }), 4000);
    };

    const handleEnviarCodigo = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${valorUrl}/cliente?email=${email}`);
            const data = await response.json();
            if (!response.ok || !data.dados) {
                mostrarMensagem("erro", "E-mail não encontrado.");
                setLoading(false);
                return;
            }
            setUserId(data.dados[0].id);

            const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
            setCode(generatedCode);

            await emailjs.send(
                'service_kp0cwif',
                'template_0y1fjdd',
                {
                    to_email: email,
                    codigo: generatedCode
                },
                'H5x3Tf0gE9Ud4uzM6'
            );

            setStep(1);
        } catch (err) {
            console.error(err);
            mostrarMensagem("erro", "Erro ao enviar o código.");
        }
        setLoading(false);
    };

    const handleInputChange = (index, value, e) => {
        // Se colar e o valor tiver 6 dígitos, distribui automaticamente
        const pasted = e?.clipboardData?.getData('text');
        if (pasted && pasted.length === 6 && /^\d{6}$/.test(pasted)) {
            const newInputs = pasted.split('');
            setInputs(newInputs);
            return;
        }

        if (/^\d?$/.test(value)) {
            const newInputs = [...inputs];
            newInputs[index] = value;
            setInputs(newInputs);

            if (value && index < 5) {
                document.getElementById(`input-${index + 1}`).focus();
            } else if (!value && index > 0) {
                document.getElementById(`input-${index - 1}`).focus();
            }
        }
    };


    const verifyCode = () => {
        if (inputs.join("") === code) {
            setStep(2);
        } else {
            mostrarMensagem("erro", "Código incorreto. Tente novamente.");
            setInputs(["", "", "", "", "", ""]);
        }
    };

    const validatePassword = async () => {
        const regex = /^(?=.*[A-Z])(?=.*\d{3,})(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

        if (!regex.test(password)) {
            mostrarMensagem("erro", "A senha deve ter pelo menos 3 números, 1 caractere especial e 1 letra maiúscula.");
            return;
        }
        if (password !== confirmPassword) {
            mostrarMensagem("erro", "As senhas não coincidem.");
            return;
        }

        try {
            const response = await fetch(`${valorUrl}/cliente/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ senha: password }),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.mensagem || "Erro ao atualizar a senha");

            mostrarMensagem("sucesso", "Senha redefinida com sucesso!");
            setStep(3);
            setTimeout(() => router.push("/"), 2000);
        } catch (err) {
            mostrarMensagem("erro", err.message || "Erro inesperado ao redefinir senha.");
        }
    };

    return (
        <div className={styles.bodyTrocarSenha}>
            {mensagem.texto && (
                <div className={`${styles.alertaMensagem} ${mensagem.tipo === "erro" ? styles.erro : styles.sucesso}`}>
                    {mensagem.texto}
                </div>
            )}

            <div className={styles.campoImagem}>
                <Image src={'/images/logo.png'} width={50} height={50} alt="Logo" />
                <p>Web Cars</p>
            </div>

            <div className={styles.container}>
                {step === 0 && (
                    <>
                        <p className={styles.mensagemCodveric}>Digite seu e-mail para redefinir a senha:</p>
                        <input
                            type="email"
                            placeholder="Digite seu e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.inputEmail}
                        />
                        <button onClick={handleEnviarCodigo} className={styles.botoesVerf} disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar Código'}
                        </button>
                    </>
                )}

                {step === 1 && (
                    <>
                        <p className={styles.mensagemCodveric}>Digite o código enviado para "{email}"</p>
                        <div className={styles.containerInputsVeric}>
                            {inputs.map((val, index) => (
                                <input
                                    key={index}
                                    id={`input-${index}`}
                                    value={val}
                                    onChange={(e) => handleInputChange(index, e.target.value)}
                                    onPaste={(e) => handleInputChange(index, e.target.value, e)} // ADICIONADO
                                    maxLength={1}
                                    className={styles.inputCodigoverif}
                                />
                            ))}
                        </div>
                        <button onClick={verifyCode} className={styles.botoesVerf}>Verificar Código</button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <p className={styles.mensagemCodveric}>Redefinir Senha</p>
                        <div className={styles.inputPass}>
                            <input
                                type={showSenha ? 'text' : 'password'}
                                placeholder="Nova senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button onClick={() => setShowSenha(!showSenha)}>
                                {showSenha ? <Eye /> : <EyeOff />}
                            </button>
                        </div>
                        <div className={styles.inputPass}>
                            <input
                                type={showConfirmarSenha ? 'text' : 'password'}
                                placeholder="Confirme a senha"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}>
                                {showConfirmarSenha ? <Eye /> : <EyeOff />}
                            </button>
                        </div>
                        <button onClick={validatePassword} className={styles.botoesVerf}>Redefinir Senha</button>
                    </>
                )}

                {step === 3 && (
                    <p className={styles.msgOk}>Senha redefinida com sucesso! Redirecionando...</p>
                )}
            </div>
        </div>
    );
}
