package com.mistermoney.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTOs de entrada do CRUD financeiro. As anotações barram payloads inválidos
 * na camada HTTP; as regras de negócio continuam no domínio, no serviço.
 */
public final class FinanceiroRequest {

    private FinanceiroRequest() {
    }

    public record Conta(
            @NotBlank(message = "Tipo da conta é obrigatório") String tipo,
            @NotBlank(message = "Nome da conta é obrigatório") @Size(max = 120) String nome,
            @Size(max = 30) String documento,
            @DecimalMin(value = "0", message = "Saldo inicial não pode ser negativo")
            BigDecimal saldoInicial) {
    }

    public record Categoria(
            @Positive(message = "Conta da categoria é obrigatória") long contaId,
            @NotBlank(message = "Nome da categoria é obrigatório") @Size(max = 120) String nome,
            @NotBlank(message = "Tipo da categoria é obrigatório") String tipo) {
    }

    public record Transacao(
            @Positive(message = "Conta da transação é obrigatória") long contaId,
            Long categoriaId,
            @NotBlank(message = "Tipo da transação é obrigatório") String tipo,
            @NotNull(message = "Valor da transação é obrigatório")
            @DecimalMin(value = "0.01", message = "Valor da transação deve ser positivo")
            BigDecimal valor,
            @Size(max = 200) String descricao,
            LocalDate data) {
    }

    public record Transferencia(
            @Positive(message = "Conta de origem é obrigatória") long origemContaId,
            @Positive(message = "Conta de destino é obrigatória") long destinoContaId,
            @NotNull(message = "Valor da transferência é obrigatório")
            @DecimalMin(value = "0.01", message = "Valor da transferência deve ser positivo")
            BigDecimal valor,
            @Size(max = 200) String descricao,
            LocalDate data) {
    }

    /** {@code mes} no formato {@code AAAA-MM}; normalizado para o dia 1 pelo domínio. */
    public record Orcamento(
            @Positive(message = "Categoria do orçamento é obrigatória") long categoriaId,
            @NotBlank(message = "Mês do orçamento é obrigatório") String mes,
            @NotNull(message = "Limite do orçamento é obrigatório")
            @DecimalMin(value = "0.01", message = "Limite do orçamento deve ser positivo")
            BigDecimal limite) {
    }

    /** {@code competencia} no formato {@code AAAA-MM}; normalizado para o dia 1 pelo domínio. */
    public record Imposto(
            @Positive(message = "Conta do imposto é obrigatória") long contaId,
            @NotBlank(message = "Tipo do imposto é obrigatório") String tipo,
            @NotBlank(message = "Competência do imposto é obrigatória") String competencia,
            @NotNull(message = "Valor estimado é obrigatório")
            @DecimalMin(value = "0", message = "Valor estimado não pode ser negativo")
            BigDecimal valorEstimado,
            LocalDate vencimento,
            LocalDate pagoEm) {
    }
}
