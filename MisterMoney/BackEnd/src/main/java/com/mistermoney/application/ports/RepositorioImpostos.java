package com.mistermoney.application.ports;

import com.mistermoney.domain.model.Imposto;

import java.util.List;
import java.util.Optional;

/** Porta de saída para impostos do usuário. */
public interface RepositorioImpostos {

    List<Imposto> listarImpostos(long usuarioId);

    Optional<Imposto> buscarImposto(long usuarioId, long id);

    Imposto salvar(Imposto imposto);

    void excluirImposto(long usuarioId, long id);
}
