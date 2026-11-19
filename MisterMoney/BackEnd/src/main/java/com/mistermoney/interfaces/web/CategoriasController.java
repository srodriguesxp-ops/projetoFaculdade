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

/** Adaptador de entrada: CRUD de categorias. */
@RestController
@RequestMapping("/api/usuarios/{usuarioId}/categorias")
public class CategoriasController {

    private final GestaoFinanceiraService servico;

    public CategoriasController(GestaoFinanceiraService servico) {
        this.servico = servico;
    }

    @GetMapping
    public List<FinanceiroResponse.Categoria> listar(@PathVariable long usuarioId) {
        return servico.listarCategorias(usuarioId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FinanceiroResponse.Categoria criar(@PathVariable long usuarioId,
                                              @RequestBody FinanceiroRequest.Categoria pedido) {
        return servico.criarCategoria(usuarioId, pedido);
    }

    @PutMapping("/{id}")
    public FinanceiroResponse.Categoria atualizar(@PathVariable long usuarioId, @PathVariable long id,
                                                  @RequestBody FinanceiroRequest.Categoria pedido) {
        return servico.atualizarCategoria(usuarioId, id, pedido);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable long usuarioId, @PathVariable long id) {
        servico.excluirCategoria(usuarioId, id);
    }
}
