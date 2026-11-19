package com.mistermoney.application.ports;

import com.mistermoney.domain.seed.CenarioInicial;

/** Porta de saída para a carga inicial de desenvolvimento. */
public interface RepositorioSeed {

    boolean bancoVazio();

    void salvar(CenarioInicial cenario);
}
