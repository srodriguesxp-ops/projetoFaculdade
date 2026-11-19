package com.mistermoney.domain.exception;

/** Violação de uma regra de negócio do domínio MisterMoney. */
public class DomainException extends RuntimeException {

    public DomainException(String mensagem) {
        super(mensagem);
    }

    public DomainException(String mensagem, Throwable causa) {
        super(mensagem, causa);
    }
}
