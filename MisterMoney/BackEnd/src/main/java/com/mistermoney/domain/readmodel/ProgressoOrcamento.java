package com.mistermoney.domain.readmodel;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Projeção da view v_orcamento_progresso. */
public record ProgressoOrcamento(long orcamentoId, String categoria, LocalDate mes, BigDecimal limite,
                                 BigDecimal gasto, BigDecimal percentual, boolean estourou) {
}
