package com.mistermoney.domain.readmodel;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Projeção da view v_resumo_mensal. */
public record ResumoMensal(long contaId, LocalDate mes, BigDecimal receita, BigDecimal custos,
                           BigDecimal impostos, BigDecimal lucroLiquido) {
}
