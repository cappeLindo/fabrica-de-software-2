"use client";
import React, { createContext, useContext, useState } from 'react';

const EstadoContext = createContext();

export function EstadoProvider({ children }) {
  const [estadoSelecionado, setEstadoSelecionado] = useState("");
  return (
    <EstadoContext.Provider value={{ estadoSelecionado, setEstadoSelecionado }}>
      {children}
    </EstadoContext.Provider>
  );
}

export function useEstado() {
  return useContext(EstadoContext);
}
