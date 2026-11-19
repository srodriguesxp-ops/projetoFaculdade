package com.mistermoney.interfaces.web;

import com.mistermoney.domain.exception.DomainException;
import com.mistermoney.domain.exception.RecursoNaoEncontradoException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/** Converte erros de domínio e de persistência em respostas HTTP previsíveis. */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<Map<String, String>> tratarRecursoNaoEncontrado(
            RecursoNaoEncontradoException excecao) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("erro", excecao.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> tratarConflito(DataIntegrityViolationException excecao) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("erro", "Registro viola uma regra do banco (duplicidade ou vínculo existente)."));
    }

    @ExceptionHandler(DomainException.class)
    public ResponseEntity<Map<String, String>> tratarErroDeDominio(DomainException excecao) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("erro", excecao.getMessage()));
    }
}
