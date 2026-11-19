package com.mistermoney.domain.readmodel;

import java.math.BigDecimal;

/** Projeção da view v_saldo_contas. */
public record SaldoConta(long contaId, String tipo, String nome, BigDecimal saldo) {
}
