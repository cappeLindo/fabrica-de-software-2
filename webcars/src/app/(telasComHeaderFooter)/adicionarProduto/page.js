'use client';

import React, { useState, useEffect } from "react";
import Dropdown from "@/components/funcoesDropdown/DropDown.js";
import DropdownEspecial from "@/components/funcoesDropdown/DropDownEspecial.js";
import controleDadosImagem from "@/components/funcoesDropdown/controleDeDadosImagem.js";
import Cookies from "js-cookie";
import valorUrl from "../../../../rotaUrl.js";
import DropdownSimulado from "@/components/funcoesDropdown/dropDownCodicao.js";
import Link from 'next/link'
import styles from "./adicionarPodutos.module.css"
import { formatarQuilometragem, validarAno, formatarValorMonetario, validarAnoCalendario } from "@/components/funcoesDropdown/controleDeDadosSimples.js";
import { ArrowLeft } from "lucide-react";
export default function AdicionarProduto() {

  const [valorIdConcessionaria, setValorIdConcessionaria] = useState("")
  const [dropdownAberto, setDropdownAberto] = useState("");
  const [valorCor, setCor] = useState();
  const [valorMarca, setMarca] = useState();
  const [valorModelo, setModelo] = useState();
  const [valorAro, setAro] = useState();
  const [valorCondicao, setCondicao] = useState();
  const [valorCategoria, setCategoria] = useState();
  const [valorCombustivel, setCombustivel] = useState();
  const [valorAno, setAno] = useState();
  const [valorDataCompra, setDataCompra] = useState();
  const [valorNome, setNome] = useState();
  const [valorCambio, setCambio] = useState();
  const [checkboxValues, setCheckboxValues] = useState({
    ipva: false,
    blindagem: false,
    contatoNumero: false,
    contatoEmail: false,
  });
  const [valorDataIpva, setDataIpva] = useState();
  const [valorValor, setValor] = useState();
  const [valorDetalhes, setDetalhes] = useState();
  const [valorQuilometragem, setQuilometragem] = useState();
  const [errorMessage, setErrorMessage] = useState('');

  const [valorImagens, setImagens] = useState([]);
  const [imagensTemporarias, setImagensTemporarias] = useState([]); // Array secundário para armazenar imagens temporariamente
  const [imagePreviews, setImagePreviews] = useState([]);

  /*const [valorContatoNumeroDeTelefone, setValorContatoNumeroDeTelefone] = useState();
  const [valorContatoEmailEndereco, setValorContatoEmailEndereco] = useState();*/

  const controleImagens = (event) => {
    const files = Array.from(event.target.files);
    setImagensTemporarias(files); // Armazena as imagens no array temporário
    handleFileChange(files);
    setImagens(files)
  };

  const [showMensagem, setShowMensagem] = useState(false)

  const handleFileChange = (files) => {
    if (files.length) {
      const newPreviews = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === files.length) {
            setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const excluirImagem = (index) => {
    setImagensTemporarias((prevImagens) => {
      const newImages = [...prevImagens];
      newImages.splice(index, 1);
      return newImages;
    });

    setImagePreviews((prevPreviews) => {
      const newPreviews = [...prevPreviews];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const [exibirData, setExibirData] = useState(false);

  const apresentarDataVencimento = (event) => {
    setExibirData(event.target.checked);
    if (event.target.checked === false) {
      setDataIpva(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // limpa mensagem anterior

    try {
      // Validações obrigatórias
      if (!valorNome || !valorAno || !valorCondicao || !valorValor || !valorQuilometragem || !valorModelo || !valorCambio || !valorCor || !valorCategoria || !valorMarca) {
        setErrorMessage("Preencha todos os campos obrigatórios.");
        setTimeout(() => setErrorMessage(""), 2000);
        return;
      }

      // Se o carro NÃO for novo, data de compra é obrigatória
      if (valorCondicao !== 'Novo' && !valorDataCompra) {
        setErrorMessage("Preencha a data de compra.");
        setTimeout(() => setErrorMessage(""), 2000);
        return;
      }

      // Se IPVA estiver marcado, a data do IPVA é obrigatória
      if (checkboxValues.ipva && !valorDataIpva) {
        setErrorMessage("Preencha a data de vencimento do IPVA.");
        setTimeout(() => setErrorMessage(""), 2000);
        return;
      }

      // Formatação dos valores
      const valorConvertido = parseFloat(
        valorValor.replace(/\s/g, "").replace("R$", "").replace(/\./g, "").replace(",", ".")
      );
      const quilometragemConvertida = parseInt(
        valorQuilometragem.replace(/\./g, "").replace(",", "").replace(/\s/g, "").replace("km", ""), 10
      );

      if (isNaN(valorConvertido) || isNaN(quilometragemConvertida)) {
        setErrorMessage("Informe valores válidos para 'Valor' e 'Quilometragem'.");
        setTimeout(() => setErrorMessage(""), 2000);
        return;
      }

      const form = new FormData();
      form.append("nome", valorNome);
      form.append("ano", valorAno);
      form.append("condicao", valorCondicao);
      form.append("valor", valorConvertido);
      form.append("ipva_pago", valorIpva);

      // Só envia data_ipva se houver
      if (valorDataIpva) form.append("data_ipva", valorDataIpva);

      // Só envia data_compra se necessário
      if (valorDataCompra) form.append("data_compra", valorDataCompra);

      form.append("detalhes_veiculo", valorDetalhes);
      form.append("blindagem", valorBlindagem);
      form.append("quilometragem", quilometragemConvertida);
      form.append("cor_id", valorCor);
      form.append("aro_id", valorAro);
      form.append("categoria_id", valorCategoria);
      form.append("marca_id", valorMarca);
      form.append("modelo_id", valorModelo);
      form.append("combustivel_id", valorCombustivel);
      form.append("cambio_id", valorCambio);

      imagensTemporarias.forEach((imagem) => {
        form.append("imagensCarro", imagem);
      });

      const response = await fetch(`${valorUrl}/carro/${valorIdConcessionaria}`, {
        method: "POST",
        body: form,
      });

      const data = await response.json();

      if (!response.ok) {
        const erro = data?.message || data?.erro || "Erro desconhecido ao tentar cadastrar.";
        setErrorMessage(erro);
        setTimeout(() => setErrorMessage(""), 2000);
        return;
      }

      setShowMensagem(true);
    } catch (err) {
      console.error("Erro no envio:", err);
      setErrorMessage("Erro ao enviar os dados. Verifique sua conexão ou tente novamente.");
      setTimeout(() => setErrorMessage(""), 2000);
    }
  };



  const reload = () => {
    window.location.reload();
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckboxValues((prevValues) => ({
      ...prevValues,
      [name]: checked,
    }));
  };

  const valorIpva = checkboxValues.ipva ? '1' : '0';
  const valorBlindagem = checkboxValues.blindagem ? '1' : '0';
  /*const valorContatoEmail = checkboxValues.contatoEmail ? '1' : '0';
  const valorContatoNumero = checkboxValues.contatoNumero ? '1' : '0';*/

  const handleValorSelecionado = (label, valor) => {
    switch (label) {
      case "marca":
        setMarca(valor);
        break;
      case "aro":
        setAro(valor);
        break;
      case "modelo":
        setModelo(valor);
        break;
      case "combustivel":
        setCombustivel(valor);
        break;
      case "categoria":
        setCategoria(valor);
        break;
      case "cor":
        setCor(valor);
        break;
      case "condicao":
        setCondicao(valor);
        break;
      case "cambio":
        setCambio(valor);
        break;
      default:
        console.warn("Label não reconhecido:", label);
        break;
    }
  };

  useEffect(() => {
    const meuValor = Cookies.get('id');
    setValorIdConcessionaria(meuValor)
    if (showMensagem) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [showMensagem]);

  return (
    <div className={styles.mainAdicionarVeiculo}>

      <form onSubmit={handleSubmit}>
        <h2 className={styles.titulo}>Adicionar produto</h2>
        <div className={styles.fundoCampoAdicionarVeiculo}>
          <div className={styles.campoDuasColunas}>
            <Dropdown
              label="marca"
              onValorSelecionado={handleValorSelecionado}
              dropdownAberto={dropdownAberto}
              setDropdownAberto={setDropdownAberto}
            />

            <Dropdown
              label="categoria"
              onValorSelecionado={handleValorSelecionado}
              dropdownAberto={dropdownAberto}
              setDropdownAberto={setDropdownAberto}
            />

            <DropdownEspecial
              label="modelo"
              valorMarca={valorMarca}
              valorCategoria={valorCategoria}
              onValorSelecionado={handleValorSelecionado}
              dropdownAberto={dropdownAberto}
              setDropdownAberto={setDropdownAberto}
            />

            <Dropdown
              label="aro"
              onValorSelecionado={handleValorSelecionado}
              dropdownAberto={dropdownAberto}
              setDropdownAberto={setDropdownAberto}
            />

            <Dropdown
              label="combustivel"
              onValorSelecionado={handleValorSelecionado}
              dropdownAberto={dropdownAberto}
              setDropdownAberto={setDropdownAberto}
            />

            <Dropdown
              label="cor"
              onValorSelecionado={handleValorSelecionado}
              dropdownAberto={dropdownAberto}
              setDropdownAberto={setDropdownAberto}
            />

            <Dropdown
              label="cambio"
              onValorSelecionado={handleValorSelecionado}
              dropdownAberto={dropdownAberto}
              setDropdownAberto={setDropdownAberto}
            />

            <DropdownSimulado
              label="condicao"
              onValorSelecionado={handleValorSelecionado}
              dropdownAberto={dropdownAberto}
              setDropdownAberto={setDropdownAberto}
            />

            <div className={styles.filhoCampoDuasColunas}>
              <div className={styles.campodePrenchimento}>
                <label className={styles.label}>Ano</label>
                <input
                  type="number"
                  name="ano"
                  onBlur={(e) => validarAno(e.target)}
                  onChange={(e) => setAno(e.target.value)}
                  placeholder="Ex: 2007"
                />
              </div>
            </div>

            <div className={styles.filhoCampoDuasColunas}>
              <div className={styles.campodePrenchimento}>
                <label className={styles.label}>Data compra</label>
                <input
                  id={styles.campoInputDataCompra}
                  type="date"
                  name="dataCompra"
                  onBlur={(e) => validarAnoCalendario(e.target)}
                  onChange={(e) => setDataCompra(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.filhoCampoUmaColuna}>
              <div className={styles.campodePrenchimento}>
                <label className={styles.label}>Quilometragem</label>
                <input
                  type="text"
                  name="quilometragem"
                  onBlur={(e) => formatarQuilometragem(e.target)}
                  onChange={(e) => { setQuilometragem(e.target.value) }}
                  placeholder="Ex: 1.200,00 Km"
                />
              </div>
            </div>

            <div className={styles.filhoCampoDuasColunas}>
              <div className={styles.campodePrenchimento}>
                <label className={styles.label}>IPVA</label>
                <input
                  type="checkbox"
                  id="ipva"
                  name="ipva"
                  checked={checkboxValues.ipva}
                  onChange={(e) => { apresentarDataVencimento(e), handleCheckboxChange(e) }}
                  className={styles.checkbox}
                />
                <label htmlFor="ipva" className={styles.labelChekBox}></label>
              </div>
            </div>

            <div className={styles.filhoCampoDuasColunas}>
              <div className={styles.campodePrenchimento}>
                <label className={styles.label}>Blindagem</label>
                <input
                  type="checkbox"
                  id="blindagem"
                  name="blindagem"
                  checked={checkboxValues.blindagem}
                  onChange={handleCheckboxChange}
                  className={styles.checkbox}
                />
                <label htmlFor="blindagem" className={styles.labelChekBox}></label>
              </div>
            </div>
          </div>

          <div className={styles.campoUmaColuna}>
            {exibirData && (
              <div className={styles.filhoCampoUmaColuna}>
                <div className={styles.campodePrenchimento}>
                  <label className={styles.label}>Data de vencimento do IPVA</label>
                  <input
                    type="date"
                    name="dataIpva"
                    onChange={(e) => setDataIpva(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className={styles.filhoCampoUmaColuna}>
              <div className={styles.campodePrenchimento}>
                <label className={styles.label}>Nome de exibição</label>
                <input
                  type="text"
                  name="nome"
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Volkswagen Gol vermelho 2016 Usado"
                />
              </div>
            </div>

            <div className={styles.campoPreenchimentoimagens}>
              <label className={styles.label}>Imagens do produto</label>
              <input
                id="file-upload"
                type="file"
                name="file-upload"
                onChange={(e) => controleImagens(e)}
                multiple
                accept="image/*"
                className={styles.inputFilesImagens}
              />
              <div>
                <div id={styles.campoImagens} className="image-preview-area">
                  <label id={styles.iconeAdicionarImagem} htmlFor="file-upload">
                    <svg xmlns="http://www.w3.org/2000/svg" width="70" height="50" fill="currentColor" className="bi bi-file-earmark-plus-fill" viewBox="0 0 16 16">
                      <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M8.5 7v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 1 0" />
                    </svg>
                  </label>
                  {imagePreviews.map((preview, index) => (
                    <div key={`cardImagem${index}`} className={styles.cardImagem}>
                      <input
                        type="button"
                        key={`botaoTirarImagem${index}`}
                        onClick={() => excluirImagem(index)}
                        className={styles.botaoTirarImagem}
                        value="✖"
                      />
                      <div key={`campoImagem${index}`}>
                        <img
                          key={`imagem${index}`}
                          src={preview}
                          alt={`Pré-visualização ${index + 1}`}
                          className={styles.imagemVeiculo}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
            </div>

            <div className={styles.campoDetalhes}>
              <label className={styles.label}>Detalhes</label>
              <textarea
                name="detalhes"
                cols="30"
                rows="10"
                onChange={(e) => setDetalhes(e.target.value)}
                placeholder="Adicione os detalhes sobre o seu produto aqui!"
              />
            </div>

            <div className={styles.filhoCampoUmaColuna}>
              <div className={styles.campodePrenchimento}>
                <label className={styles.label}>Valor do produto</label>
                <input
                  type="text"
                  name="valor"
                  onBlur={(e) => formatarValorMonetario(e.target)}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="Ex: R$ 150.000,00"
                />
              </div>
            </div>
          </div>
        </div>
        <button id={styles.btnAdicionarProduto} type="submit">Enviar</button>
      </form >
      {
        showMensagem &&
        <div className={styles.overlay}>
          <div className={styles.containerConclusao}>
            <div className={styles.containerMensagemConclusao}>
              <p>PRODUTO POSTADO COM SUCESSO!</p>
            </div>
            <div className={styles.containeBotao}>
              <button className={styles.botaoConclusao}>
                <Link href='/' className={styles.conteudoBotaoConclusao}>
                  <div className={styles.arrowEtexto}>
                    <ArrowLeft size={20} />
                    <p>
                      Voltar a tela inical
                    </p>
                  </div>
                </Link>
              </button>
              <button className={styles.botaoConclusao} onClick={reload}>
                <Link href='/adicionarProduto' className={styles.conteudoBotaoConclusao}>
                  <div className={styles.arrowEtexto}>
                    <ArrowLeft size={20} />
                    <p>
                      Adicionar mais um produto
                    </p>
                  </div>
                </Link>
              </button>
            </div>
          </div>
        </div>
      }
    </div >
  );
}