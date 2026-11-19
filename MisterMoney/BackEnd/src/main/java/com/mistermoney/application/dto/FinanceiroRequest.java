package com.mistermoney.application.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/** DTOs de entrada do CRUD financeiro. As regras ficam no domínio, não aqui. */
public final class FinanceiroRequest {

    private FinanceiroRequest() {
    }

    public record Conta(String tipo, String nome, String documento, BigDecimal saldoInicial) {
    }

    public record Categoria(long contaId, String nome, String tipo) {
    }

    public record Transacao(long contaId, Long categoriaId, String tipo, BigDecimal valor,
                            String descricao, LocalDate data) {
    }

    public record Transferencia(long origemContaId, long destinoContaId, BigDecimal valor,
                                String descricao, LocalDate data) {
    }

    /** {@code mes} no formato {@code AAAA-MM}; normalizado para o dia 1 pelo domínio. */
    public record Orcamento(long categoriaId, String mes, BigDecimal limite) {
    }

    /** {@code competencia} no formato {@code AAAA-MM}; normalizado para o dia 1 pelo domínio. */
    public record Imposto(long contaId, String tipo, String competencia, BigDecimal valorEstimado,
                          LocalDate vencimento, LocalDate pagoEm) {
    }
}
