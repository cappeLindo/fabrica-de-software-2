'use client';
import React, { useState } from "react";
import styles from './adicionarOpcao.module.css';
import DropdownSimulado from "./DropDownCampos";
import Dropdown from "@/components/funcoesDropdown/DropDown";
import valorUrl from "../../../../rotaUrl";

export default function AdicionarProduto() {
    const [dropdownAberto, setDropdownAberto] = useState("");
    const [valorCampo, setValorCampo] = useState("");
    const [pesquisa, setPesquisa] = useState("");
    const [resultados, setResultados] = useState([]);
    const [marcaSelecionada, setMarcaSelecionada] = useState(null);
    const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

    const handleValorSelecionado = (label, valor) => {
        const valorNormalizado = typeof valor === 'string' ? valor.toLowerCase() : valor;
        if (label === 'campos') {
            if (valorNormalizado === 'combustível') setValorCampo('combustivel');
            else if (valorNormalizado === 'câmbio') setValorCampo('cambio');
            else setValorCampo(valorNormalizado);

            // Reset ao mudar o campo
            setPesquisa("");
            setResultados([]);
            setMarcaSelecionada(null);
            setCategoriaSelecionada(null);
        }
        if (label === 'marca') setMarcaSelecionada(valor);
        if (label === 'categoria') setCategoriaSelecionada(valor);
    };

    const buscarResultados = async (busca) => {
        if (!valorCampo) return;

        try {
            const url = busca
                ? `${valorUrl}/${valorCampo}?nome=${encodeURIComponent(busca)}`
                : `${valorUrl}/${valorCampo}`;

            const response = await fetch(url);
            const data = await response.json();
            setResultados(data);
        } catch (err) {
            console.error("Erro ao buscar:", err);
            setResultados([]);
        }
    };

    const handleChangePesquisa = (e) => {
        const valor = e.target.value;
        setPesquisa(valor);
        buscarResultados(valor);
    };

    const podeAdicionar = () => {
        if (!pesquisa) return false;

        const jaExiste = resultados.some(item =>
            (item[`nome_${valorCampo}`] || item.nome || item.modelo_nome)?.toLowerCase() === pesquisa.toLowerCase()
        );

        return !jaExiste;
    };

    const handleAdicionarOpcao = async () => {
        if (!podeAdicionar()) return;

        try {
            const body =
                valorCampo === 'modelo'
                    ? {
                        nome: pesquisa,
                        marca_id: marcaSelecionada,
                        categoria_id: categoriaSelecionada
                    }
                    : { nome: pesquisa };

            const response = await fetch(`${valorUrl}/${valorCampo}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error("Erro ao adicionar opção");

            alert(`Opção "${pesquisa}" adicionada com sucesso em "${valorCampo}"`);
            setPesquisa("");
            setResultados([]);
        } catch (err) {
            console.error(err);
            alert("Erro ao adicionar nova opção.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.containerFormulario}>
                <div className={styles.containerMensagem}>
                    <h2>Não encontrou o que deseja? Adicione a opção desejada aqui!</h2>
                </div>

                <label>Qual campo não encontrou opção?</label>
                <DropdownSimulado
                    label="campos"
                    onValorSelecionado={handleValorSelecionado}
                    dropdownAberto={dropdownAberto}
                    setDropdownAberto={setDropdownAberto}
                />

                {valorCampo && (
                    <div className={styles.containerListaEBuscar}>
                        {valorCampo === "modelo" && (
                            <>
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
                            </>
                        )}

                        <div className={styles.campoBuscarInput}>
                            <label>Pesquisar opções existentes:</label>
                            <input
                                type="text"
                                value={pesquisa}
                                onChange={handleChangePesquisa}
                            />
                        </div>

                        <ul className={styles.listaResultadoBusca}>
                            {resultados.map((item) => (
                                <li key={item[`id_${valorCampo}`] || item.id || item.modelo_id}>
                                    {item[`nome_${valorCampo}`] || item.nome || item.modelo_nome}
                                </li>
                            ))}
                        </ul>

                        {podeAdicionar() && (
                            <button className={styles.estilobtn} onClick={handleAdicionarOpcao}>
                                Adicionar "{pesquisa}"
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
