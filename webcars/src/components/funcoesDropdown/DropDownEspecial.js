import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link.js";
import valorUrl from "../../../rotaUrl.js";
const DropdownEspecial = ({
    label,
    valorMarca,
    valorCategoria,
    onValorSelecionado,
    dropdownAberto,
    setDropdownAberto
}) => {
    const [valores, setValores] = useState([]);
    const [selecionado, setSelecionado] = useState("Escolha");
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resultado = await fetch(`${valorUrl}/${label}`);
                const resultadoData = await resultado.json();

                // Filtra depois que os dados chegam
                const resultadoFiltrado = verificarResultadoModelo(valorMarca, valorCategoria, resultadoData);

                setValores(resultadoFiltrado);
                setMensagem(Array.isArray(resultadoData) && resultadoData.length === 0
                    ? "Nenhum modelo encontrado para a marca e categoria selecionadas."
                    : ""
                );

            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };
        fetchData();
    }, [valorMarca, valorCategoria]);

    const verificarResultadoModelo = (marca, categoria, dados) => {
        if (!categoria && !marca) return dados;
        if (!categoria) return dados.filter((d) => d.marca_id === marca);
        if (!marca) return dados.filter((d) => d.categoria_id === categoria);
        return dados.filter((d) => d.marca_id === marca && d.categoria_id === categoria);
    };

    useEffect(() => {
        setSelecionado("Escolha");
    }, [valorMarca, valorCategoria]);

    const handleSelecionar = (valor, nome) => {
        setSelecionado(nome);
        setDropdownAberto("");
        onValorSelecionado(label, valor);
    };

    const handleAbrirDropdown = () => {
        if (valores.length > 0) {
            setDropdownAberto(dropdownAberto === label ? "" : label);
        }
    };

    useEffect(() => {
        if (valores.length === 0) {
            onValorSelecionado(label, "desabilitado");
        }
    }, [valores, label, onValorSelecionado]);

    return (
        <div className={styles.filhoCampoDuasColunas}>
            <div className={styles.campodePrenchimentoDropDown}>
                <div className={styles.selectContainer}>
                    <p className={styles.label}>{label[0].toUpperCase() + label.slice(1)}</p>

                    <div
                        className={`${styles.customSelect} ${valores.length === 0 ? styles.disabled : ""}`}
                        onClick={handleAbrirDropdown}
                    >
                        <span>{selecionado}</span>
                        <span className={styles.arrow}>
                            {dropdownAberto === label ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-up" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                                </svg>
                            )}
                        </span>
                    </div>

                    {dropdownAberto === label && valores.length > 0 && (
                        <ul className={styles.dropdownLista}>
                            {valores.map((item) => (
                                <li
                                    key={item[`${label}_id`]}
                                    className={`${styles.dropdownItem} ${selecionado === item[`${label}_nome`] ? styles.itemSelecionado : ""}`}
                                    onClick={() => handleSelecionar(item[`${label}_id`], item[`${label}_nome`])}
                                >
                                    {item[`${label}_nome`]}
                                </li>
                            ))}
                            <Link className={styles.linkclass} href='/adicionarOpcaoDropdown'><li key={`adicionarTabela${label}`} className={styles.linkOutro}>Outro</li></Link>
                        </ul>
                    )}

                    {mensagem && <p className={styles.mensagemErro}>{mensagem}</p>}
                </div>
            </div>
        </div>
    );
};

export default DropdownEspecial;
