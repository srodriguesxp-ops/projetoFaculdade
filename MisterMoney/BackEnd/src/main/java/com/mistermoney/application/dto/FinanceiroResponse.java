package com.mistermoney.application.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/** DTOs de saída do CRUD financeiro. O domínio nunca é exposto diretamente. */
public final class FinanceiroResponse {

    private FinanceiroResponse() {
    }

    public record Conta(long id, String tipo, String nome, String documento,
                        BigDecimal saldoInicial, BigDecimal saldo) {
    }

    public record Categoria(long id, long contaId, String nome, String tipo) {
    }

    public record Transacao(long id, long contaId, String contaNome, Long categoriaId,
                            String categoriaNome, String tipo, BigDecimal valor,
                            String descricao, LocalDate data) {
    }

    public record Transferencia(long id, long origemContaId, String origemNome,
                                long destinoContaId, String destinoNome, BigDecimal valor,
                                String descricao, LocalDate data) {
    }

    public record Orcamento(long id, long categoriaId, String categoria, LocalDate mes,
                            BigDecimal limite, BigDecimal gasto, BigDecimal percentual,
                            boolean estourou) {
    }

    public record Imposto(long id, long contaId, String contaNome, String tipo,
                          LocalDate competencia, BigDecimal valorEstimado,
                          LocalDate vencimento, LocalDate pagoEm, boolean pago) {
    }
}
