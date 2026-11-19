package com.mistermoney.domain.readmodel;

import java.util.List;

/** Agregado de leitura que reúne todos os indicadores do dashboard. */
public record Dashboard(List<SaldoConta> saldos,
                        List<ResumoMensal> resumoMensal,
                        List<ReceitaAnual> receitaAnual,
                        List<ProgressoOrcamento> orcamentos) {

    public Dashboard {
        saldos = List.copyOf(saldos);
        resumoMensal = List.copyOf(resumoMensal);
        receitaAnual = List.copyOf(receitaAnual);
        orcamentos = List.copyOf(orcamentos);
    }
}
