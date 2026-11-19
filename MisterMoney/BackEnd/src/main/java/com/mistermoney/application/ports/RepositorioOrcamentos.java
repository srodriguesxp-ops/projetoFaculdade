package com.mistermoney.application.ports;

import com.mistermoney.domain.model.Orcamento;

import java.util.List;
import java.util.Optional;

/** Porta de saída para orçamentos do usuário. */
public interface RepositorioOrcamentos {

    List<Orcamento> listarOrcamentos(long usuarioId);

    Optional<Orcamento> buscarOrcamento(long usuarioId, long id);

    Orcamento salvar(Orcamento orcamento);

    void excluirOrcamento(long usuarioId, long id);
}
