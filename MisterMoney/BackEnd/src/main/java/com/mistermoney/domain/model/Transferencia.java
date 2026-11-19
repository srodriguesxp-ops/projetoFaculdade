package com.mistermoney.domain.model;

import com.mistermoney.domain.exception.DomainException;
import com.mistermoney.domain.valueobject.Dinheiro;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Transferência entre duas contas do mesmo usuário. */
public final class Transferencia {

    private final Long id;
    private final long usuarioId;
    private final long origemContaId;
    private final long destinoContaId;
    private final Dinheiro valor;
    private final String descricao;
    private final LocalDate data;
    private final LocalDateTime criadoEm;

    public Transferencia(Long id, long usuarioId, long origemContaId, long destinoContaId,
                         Dinheiro valor, String descricao, LocalDate data, LocalDateTime criadoEm) {
        if (origemContaId == destinoContaId) {
            throw new DomainException("Origem e destino da transferência devem ser diferentes.");
        }
        if (valor == null || !valor.ePositivo()) {
            throw new DomainException("Valor da transferência deve ser positivo.");
        }
        this.id = id;
        this.usuarioId = usuarioId;
        this.origemContaId = origemContaId;
        this.destinoContaId = destinoContaId;
        this.valor = valor;
        this.descricao = descricao;
        this.data = data == null ? LocalDate.now() : data;
        this.criadoEm = criadoEm == null ? LocalDateTime.now() : criadoEm;
    }

    public Long getId() {
        return id;
    }

    public long getUsuarioId() {
        return usuarioId;
    }

    public long getOrigemContaId() {
        return origemContaId;
    }

    public long getDestinoContaId() {
        return destinoContaId;
    }

    public Dinheiro getValor() {
        return valor;
    }

    public String getDescricao() {
        return descricao;
    }

    public LocalDate getData() {
        return data;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
