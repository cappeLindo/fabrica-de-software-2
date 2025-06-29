"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from './cadastroClient.module.css'
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import valorUrl from "../../../rotaUrl";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
  });
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordChek, setShowPasswordChek] = useState(false)
  const [file, setFile] = useState(null); // Imagem selecionada
  const [previewUrl, setPreviewUrl] = useState("/images/logo.png"); // URL para prévia
  const [modalOpen, setModalOpen] = useState(false); // Controle da modal

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatTelefone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
  };

  const validateCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let sum = 0, remainder;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf[i - 1]) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf[9])) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf[i - 1]) * (12 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf[10]);
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.email.includes("@")) newErrors.email = "Email inválido";
    if (!validateCPF(formData.cpf)) newErrors.cpf = "CPF inválido";
    if (formData.telefone.replace(/\D/g, "").length !== 11) newErrors.telefone = "Telefone inválido";
    if (!/(?=.*[A-Z])(?=.*\d{3,})(?=.*[!@#$%^&*])/.test(formData.senha))
      newErrors.senha = "A senha deve conter pelo menos 3 números, 1 caractere especial e 1 letra maiúscula";
    if (formData.senha !== formData.confirmarSenha)
      newErrors.confirmarSenha = "As senhas não coincidem";

    if (Object.keys(newErrors).length > 0) {
      for (let error in newErrors) {
        alert(newErrors[error]);
      }
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const form = new FormData();
      form.append("nome", formData.nome);
      form.append("email", formData.email);
      form.append("cpf", formData.cpf.replace(/\D/g, ""));
      form.append("telefone", formData.telefone);
      form.append("senha", formData.senha);

      if (file) {
        form.append("imagem", file);
      }


      const response = await fetch(valorUrl + "/cliente", {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      if (!response.ok) {
        // Tenta extrair mensagem de erro vinda da API
        const errorMessage = data?.message || data?.erro || "Erro ao cadastrar cliente.";
        throw new Error(errorMessage);
      }

      alert(data.message || "Cadastro realizado com sucesso!");
      router.push("/");

    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      alert(error.message || "Erro inesperado ao cadastrar.");
    }

  };


  return (
    <div className={styles.containerCadastro}>
      <div className={styles.leftRed}>
        <div className={styles.conteudoLeftRed}>
          <h2>
            Bem-vindo
          </h2>
          <h3>
            Crie sua conta agora mesmo.
          </h3>
        </div>
      </div>
      <div className={styles.conteudoCadastro}>
        <div className={styles.campoImagem}>
          <Image src={'/images/logo.png'} width={50} height={50} alt="Logo" />
          <p>Web Cars</p>
        </div>
        <div className={styles.containerFormulario}>
          <h2>Crie sua conta</h2>
          <form onSubmit={handleSubmit} className={styles.formulario}>
            <div className={styles.conteudoFormulario}>
              {modalOpen && (
                <div className={styles.modalOverlay}>
                  <div className={styles.modal}>
                    <h3>Selecionar Imagem</h3>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {previewUrl && (
                      <div className={styles.previewContainer}>
                        <Image src={previewUrl} alt="Prévia" width={150} height={150} />
                      </div>
                    )}
                    <div className={styles.modalButtons}>
                      <button type="button" onClick={() => setModalOpen(false)}>Confirmar</button>
                      <button type="button" onClick={() => {
                        setFile(null);
                        setPreviewUrl("/images/logo.png");
                        setModalOpen(false);
                      }}>Cancelar</button>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.containerInput}>
                <label>Nome:</label>
                <input
                  type="text"
                  placeholder="Nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className={styles.inputCadastro}
                />
              </div>
              <div className={styles.containerInput}>
                <label>Email:</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.inputCadastro}
                />
              </div>
              <div className={styles.containerInput}>
                <label>CPF:</label>
                <input
                  type="text"
                  placeholder="CPF"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                  maxLength='14'
                  className={styles.inputCadastro}
                />
              </div>
              <div className={styles.containerInput}>
                <label>Telefone:</label>
                <input
                  type="text"
                  placeholder="Telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: formatTelefone(e.target.value) })}
                  maxLength='15'
                  className={styles.inputCadastro}
                />
              </div>
              <div className={styles.containerInput}>
                <label>Criar senha:</label>
                <div className={styles.containerInputSenha}>
                  <input
                    type={showPassword ? 'text' : "password"}
                    placeholder="Senha"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <Eye /> : <EyeOff />}</button>
                </div>
              </div>
              <div className={styles.containerInput}>
                <label>Confirmar senha:</label>
                <div className={styles.containerInputSenha}>
                  <input
                    type={showPasswordChek ? 'text' : "password"}
                    placeholder="Confirmar Senha"
                    value={formData.confirmarSenha}
                    onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPasswordChek(!showPasswordChek)}>{showPasswordChek ? <Eye /> : <EyeOff />}</button>
                </div>
              </div>
              <div className={styles.containerInput} id={styles.containerImagem}>
                <button type="button" onClick={() => setModalOpen(true)} className={styles.buttonImagem}>
                  Adicionar imagem de perfil
                </button>
              </div>


              <div className={styles.btnContainer}>
                <button type="submit" className={styles.buttonSubmit}>Criar Conta</button>
                <div className={styles.containerLinks}>
                  <Link href='/TelaCadastroConcessionaria' className={styles.btnConcessionaria}>Criar conta como concessionária</Link>
                  <Link href='/telaLogin' className={styles.btnConcessionaria}>Faça login</Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}