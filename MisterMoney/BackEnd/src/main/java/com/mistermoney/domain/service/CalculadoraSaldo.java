package com.mistermoney.domain.service;

import com.mistermoney.domain.model.Conta;
import com.mistermoney.domain.model.Transacao;
import com.mistermoney.domain.model.Transferencia;
import com.mistermoney.domain.valueobject.Dinheiro;

import java.util.Collection;
import java.util.Objects;

/**
 * Serviço de domínio com a regra de cálculo de saldo.
 * A view v_saldo_contas do banco implementa a mesma regra; esta classe a mantém
 * no domínio para testes e para futuras validações antes de gravar lançamentos.
 */
public final class CalculadoraSaldo {

    public Dinheiro calcular(Conta conta, Collection<Transacao> transacoes,
                             Collection<Transferencia> transferencias) {
        Objects.requireNonNull(conta, "Conta é obrigatória.");
        Objects.requireNonNull(transacoes, "Transações são obrigatórias.");
        Objects.requireNonNull(transferencias, "Transferências são obrigatórias.");

        Dinheiro saldo = conta.getSaldoInicial();

        for (Transacao transacao : transacoes) {
            if (!transacao.eDaConta(conta.getId())) {
                continue;
            }
            saldo = transacao.eReceita()
                    ? saldo.somar(transacao.getValor())
                    : saldo.subtrair(transacao.getValor());
        }

        for (Transferencia transferencia : transferencias) {
            if (transferencia.getOrigemContaId() == conta.getId()) {
                saldo = saldo.subtrair(transferencia.getValor());
            }
            if (transferencia.getDestinoContaId() == conta.getId()) {
                saldo = saldo.somar(transferencia.getValor());
            }
        }

        return saldo;
    }
}
