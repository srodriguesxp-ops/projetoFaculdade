package com.mistermoney.domain.model;

import com.mistermoney.domain.exception.DomainException;
import com.mistermoney.domain.valueobject.Competencia;
import com.mistermoney.domain.valueobject.Dinheiro;

import java.time.LocalDateTime;

/** Limite de gasto de uma categoria em um mês. */
public final class Orcamento {

    private final Long id;
    private final long usuarioId;
    private final long categoriaId;
    private final Competencia mes;
    private final Dinheiro limite;
    private final LocalDateTime criadoEm;

    public Orcamento(Long id, long usuarioId, long categoriaId, Competencia mes,
                     Dinheiro limite, LocalDateTime criadoEm) {
        if (mes == null) {
            throw new DomainException("Mês do orçamento é obrigatório.");
        }
        if (limite == null || !limite.ePositivo()) {
            throw new DomainException("Limite do orçamento deve ser positivo.");
        }
        this.id = id;
        this.usuarioId = usuarioId;
        this.categoriaId = categoriaId;
        this.mes = mes;
        this.limite = limite;
        this.criadoEm = criadoEm == null ? LocalDateTime.now() : criadoEm;
    }

    public Long getId() {
        return id;
    }

    public long getUsuarioId() {
        return usuarioId;
    }

    public long getCategoriaId() {
        return categoriaId;
    }

    public Competencia getMes() {
        return mes;
    }

    public Dinheiro getLimite() {
        return limite;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
