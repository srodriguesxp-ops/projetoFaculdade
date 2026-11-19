package com.mistermoney.application.ports;

import com.mistermoney.domain.readmodel.ProgressoOrcamento;
import com.mistermoney.domain.readmodel.ReceitaAnual;
import com.mistermoney.domain.readmodel.ResumoMensal;
import com.mistermoney.domain.readmodel.SaldoConta;

import java.util.List;

/** Porta de saída: consultas de indicadores. A infraestrutura implementa sem vazar SQL. */
public interface RepositorioDashboard {

    List<SaldoConta> saldosDoUsuario(long usuarioId);

    List<ResumoMensal> resumoMensalDoUsuario(long usuarioId);

    List<ReceitaAnual> receitaAnualDoUsuario(long usuarioId);

    List<ProgressoOrcamento> progressoDosOrcamentosDoUsuario(long usuarioId);
}
