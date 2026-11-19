package com.mistermoney.domain.model;

import com.mistermoney.domain.exception.DomainException;
import com.mistermoney.domain.valueobject.Dinheiro;
import com.mistermoney.domain.valueobject.TipoConta;

import java.time.LocalDateTime;

/** Conta financeira do usuário (CPF ou CNPJ). */
public final class Conta {

    private final Long id;
    private final long usuarioId;
    private final TipoConta tipo;
    private final String nome;
    private final String documento;
    private final Dinheiro saldoInicial;
    private final LocalDateTime criadoEm;

    public Conta(Long id, long usuarioId, TipoConta tipo, String nome, String documento,
                 Dinheiro saldoInicial, LocalDateTime criadoEm) {
        if (tipo == null) {
            throw new DomainException("Tipo da conta é obrigatório.");
        }
        if (nome == null || nome.isBlank()) {
            throw new DomainException("Nome da conta é obrigatório.");
        }
        this.id = id;
        this.usuarioId = usuarioId;
        this.tipo = tipo;
        this.nome = nome.trim();
        this.documento = documento;
        this.saldoInicial = saldoInicial == null ? Dinheiro.zero() : saldoInicial;
        this.criadoEm = criadoEm == null ? LocalDateTime.now() : criadoEm;
    }

    public boolean ePessoaJuridica() {
        return tipo.ePessoaJuridica();
    }

    public boolean pertenceA(long idUsuario) {
        return this.usuarioId == idUsuario;
    }

    public Long getId() {
        return id;
    }

    public long getUsuarioId() {
        return usuarioId;
    }

    public TipoConta getTipo() {
        return tipo;
    }

    public String getNome() {
        return nome;
    }

    public String getDocumento() {
        return documento;
    }

    public Dinheiro getSaldoInicial() {
        return saldoInicial;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }
}
