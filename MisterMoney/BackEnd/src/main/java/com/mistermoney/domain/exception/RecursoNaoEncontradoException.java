package com.mistermoney.domain.exception;

/** Recurso inexistente ou fora do escopo do usuário autenticado. */
public class RecursoNaoEncontradoException extends DomainException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
