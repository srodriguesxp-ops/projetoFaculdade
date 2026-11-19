package com.mistermoney.application.mapper;

import com.mistermoney.application.dto.DashboardResponse;
import com.mistermoney.domain.readmodel.Dashboard;
import com.mistermoney.domain.readmodel.ProgressoOrcamento;
import com.mistermoney.domain.readmodel.ReceitaAnual;
import com.mistermoney.domain.readmodel.ResumoMensal;
import com.mistermoney.domain.readmodel.SaldoConta;

/** Traduz modelos de leitura do domínio em DTOs da API. */
public final class DashboardMapper {

    private DashboardMapper() {
    }

    public static DashboardResponse paraResponse(Dashboard dashboard) {
        return new DashboardResponse(
                dashboard.saldos().stream().map(DashboardMapper::paraResponse).toList(),
                dashboard.resumoMensal().stream().map(DashboardMapper::paraResponse).toList(),
                dashboard.receitaAnual().stream().map(DashboardMapper::paraResponse).toList(),
                dashboard.orcamentos().stream().map(DashboardMapper::paraResponse).toList()
        );
    }

    private static DashboardResponse.SaldoContaResponse paraResponse(SaldoConta saldo) {
        return new DashboardResponse.SaldoContaResponse(
                saldo.contaId(), saldo.tipo(), saldo.nome(), saldo.saldo());
    }

    private static DashboardResponse.ResumoMensalResponse paraResponse(ResumoMensal resumo) {
        return new DashboardResponse.ResumoMensalResponse(
                resumo.contaId(), resumo.mes(), resumo.receita(), resumo.custos(),
                resumo.impostos(), resumo.lucroLiquido());
    }

    private static DashboardResponse.ReceitaAnualResponse paraResponse(ReceitaAnual receita) {
        return new DashboardResponse.ReceitaAnualResponse(
                receita.contaId(), receita.ano(), receita.receitaAno());
    }

    private static DashboardResponse.ProgressoOrcamentoResponse paraResponse(ProgressoOrcamento orcamento) {
        return new DashboardResponse.ProgressoOrcamentoResponse(
                orcamento.orcamentoId(), orcamento.categoria(), orcamento.mes(), orcamento.limite(),
                orcamento.gasto(), orcamento.percentual(), orcamento.estourou());
    }
}
