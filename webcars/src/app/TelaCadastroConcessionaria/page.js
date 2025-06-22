"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from './cadastroConcessionaria.module.css';
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, TestTube } from "lucide-react";
import valorUrl from "../../../rotaUrl";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    nome: "", email: "", cnpj: "", telefone: "",
    cep: "", rua: "", bairro: "", cidade: "",
    estado: "", senha: "", confirmarSenha: "",
  });

  const [errors, setErrors] = useState({});
  const [cnpjValido, setCnpjValido] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordChek, setShowPasswordChek] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("/images/logo.png");
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const formatCNPJ = (value) =>
    value.replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .substring(0, 18);

  const validateCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/\D/g, "");
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

    const calcDigit = (slice, weights) => {
      const sum = slice.split("").reduce((acc, curr, idx) =>
        acc + parseInt(curr) * weights[idx], 0);
      const mod = sum % 11;
      return mod < 2 ? 0 : 11 - mod;
    };

    const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const d1 = calcDigit(cnpj.slice(0, 12), w1);
    const d2 = calcDigit(cnpj.slice(0, 13), w2);

    return cnpj[12] == d1 && cnpj[13] == d2;
  };

  const formatTelefone = (value) =>
    value.replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2");

  const formatCEP = (value) =>
    value.replace(/\D/g, "")
      .replace(/^(\d{5})(\d)/, "$1-$2")
      .substring(0, 9);

  const buscarEnderecoPorCEP = async (cep) => {
    cep = cep.replace(/\D/g, "");
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            rua: data.logradouro, bairro: data.bairro,
            cidade: data.localidade, estado: data.uf
          }));
        } else setErrors(prev => ({ ...prev, cep: "CEP não encontrado" }));
      } catch {
        setErrors(prev => ({ ...prev, cep: "Erro ao buscar CEP" }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nome) newErrors.nome = "Nome é obrigatório";
    if (!formData.email.includes("@")) newErrors.email = "Email inválido";
    if (!validateCNPJ(formData.cnpj)) newErrors.cnpj = "CNPJ inválido";
    if (formData.telefone.replace(/\D/g, "").length !== 11) newErrors.telefone = "Telefone inválido";
    if (formData.cep.replace(/\D/g, "").length !== 8) newErrors.cep = "CEP inválido";
    if (!/(?=.*[A-Z])(?=.*\d{3,})(?=.*[!@#$%^&*])/.test(formData.senha))
      newErrors.senha = "A senha deve conter ao menos 1 maiúscula, 3 números e 1 símbolo";
    if (formData.senha !== formData.confirmarSenha)
      newErrors.confirmarSenha = "Senhas não coincidem";
    if (!file) newErrors.imagem = "A imagem é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const formDataToSend = new FormData();
      const enderecoRes = await fetch(`${valorUrl}/endereco`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cep: formData.cep.replace(/\D/g, ""),
          rua: formData.rua, bairro: formData.bairro,
          cidade: formData.cidade, estado: formData.estado
        })
      });

      if (!enderecoRes.ok) throw new Error("Erro ao cadastrar endereço");

      const result = await enderecoRes.json();
      const endereco_id = result.id || result.endereco_id; // Ajuste conforme a resposta real


      formDataToSend.append("nome", formData.nome);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("cnpj", formData.cnpj.replace(/\D/g, ""));
      formDataToSend.append("telefone", formData.telefone);
      formDataToSend.append("cep", formData.cep.replace(/\D/g, ""));
      formDataToSend.append("rua", formData.rua);
      formDataToSend.append("bairro", formData.bairro);
      formDataToSend.append("cidade", formData.cidade);
      formDataToSend.append("estado", formData.estado);
      formDataToSend.append("senha", formData.senha);
      formDataToSend.append("endereco_id", endereco_id);
      formDataToSend.append("imagem", file);

      const res = await fetch(`${valorUrl}/concessionaria`, {
        method: "POST", body: formDataToSend,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Erro no cadastro");
      }

      alert("Concessionária cadastrada com sucesso!");
      router.push("/telaLogin");

    } catch (err) {
      alert("Erro: " + err.message);
      console.error(err);
    }
  };

  const handleCNPJChange = (e) => {
    const formatado = formatCNPJ(e.target.value);
    setFormData({ ...formData, cnpj: formatado });
    setCnpjValido(validateCNPJ(formatado));
  };

  const handleCEPChange = (e) => {
    const formatado = formatCEP(e.target.value);
    setFormData({ ...formData, cep: formatado });
    buscarEnderecoPorCEP(formatado);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const getPlaceholder = (label) => `Digite seu ${label.toLowerCase()}`;

  return (
    <div className={styles.containerCadastro}>
      <div className={styles.leftRed}>
        <div className={styles.conteudoLeftRed}>
          <h2>Bem-vindo</h2>
          <h3>Crie sua conta agora mesmo.</h3>
        </div>
      </div>

      <div className={styles.conteudoCadastro}>
        <div className={styles.campoImagem}>
          <Image src="/images/logo.png" width={50} height={50} alt="Logo" />
          <p>Web Cars</p>
        </div>

        <div className={styles.containerFormulario}>
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
                    setFile(null); setPreviewUrl("/images/logo.png"); setModalOpen(false);
                  }}>Cancelar</button>
                </div>
              </div>
            </div>
          )}

          <h2>Crie sua conta</h2>
          <form onSubmit={handleSubmit} className={styles.formulario}>
            <div className={styles.conteudoFormulario}>
              {/* Nome */}
              <div className={styles.containerInput}>
                <label>Nome:</label>
                <input
                  type="text"
                  placeholder={getPlaceholder("Nome")}
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className={styles.inputCadastro}
                />
                {errors.nome && <span className={styles.error}>{errors.nome}</span>}
              </div>

              {/* Email */}
              <div className={styles.containerInput}>
                <label>Email:</label>
                <input
                  type="email"
                  placeholder={getPlaceholder("Email")}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.inputCadastro}
                />
                {errors.email && <span className={styles.error}>{errors.email}</span>}
              </div>

              {/* CNPJ */}
              <div className={styles.containerInput}>
                <label>CNPJ:</label>
                <input
                  type="text"
                  placeholder={getPlaceholder("CNPJ")}
                  value={formData.cnpj}
                  onChange={handleCNPJChange}
                  maxLength="18"
                  className={styles.inputCadastro}
                />
                {errors.cnpj && <span className={styles.error}>{errors.cnpj}</span>}
                {formData.cnpj && (
                  <span className={cnpjValido ? styles.success : styles.error}>
                    {cnpjValido ? "CNPJ válido" : "CNPJ inválido"}
                  </span>
                )}
              </div>

              {/* Telefone */}
              <div className={styles.containerInput}>
                <label>Telefone:</label>
                <input
                  type="text"
                  placeholder={getPlaceholder("Telefone")}
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: formatTelefone(e.target.value) })}
                  maxLength="15"
                  className={styles.inputCadastro}
                />
                {errors.telefone && <span className={styles.error}>{errors.telefone}</span>}
              </div>

              {/* CEP */}
              <div className={styles.containerInput}>
                <label>CEP:</label>
                <input
                  type="text"
                  placeholder={getPlaceholder("CEP")}
                  value={formData.cep}
                  onChange={handleCEPChange}
                  maxLength="9"
                  className={styles.inputCadastro}
                />
                {errors.cep && <span className={styles.error}>{errors.cep}</span>}
              </div>

              <div className={styles.containerTwoButtons}>
                {/* Rua */}
                <div className={styles.containerInput}>
                  <label>Rua:</label>
                  <input
                    type="text"
                    placeholder={getPlaceholder("Rua")}
                    value={formData.rua}
                    onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                    className={styles.inputCadastro}
                  />
                </div>

                {/* Bairro */}
                <div className={styles.containerInput}>
                  <label>Bairro:</label>
                  <input
                    type="text"
                    placeholder={getPlaceholder("Bairro")}
                    value={formData.bairro}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    className={styles.inputCadastro}
                  />
                </div>
              </div>
              <div className={styles.containerTwoButtons}>
                <div className={styles.containerInput}>
                  <label>Cidade:</label>
                  <input
                    type="text"
                    placeholder={getPlaceholder("Cidade")}
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className={styles.inputCadastro}
                  />
                </div>

                <div className={styles.containerInput}>
                  <label>Estado:</label>
                  <input
                    type="text"
                    placeholder={getPlaceholder("Estado")}
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className={styles.inputCadastro}
                  />
                </div>
              </div>


              {/* Senha */}
              <div className={styles.containerInput}>
                <label>Criar senha:</label>
                <div className={styles.containerInputSenha}>
                  <input
                    type={showPassword ? 'text' : "password"}
                    placeholder={getPlaceholder("Senha")}
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Eye /> : <EyeOff />}
                  </button>
                </div>
                {errors.senha && <span className={styles.error}>{errors.senha}</span>}
              </div>

              {/* Confirmar Senha */}
              <div className={styles.containerInput}>
                <label>Confirmar senha:</label>
                <div className={styles.containerInputSenha}>
                  <input
                    type={showPasswordChek ? 'text' : "password"}
                    placeholder={getPlaceholder("Confirmar Senha")}
                    value={formData.confirmarSenha}
                    onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPasswordChek(!showPasswordChek)}>
                    {showPasswordChek ? <Eye /> : <EyeOff />}
                  </button>
                </div>
                {errors.confirmarSenha && <span className={styles.error}>{errors.confirmarSenha}</span>}
              </div>
              <div className={styles.containerInput} id={styles.containerImagem}>
                <button type="button" onClick={() => setModalOpen(true)} className={styles.buttonImagem}>
                  Adicionar imagem de perfil
                </button>
                {errors.imagem && <span className={styles.error}>{errors.imagem}</span>}
              </div>


              {/* Botão de Envio e Links */}
              <div className={styles.btnContainer}>
                <button type="submit" className={styles.buttonSubmit}>Criar Conta</button>
                <div className={styles.containerLinks}>
                  <Link href='/TelaCadastroCliente' className={styles.btnConcessionaria}>Criar conta como cliente</Link>
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