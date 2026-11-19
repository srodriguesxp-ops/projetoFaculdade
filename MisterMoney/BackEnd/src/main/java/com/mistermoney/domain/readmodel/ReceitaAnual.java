package com.mistermoney.domain.readmodel;

import java.math.BigDecimal;

/** Projeção da view v_receita_anual. */
public record ReceitaAnual(long contaId, int ano, BigDecimal receitaAno) {
}
