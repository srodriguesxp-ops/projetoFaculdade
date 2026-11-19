package com.mistermoney.domain.model;

import com.mistermoney.domain.exception.DomainException;
import com.mistermoney.domain.valueobject.Competencia;
import com.mistermoney.domain.valueobject.Dinheiro;
import com.mistermoney.domain.valueobject.TipoImposto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Imposto estimado ou pago de uma conta (IRPF ou DAS). */
public final class Imposto {

    private final Long id;
    private final long usuarioId;
    private final long contaId;
    private final TipoImposto tipo;
    private final Competencia competencia;
    private final Dinheiro valorEstimado;
    private final LocalDate vencimento;
    private final LocalDate pagoEm;
    private final LocalDateTime criadoEm;

    public Imposto(Long id, long usuarioId, long contaId, TipoImposto tipo, Competencia competencia,
                   Dinheiro valorEstimado, LocalDate vencimento, LocalDate pagoEm, LocalDateTime criadoEm) {
        if (tipo == null) {
            throw new DomainException("Tipo de imposto é obrigatório.");
        }
        if (competencia == null) {
            throw new DomainException("Competência do imposto é obrigatória.");
        }
        if (valorEstimado == null) {
            throw new DomainException("Valor estimado do imposto é obrigatório.");
        }
        this.id = id;
        this.usuarioId = usuarioId;
        this.contaId = contaId;
        this.tipo = tipo;
        this.competencia = competencia;
        this.valorEstimado = valorEstimado;
        this.vencimento = vencimento;
        this.pagoEm = pagoEm;
        this.criadoEm = criadoEm == null ? LocalDateTime.now() : criadoEm;
    }

    public boolean estaPago() {
        return pagoEm != null;
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

    public TipoImposto getTipo() {
        return tipo;
    }

    public Competencia getCompetencia() {
        return competencia;
    }

    public Dinheiro getValorEstimado() {
        return valorEstimado;
    }

    public LocalDate getVencimento() {
        return vencimento;
    }

    public LocalDate getPagoEm() {
        return pagoEm;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
