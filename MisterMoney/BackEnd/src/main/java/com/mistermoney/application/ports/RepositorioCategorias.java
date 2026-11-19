package com.mistermoney.application.ports;

import com.mistermoney.domain.model.Categoria;

import java.util.List;
import java.util.Optional;

/** Porta de saída para categorias do usuário. */
public interface RepositorioCategorias {

    List<Categoria> listarCategorias(long usuarioId);

    Optional<Categoria> buscarCategoria(long usuarioId, long id);

    Categoria salvar(Categoria categoria);

    void excluirCategoria(long usuarioId, long id);
}
