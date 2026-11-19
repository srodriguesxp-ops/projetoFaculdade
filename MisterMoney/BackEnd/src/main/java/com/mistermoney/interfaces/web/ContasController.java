package com.mistermoney.interfaces.web;

import com.mistermoney.application.dto.FinanceiroRequest;
import com.mistermoney.application.dto.FinanceiroResponse;
import com.mistermoney.application.service.GestaoFinanceiraService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Adaptador de entrada: CRUD de contas. */
@RestController
@RequestMapping("/api/usuarios/{usuarioId}/contas")
public class ContasController {

    private final GestaoFinanceiraService servico;

    public ContasController(GestaoFinanceiraService servico) {
        this.servico = servico;
    }

    @GetMapping
    public List<FinanceiroResponse.Conta> listar(@PathVariable long usuarioId) {
        return servico.listarContas(usuarioId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FinanceiroResponse.Conta criar(@PathVariable long usuarioId,
                                          @RequestBody FinanceiroRequest.Conta pedido) {
        return servico.criarConta(usuarioId, pedido);
    }

    @PutMapping("/{id}")
    public FinanceiroResponse.Conta atualizar(@PathVariable long usuarioId, @PathVariable long id,
                                              @RequestBody FinanceiroRequest.Conta pedido) {
        return servico.atualizarConta(usuarioId, id, pedido);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable long usuarioId, @PathVariable long id) {
        servico.excluirConta(usuarioId, id);
    }
}
