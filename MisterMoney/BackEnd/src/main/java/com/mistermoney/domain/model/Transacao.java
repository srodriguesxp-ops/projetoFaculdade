package com.mistermoney.domain.model;

import com.mistermoney.domain.exception.DomainException;
import com.mistermoney.domain.valueobject.Dinheiro;
import com.mistermoney.domain.valueobject.TipoTransacao;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Lançamento financeiro: receita, despesa ou imposto. */
public final class Transacao {

    private final Long id;
    private final long usuarioId;
    private final long contaId;
    private final Long categoriaId;
    private final TipoTransacao tipo;
    private final Dinheiro valor;
    private final String descricao;
    private final LocalDate data;
    private final LocalDateTime criadoEm;

    public Transacao(Long id, long usuarioId, long contaId, Long categoriaId, TipoTransacao tipo,
                     Dinheiro valor, String descricao, LocalDate data, LocalDateTime criadoEm) {
        if (tipo == null) {
            throw new DomainException("Tipo da transação é obrigatório.");
        }
        if (valor == null || !valor.ePositivo()) {
            throw new DomainException("Valor da transação deve ser positivo.");
        }
        this.id = id;
        this.usuarioId = usuarioId;
        this.contaId = contaId;
        this.categoriaId = categoriaId;
        this.tipo = tipo;
        this.valor = valor;
        this.descricao = descricao;
        this.data = data == null ? LocalDate.now() : data;
        this.criadoEm = criadoEm == null ? LocalDateTime.now() : criadoEm;
    }

    public boolean eReceita() {
        return tipo.eReceita();
    }

    public boolean eDespesaOuImposto() {
        return tipo.eDespesaOuImposto();
    }

    public boolean eDaConta(long idConta) {
        return this.contaId == idConta;
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

    public Long getCategoriaId() {
        return categoriaId;
    }

    public TipoTransacao getTipo() {
        return tipo;
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
