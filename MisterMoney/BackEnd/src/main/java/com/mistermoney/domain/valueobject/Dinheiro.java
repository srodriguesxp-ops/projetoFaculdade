package com.mistermoney.domain.valueobject;

import com.mistermoney.domain.exception.DomainException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

/** Value object para valores monetários. Imutável e sempre com duas casas decimais. */
public final class Dinheiro {

    private static final int ESCALA = 2;

    private final BigDecimal valor;

    private Dinheiro(BigDecimal valor) {
        this.valor = valor.setScale(ESCALA, RoundingMode.HALF_UP);
    }

    public static Dinheiro de(BigDecimal valor) {
        if (valor == null) {
            throw new DomainException("Valor monetário não pode ser nulo.");
        }
        return new Dinheiro(valor);
    }

    public static Dinheiro de(String valor) {
        try {
            return de(new BigDecimal(valor));
        } catch (NumberFormatException e) {
            throw new DomainException("Valor monetário inválido: " + valor, e);
        }
    }

    public static Dinheiro zero() {
        return de(BigDecimal.ZERO);
    }

    public Dinheiro somar(Dinheiro outro) {
        return new Dinheiro(this.valor.add(outro.valor));
    }

    public Dinheiro subtrair(Dinheiro outro) {
        return new Dinheiro(this.valor.subtract(outro.valor));
    }

    public boolean ePositivo() {
        return this.valor.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean eMaiorQue(Dinheiro outro) {
        return this.valor.compareTo(outro.valor) > 0;
    }

    public BigDecimal valor() {
        return valor;
    }

    @Override
    public boolean equals(Object objeto) {
        if (this == objeto) return true;
        if (!(objeto instanceof Dinheiro outro)) return false;
        return this.valor.compareTo(outro.valor) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(valor.stripTrailingZeros());
    }

    @Override
    public String toString() {
        return valor.toPlainString();
    }
}
