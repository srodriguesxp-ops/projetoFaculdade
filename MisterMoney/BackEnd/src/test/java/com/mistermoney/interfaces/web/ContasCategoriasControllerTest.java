package com.mistermoney.interfaces.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mistermoney.application.dto.FinanceiroRequest;
import com.mistermoney.application.dto.FinanceiroResponse;
import com.mistermoney.application.service.GestaoFinanceiraService;
import com.mistermoney.domain.exception.DomainException;
import com.mistermoney.domain.exception.RecursoNaoEncontradoException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testes de camada HTTP: rotas, status e tradução de erros para JSON. */
@WebMvcTest(controllers = {ContasController.class, CategoriasController.class})
class ContasCategoriasControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GestaoFinanceiraService servico;

    @Test
    void listarContasDeveResponder200() throws Exception {
        when(servico.listarContas(2L)).thenReturn(List.of(conta()));

        mockMvc.perform(get("/api/usuarios/2/contas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].nome").value("Pessoal"));
    }

    @Test
    void criarContaDeveResponder201ChamandoOServico() throws Exception {
        when(servico.criarConta(eq(2L), any(FinanceiroRequest.Conta.class))).thenReturn(conta());
        String corpo = objectMapper.writeValueAsString(
                new FinanceiroRequest.Conta("cpf", "Pessoal", "123", BigDecimal.TEN));

        mockMvc.perform(post("/api/usuarios/2/contas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));

        verify(servico).criarConta(eq(2L), any(FinanceiroRequest.Conta.class));
    }

    @Test
    void atualizarContaDeveResponder200() throws Exception {
        when(servico.atualizarConta(eq(2L), eq(1L), any(FinanceiroRequest.Conta.class)))
                .thenReturn(conta());
        String corpo = objectMapper.writeValueAsString(
                new FinanceiroRequest.Conta("cpf", "Pessoal", "123", BigDecimal.TEN));

        mockMvc.perform(put("/api/usuarios/2/contas/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Pessoal"));
    }

    @Test
    void excluirContaDeveResponder204() throws Exception {
        mockMvc.perform(delete("/api/usuarios/2/contas/1"))
                .andExpect(status().isNoContent());

        verify(servico).excluirConta(2L, 1L);
    }

    @Test
    void recursoInexistenteDeveResponder404() throws Exception {
        when(servico.listarCategorias(2L))
                .thenThrow(new RecursoNaoEncontradoException("Categoria não encontrada."));

        mockMvc.perform(get("/api/usuarios/2/categorias"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro").value("Categoria não encontrada."));
    }

    @Test
    void erroDeDominioDeveResponder400() throws Exception {
        when(servico.criarConta(eq(2L), any(FinanceiroRequest.Conta.class)))
                .thenThrow(new DomainException("Tipo de conta inválido: xpto"));
        String corpo = objectMapper.writeValueAsString(
                new FinanceiroRequest.Conta("xpto", "Pessoal", "123", BigDecimal.TEN));

        mockMvc.perform(post("/api/usuarios/2/contas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("Tipo de conta inválido: xpto"));
    }

    @Test
    void violacaoDoBancoDeveResponder409() throws Exception {
        when(servico.criarCategoria(eq(2L), any(FinanceiroRequest.Categoria.class)))
                .thenThrow(new DataIntegrityViolationException("duplicidade"));
        String corpo = objectMapper.writeValueAsString(
                new FinanceiroRequest.Categoria(1L, "Alimentação", "despesa"));

        mockMvc.perform(post("/api/usuarios/2/categorias")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.erro").exists());
    }

    private FinanceiroResponse.Conta conta() {
        return new FinanceiroResponse.Conta(1L, "cpf", "Pessoal", "123",
                BigDecimal.ZERO.setScale(2), BigDecimal.ZERO.setScale(2));
    }
}
