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

/** Adaptador de entrada: CRUD de orçamentos. */
@RestController
@RequestMapping("/api/usuarios/{usuarioId}/orcamentos")
public class OrcamentosController {

    private final GestaoFinanceiraService servico;

    public OrcamentosController(GestaoFinanceiraService servico) {
        this.servico = servico;
    }

    @GetMapping
    public List<FinanceiroResponse.Orcamento> listar(@PathVariable long usuarioId) {
        return servico.listarOrcamentos(usuarioId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FinanceiroResponse.Orcamento criar(@PathVariable long usuarioId,
                                              @RequestBody FinanceiroRequest.Orcamento pedido) {
        return servico.criarOrcamento(usuarioId, pedido);
    }

    @PutMapping("/{id}")
    public FinanceiroResponse.Orcamento atualizar(@PathVariable long usuarioId, @PathVariable long id,
                                                  @RequestBody FinanceiroRequest.Orcamento pedido) {
        return servico.atualizarOrcamento(usuarioId, id, pedido);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable long usuarioId, @PathVariable long id) {
        servico.excluirOrcamento(usuarioId, id);
    }
}
