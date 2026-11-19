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

/** Adaptador de entrada: CRUD de transações. */
@RestController
@RequestMapping("/api/usuarios/{usuarioId}/transacoes")
public class TransacoesController {

    private final GestaoFinanceiraService servico;

    public TransacoesController(GestaoFinanceiraService servico) {
        this.servico = servico;
    }

    @GetMapping
    public List<FinanceiroResponse.Transacao> listar(@PathVariable long usuarioId) {
        return servico.listarTransacoes(usuarioId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FinanceiroResponse.Transacao criar(@PathVariable long usuarioId,
                                              @RequestBody FinanceiroRequest.Transacao pedido) {
        return servico.criarTransacao(usuarioId, pedido);
    }

    @PutMapping("/{id}")
    public FinanceiroResponse.Transacao atualizar(@PathVariable long usuarioId, @PathVariable long id,
                                                  @RequestBody FinanceiroRequest.Transacao pedido) {
        return servico.atualizarTransacao(usuarioId, id, pedido);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable long usuarioId, @PathVariable long id) {
        servico.excluirTransacao(usuarioId, id);
    }
}
