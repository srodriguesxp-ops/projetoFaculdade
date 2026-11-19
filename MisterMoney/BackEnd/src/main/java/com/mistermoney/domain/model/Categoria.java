package com.mistermoney.domain.model;

import com.mistermoney.domain.exception.DomainException;
import com.mistermoney.domain.valueobject.TipoCategoria;

/** Categoria de lançamento, sempre vinculada a uma conta e a um usuário. */
public final class Categoria {

    private final Long id;
    private final long usuarioId;
    private final long contaId;
    private final String nome;
    private final TipoCategoria tipo;

    public Categoria(Long id, long usuarioId, long contaId, String nome, TipoCategoria tipo) {
        if (nome == null || nome.isBlank()) {
            throw new DomainException("Nome da categoria é obrigatório.");
        }
        if (tipo == null) {
            throw new DomainException("Tipo da categoria é obrigatório.");
        }
        this.id = id;
        this.usuarioId = usuarioId;
        this.contaId = contaId;
        this.nome = nome.trim();
        this.tipo = tipo;
    }

    public Long getId() {
        return id;
    }

    public long getUsuarioId() {
        return usuarioId;
    }

    public long getContaId() {
        return contaId;
    }

    public String getNome() {
        return nome;
    }

    public TipoCategoria getTipo() {
        return tipo;
    }
}
