package com.mistermoney.domain.valueobject;

import com.mistermoney.domain.exception.DomainException;

/** Espelha o CHECK da coluna impostos.tipo. */
public enum TipoImposto {
    IRPF("irpf"),
    DAS("das");

    private final String valor;

    TipoImposto(String valor) {
        this.valor = valor;
    }

    public String valor() {
        return valor;
    }

    public static TipoImposto de(String valor) {
        for (TipoImposto tipo : values()) {
            if (tipo.valor.equalsIgnoreCase(valor)) {
                return tipo;
            }
        }
        throw new DomainException("Tipo de imposto inválido: " + valor);
    }
}
