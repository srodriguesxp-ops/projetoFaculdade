package com.mistermoney.domain.valueobject;

import com.mistermoney.domain.exception.DomainException;

/** Espelha o CHECK da coluna transacoes.tipo. */
public enum TipoTransacao {
    RECEITA("receita"),
    DESPESA("despesa"),
    IMPOSTO("imposto");

    private final String valor;

    TipoTransacao(String valor) {
        this.valor = valor;
    }

    public String valor() {
        return valor;
    }

    public boolean eReceita() {
        return this == RECEITA;
    }

    public boolean eDespesaOuImposto() {
        return this == DESPESA || this == IMPOSTO;
    }

    public static TipoTransacao de(String valor) {
        for (TipoTransacao tipo : values()) {
            if (tipo.valor.equalsIgnoreCase(valor)) {
                return tipo;
            }
        }
        throw new DomainException("Tipo de transação inválido: " + valor);
    }
}
