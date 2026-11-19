package com.mistermoney.application.ports;

import com.mistermoney.domain.model.Transacao;

import java.util.List;
import java.util.Optional;

/** Porta de saída para lançamentos do usuário. */
public interface RepositorioTransacoes {

    List<Transacao> listarTransacoes(long usuarioId);

    Optional<Transacao> buscarTransacao(long usuarioId, long id);

    Transacao salvar(Transacao transacao);

    void excluirTransacao(long usuarioId, long id);
}
