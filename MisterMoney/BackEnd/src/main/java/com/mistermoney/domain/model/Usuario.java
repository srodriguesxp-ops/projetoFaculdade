package com.mistermoney.domain.model;

import com.mistermoney.domain.exception.DomainException;

import java.time.LocalDateTime;
import java.util.Objects;

/** Entidade raiz do domínio: todas as demais são escopadas a um usuário. */
public final class Usuario {

    private final Long id;
    private final String nome;
    private final String email;
    private final String senhaHash;
    private final LocalDateTime criadoEm;

    public Usuario(Long id, String nome, String email, String senhaHash, LocalDateTime criadoEm) {
        if (nome == null || nome.isBlank()) {
            throw new DomainException("Nome do usuário é obrigatório.");
        }
        if (email == null || !email.contains("@")) {
            throw new DomainException("E-mail do usuário é inválido.");
        }
        if (senhaHash == null || senhaHash.isBlank()) {
            throw new DomainException("Hash da senha é obrigatório.");
        }
        this.id = id;
        this.nome = nome.trim();
        this.email = email.trim().toLowerCase();
        this.senhaHash = senhaHash;
        this.criadoEm = criadoEm == null ? LocalDateTime.now() : criadoEm;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getSenhaHash() {
        return senhaHash;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    @Override
    public boolean equals(Object objeto) {
        if (this == objeto) return true;
        if (!(objeto instanceof Usuario outro)) return false;
        return id != null && Objects.equals(id, outro.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
