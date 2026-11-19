package com.mistermoney.application.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/** DTO de saída da API. Separa o contrato HTTP do modelo de domínio. */
public record DashboardResponse(List<SaldoContaResponse> saldos,
                                List<ResumoMensalResponse> resumoMensal,
                                List<ReceitaAnualResponse> receitaAnual,
                                List<ProgressoOrcamentoResponse> orcamentos) {

    public record SaldoContaResponse(long contaId, String tipo, String nome, BigDecimal saldo) {
    }

    public record ResumoMensalResponse(long contaId, LocalDate mes, BigDecimal receita, BigDecimal custos,
                                       BigDecimal impostos, BigDecimal lucroLiquido) {
    }

    public record ReceitaAnualResponse(long contaId, int ano, BigDecimal receitaAno) {
    }

    public record ProgressoOrcamentoResponse(long orcamentoId, String categoria, LocalDate mes,
                                             BigDecimal limite, BigDecimal gasto, BigDecimal percentual,
                                             boolean estourou) {
    }
}
