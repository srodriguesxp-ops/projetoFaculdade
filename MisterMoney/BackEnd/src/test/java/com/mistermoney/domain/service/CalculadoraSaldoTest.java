package com.mistermoney.domain.service;

import com.mistermoney.domain.model.Conta;
import com.mistermoney.domain.model.Transacao;
import com.mistermoney.domain.model.Transferencia;
import com.mistermoney.domain.valueobject.Dinheiro;
import com.mistermoney.domain.valueobject.TipoConta;
import com.mistermoney.domain.valueobject.TipoTransacao;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CalculadoraSaldoTest {

    @Test
    void deveCalcularSaldoComTransacoesETransferencias() {
        Conta conta = new Conta(1L, 1L, TipoConta.CPF, "Pessoal", null,
                Dinheiro.de("1000.00"), null);
        LocalDate hoje = LocalDate.now();

        List<Transacao> transacoes = List.of(
                new Transacao(null, 1L, 1L, null, TipoTransacao.RECEITA,
                        Dinheiro.de("3500.00"), "Salário", hoje, null),
                new Transacao(null, 1L, 1L, null, TipoTransacao.DESPESA,
                        Dinheiro.de("450.00"), "Mercado", hoje, null),
                new Transacao(null, 1L, 2L, null, TipoTransacao.RECEITA,
                        Dinheiro.de("8200.00"), "Outra conta", hoje, null)
        );
        List<Transferencia> transferencias = List.of(
                new Transferencia(null, 1L, 1L, 2L, Dinheiro.de("800.00"), "Aporte", hoje, null)
        );

        Dinheiro saldo = new CalculadoraSaldo().calcular(conta, transacoes, transferencias);

        assertEquals(new java.math.BigDecimal("3250.00"), saldo.valor());
    }
}
