package com.mistermoney.application.ports;

import com.mistermoney.domain.model.Conta;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/** Porta de saída para contas do usuário. */
public interface RepositorioContas {

    List<Conta> listar(long usuarioId);

    Optional<Conta> buscar(long usuarioId, long id);

    /** Saldos calculados pela view v_saldo_contas, indexados por contaId. */
    Map<Long, java.math.BigDecimal> saldosAtuais(long usuarioId);

    Conta salvar(Conta conta);

    void excluir(long usuarioId, long id);
}
