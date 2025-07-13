"use client";
import style from "./filtro.module.css";
import { useState, useEffect } from "react";
import Image from "next/image";

const FilterBox = ({ label, options, selectedOptions, onChange }) => {
  const [searchText, setSearchText] = useState("");

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className={style.filterBox}>
      <label htmlFor="search">{label}</label>
      <input
        type="text"
        className={style.search}
        placeholder="Pesquisar..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <div className={style.checkboxContainer}>
        {filteredOptions.map((option, index) => (
          <label key={index}>
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => onChange(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
};

const RangeInput = ({
  label,
  placeholderFrom,
  placeholderTo,
  exampleFrom,
  exampleTo,
  values,
  onChange,
}) => {
  const [from, to] = values;

  return (
    <div className={style.anoContainer}>
      <label className={style.ano}>{label}</label>
      <div className={style.anoInputs}>
        <div className={style.inputGroup}>
          <input
            type="number"
            min="0"
            placeholder={placeholderFrom}
            value={from || ""}
            onChange={(e) => onChange([e.target.value, to])}
          />
          <span className={style.example}>{exampleFrom}</span>
        </div>
        <div className={style.inputGroup}>
          <input
            type="number"
            min="0"
            placeholder={placeholderTo}
            value={to || ""}
            onChange={(e) => onChange([from, e.target.value])}
          />
          <span className={style.example}>{exampleTo}</span>
        </div>
      </div>
    </div>
  );
};

const CarCard = ({ carro }) => {
  const imagemUrl =
    carro.imagens && carro.imagens.length > 0
      ? `https://webcars.dev.vilhena.ifro.edu.br/api/carro/imagem/${carro.imagens[0]}`
      : "/images/default-car.jpg";

  return (
    <div className={style.cardCarros}>
      <Image
        src={imagemUrl}
        alt={carro.carro_nome}
        width={200}
        height={120}
        className={style.carImage}
        unoptimized
      />
      <p>{carro.carro_nome}</p>
      <button>
        <a href={`/descricaoProduto?id=${carro.id}`}>veja mais</a>
      </button>
    </div>
  );
};

const SemiNovos = () => {
  const [carros, setCarros] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMarcas, setSelectedMarcas] = useState([]);
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [selectedModelos, setSelectedModelos] = useState([]);
  const [selectedCombustiveis, setSelectedCombustiveis] = useState([]);
  const [selectedCor, setSelectedCor] = useState([]);
  const [selectedAro, setSelectedAro] = useState([]);

  const [anoRange, setAnoRange] = useState(["", ""]);
  const [precoRange, setPrecoRange] = useState(["", ""]);
  const [kmRange, setKmRange] = useState(["", ""]);

  useEffect(() => {
    async function fetchCarros() {
      setLoading(true);
      try {
        const res = await fetch("https://webcars.dev.vilhena.ifro.edu.br/api/carro");
        const data = await res.json();

        if (data && data.dados) {
          setCarros(data.dados);
        } else {
          setCarros([]);
          console.warn("Resposta da API inesperada:", data);
        }
      } catch (error) {
        console.error("Erro ao buscar carros:", error);
        setCarros([]);
      }
      setLoading(false);
    }

    fetchCarros();
  }, []);

  const toggleOption = (option, selectedOptions, setSelectedOptions) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((o) => o !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  const uniqueSorted = (arr, key) => {
    const set = new Set(arr.map((item) => item[key]));
    return [...set].sort();
  };

  const marcas = uniqueSorted(carros, "marca_name");
  const categorias = uniqueSorted(carros, "categoria_name");
  const modelos = uniqueSorted(carros, "modelo_name");
  const combustiveis = uniqueSorted(carros, "combustivel_name");
  const cores = uniqueSorted(carros, "cor_nome");
  const aros = uniqueSorted(carros, "aro_name");

  const carrosFiltrados = carros.filter((carro) => {
    if (selectedMarcas.length > 0 && !selectedMarcas.includes(carro.marca_name)) return false;
    if (selectedCategorias.length > 0 && !selectedCategorias.includes(carro.categoria_name)) return false;
    if (selectedModelos.length > 0 && !selectedModelos.includes(carro.modelo_name)) return false;
    if (selectedCombustiveis.length > 0 && !selectedCombustiveis.includes(carro.combustivel_name)) return false;
    if (selectedCor.length > 0 && !selectedCor.includes(carro.cor_nome)) return false;
    if (selectedAro.length > 0 && !selectedAro.includes(carro.aro_name)) return false;

    const anoFrom = anoRange[0] ? parseInt(anoRange[0], 10) : null;
    const anoTo = anoRange[1] ? parseInt(anoRange[1], 10) : null;
    if (anoFrom && carro.ano < anoFrom) return false;
    if (anoTo && carro.ano > anoTo) return false;

    const precoFrom = precoRange[0] ? parseFloat(precoRange[0]) : null;
    const precoTo = precoRange[1] ? parseFloat(precoRange[1]) : null;
    const valor = parseFloat(carro.valor);
    if (precoFrom && valor < precoFrom) return false;
    if (precoTo && valor > precoTo) return false;

    return true;
  });

  return (
    <div>
      <h1 className={style.semiNovos}>Carros Filtrados</h1>
      <div className={style.mainContainer}>
        <div className={style.filtros}>
          <FilterBox
            label="Marca"
            options={marcas}
            selectedOptions={selectedMarcas}
            onChange={(option) => toggleOption(option, selectedMarcas, setSelectedMarcas)}
          />
          <hr />
          <FilterBox
            label="Categoria"
            options={categorias}
            selectedOptions={selectedCategorias}
            onChange={(option) => toggleOption(option, selectedCategorias, setSelectedCategorias)}
          />
          <hr />
          <FilterBox
            label="Modelo"
            options={modelos}
            selectedOptions={selectedModelos}
            onChange={(option) => toggleOption(option, selectedModelos, setSelectedModelos)}
          />
          <hr />
          <RangeInput
            label="Ano"
            placeholderFrom="de"
            placeholderTo="até"
            exampleFrom="ex:2020"
            exampleTo="ex:2024"
            values={anoRange}
            onChange={setAnoRange}
          />
          <hr />
          <RangeInput
            label="Preço"
            placeholderFrom="de"
            placeholderTo="até"
            exampleFrom="ex:10000"
            exampleTo="ex:50000"
            values={precoRange}
            onChange={setPrecoRange}
          />
          <hr />
          <FilterBox
            label="Combustível"
            options={combustiveis}
            selectedOptions={selectedCombustiveis}
            onChange={(option) => toggleOption(option, selectedCombustiveis, setSelectedCombustiveis)}
          />
          <hr />
          <FilterBox
            label="Cor"
            options={cores}
            selectedOptions={selectedCor}
            onChange={(option) => toggleOption(option, selectedCor, setSelectedCor)}
          />
          <hr />
          <FilterBox
            label="Aro"
            options={aros}
            selectedOptions={selectedAro}
            onChange={(option) => toggleOption(option, selectedAro, setSelectedAro)}
          />
        </div>
        <div className={style.fundoCarro}>
          {loading ? (
            <p>Carregando carros...</p>
          ) : carrosFiltrados.length === 0 ? (
            <p>Nenhum carro encontrado.</p>
          ) : (
            carrosFiltrados.map((carro) => <CarCard key={carro.id} carro={carro} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default SemiNovos;