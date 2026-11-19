package com.mistermoney.domain.valueobject;

import com.mistermoney.domain.exception.DomainException;

/** Espelha o CHECK da coluna categorias.tipo. */
public enum TipoCategoria {
    DESPESA("despesa"),
    RECEITA("receita");

    private final String valor;

    TipoCategoria(String valor) {
        this.valor = valor;
    }

    public String valor() {
        return valor;
    }

    public static TipoCategoria de(String valor) {
        for (TipoCategoria tipo : values()) {
            if (tipo.valor.equalsIgnoreCase(valor)) {
                return tipo;
            }
        }
        throw new DomainException("Tipo de categoria inválido: " + valor);
    }
}
