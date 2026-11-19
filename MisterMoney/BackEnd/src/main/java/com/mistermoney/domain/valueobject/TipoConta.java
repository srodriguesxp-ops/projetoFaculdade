package com.mistermoney.domain.valueobject;

import com.mistermoney.domain.exception.DomainException;

/** Espelha o CHECK da coluna contas.tipo. */
public enum TipoConta {
    CPF("cpf"),
    CNPJ("cnpj");

    private final String valor;

    TipoConta(String valor) {
        this.valor = valor;
    }

    public String valor() {
        return valor;
    }

    public boolean ePessoaJuridica() {
        return this == CNPJ;
    }

    public static TipoConta de(String valor) {
        for (TipoConta tipo : values()) {
            if (tipo.valor.equalsIgnoreCase(valor)) {
                return tipo;
            }
        }
        throw new DomainException("Tipo de conta inválido: " + valor);
    }
}
