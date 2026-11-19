package com.mistermoney.domain.valueobject;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DinheiroTest {

    @Test
    void deveSomarESubtrairMantendoDuasCasasDecimais() {
        Dinheiro saldo = Dinheiro.de(new BigDecimal("1000"));
        Dinheiro resultado = saldo.somar(Dinheiro.de("3500.50")).subtrair(Dinheiro.de("450.25"));

        assertEquals(new BigDecimal("4050.25"), resultado.valor());
    }

    @Test
    void naoDeveAceitarValorMonetarioNulo() {
        assertThrows(RuntimeException.class, () -> Dinheiro.de((BigDecimal) null));
    }
}
