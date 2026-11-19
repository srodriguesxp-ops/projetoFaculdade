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

/** Adaptador de entrada: CRUD de impostos (IRPF e DAS). */
@RestController
@RequestMapping("/api/usuarios/{usuarioId}/impostos")
public class ImpostosController {

    private final GestaoFinanceiraService servico;

    public ImpostosController(GestaoFinanceiraService servico) {
        this.servico = servico;
    }

    @GetMapping
    public List<FinanceiroResponse.Imposto> listar(@PathVariable long usuarioId) {
        return servico.listarImpostos(usuarioId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FinanceiroResponse.Imposto criar(@PathVariable long usuarioId,
                                            @RequestBody FinanceiroRequest.Imposto pedido) {
        return servico.criarImposto(usuarioId, pedido);
    }

    @PutMapping("/{id}")
    public FinanceiroResponse.Imposto atualizar(@PathVariable long usuarioId, @PathVariable long id,
                                                @RequestBody FinanceiroRequest.Imposto pedido) {
        return servico.atualizarImposto(usuarioId, id, pedido);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable long usuarioId, @PathVariable long id) {
        servico.excluirImposto(usuarioId, id);
    }
}
