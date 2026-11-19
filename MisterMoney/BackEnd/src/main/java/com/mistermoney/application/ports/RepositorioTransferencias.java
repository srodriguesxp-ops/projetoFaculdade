package com.mistermoney.application.ports;

import com.mistermoney.domain.model.Transferencia;

import java.util.List;
import java.util.Optional;

/** Porta de saída para transferências entre contas do usuário. */
public interface RepositorioTransferencias {

    List<Transferencia> listarTransferencias(long usuarioId);

    Optional<Transferencia> buscarTransferencia(long usuarioId, long id);

    Transferencia salvar(Transferencia transferencia);

    void excluirTransferencia(long usuarioId, long id);
}
