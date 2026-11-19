package com.mistermoney.domain.valueobject;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Objects;

/** Mês de competência, sempre normalizado para o dia 1 (exigido pelo banco). */
public final class Competencia {

    private final YearMonth mes;

    private Competencia(YearMonth mes) {
        this.mes = mes;
    }

    public static Competencia de(YearMonth mes) {
        return new Competencia(Objects.requireNonNull(mes, "Competência não pode ser nula."));
    }

    public static Competencia de(LocalDate data) {
        return de(YearMonth.from(data));
    }

    public static Competencia atual() {
        return de(YearMonth.now());
    }

    public LocalDate comoData() {
        return mes.atDay(1);
    }

    public YearMonth valor() {
        return mes;
    }

    @Override
    public boolean equals(Object objeto) {
        if (this == objeto) return true;
        if (!(objeto instanceof Competencia outra)) return false;
        return mes.equals(outra.mes);
    }

    @Override
    public int hashCode() {
        return mes.hashCode();
    }

    @Override
    public String toString() {
        return mes.toString();
    }
}
