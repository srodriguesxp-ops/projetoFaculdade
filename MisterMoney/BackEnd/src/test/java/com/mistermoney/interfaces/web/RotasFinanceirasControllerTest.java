package com.mistermoney.interfaces.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mistermoney.application.dto.FinanceiroRequest;
import com.mistermoney.application.dto.FinanceiroResponse;
import com.mistermoney.application.service.GestaoFinanceiraService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
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

/** Cobre as rotas de transações, transferências, orçamentos e impostos. */
@WebMvcTest(controllers = {TransacoesController.class, TransferenciasController.class,
        OrcamentosController.class, ImpostosController.class})
class RotasFinanceirasControllerTest {

    private static final long USUARIO = 2L;
    private static final long ID = 5L;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GestaoFinanceiraService servico;

    @Test
    void rotasDeTransacoes() throws Exception {
        when(servico.listarTransacoes(USUARIO)).thenReturn(List.of(transacao()));
        when(servico.criarTransacao(eq(USUARIO), any(FinanceiroRequest.Transacao.class)))
                .thenReturn(transacao());
        when(servico.atualizarTransacao(eq(USUARIO), eq(ID), any(FinanceiroRequest.Transacao.class)))
                .thenReturn(transacao());
        String corpo = objectMapper.writeValueAsString(new FinanceiroRequest.Transacao(
                1L, 3L, "despesa", new BigDecimal("120.50"), "Mercado", LocalDate.of(2026, 11, 19)));

        mockMvc.perform(get("/api/usuarios/2/transacoes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].descricao").value("Mercado"));
        mockMvc.perform(post("/api/usuarios/2/transacoes")
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(ID));
        mockMvc.perform(put("/api/usuarios/2/transacoes/5")
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/usuarios/2/transacoes/5"))
                .andExpect(status().isNoContent());

        verify(servico).excluirTransacao(USUARIO, ID);
    }

    @Test
    void rotasDeTransferencias() throws Exception {
        when(servico.listarTransferencias(USUARIO)).thenReturn(List.of(transferencia()));
        when(servico.criarTransferencia(eq(USUARIO), any(FinanceiroRequest.Transferencia.class)))
                .thenReturn(transferencia());
        when(servico.atualizarTransferencia(eq(USUARIO), eq(ID),
                any(FinanceiroRequest.Transferencia.class))).thenReturn(transferencia());
        String corpo = objectMapper.writeValueAsString(new FinanceiroRequest.Transferencia(
                1L, 2L, new BigDecimal("250"), "Aporte", LocalDate.of(2026, 11, 19)));

        mockMvc.perform(get("/api/usuarios/2/transferencias"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].origemNome").value("Pessoal"));
        mockMvc.perform(post("/api/usuarios/2/transferencias")
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(ID));
        mockMvc.perform(put("/api/usuarios/2/transferencias/5")
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/usuarios/2/transferencias/5"))
                .andExpect(status().isNoContent());

        verify(servico).excluirTransferencia(USUARIO, ID);
    }

    @Test
    void rotasDeOrcamentos() throws Exception {
        when(servico.listarOrcamentos(USUARIO)).thenReturn(List.of(orcamento()));
        when(servico.criarOrcamento(eq(USUARIO), any(FinanceiroRequest.Orcamento.class)))
                .thenReturn(orcamento());
        when(servico.atualizarOrcamento(eq(USUARIO), eq(ID), any(FinanceiroRequest.Orcamento.class)))
                .thenReturn(orcamento());
        String corpo = objectMapper.writeValueAsString(
                new FinanceiroRequest.Orcamento(3L, "2026-11", new BigDecimal("800")));

        mockMvc.perform(get("/api/usuarios/2/orcamentos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].categoria").value("Alimentação"));
        mockMvc.perform(post("/api/usuarios/2/orcamentos")
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(ID));
        mockMvc.perform(put("/api/usuarios/2/orcamentos/5")
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/usuarios/2/orcamentos/5"))
                .andExpect(status().isNoContent());

        verify(servico).excluirOrcamento(USUARIO, ID);
    }

    @Test
    void rotasDeImpostos() throws Exception {
        when(servico.listarImpostos(USUARIO)).thenReturn(List.of(imposto()));
        when(servico.criarImposto(eq(USUARIO), any(FinanceiroRequest.Imposto.class)))
                .thenReturn(imposto());
        when(servico.atualizarImposto(eq(USUARIO), eq(ID), any(FinanceiroRequest.Imposto.class)))
                .thenReturn(imposto());
        String corpo = objectMapper.writeValueAsString(new FinanceiroRequest.Imposto(
                2L, "das", "2026-11", new BigDecimal("67.50"),
                LocalDate.of(2026, 11, 30), LocalDate.of(2026, 11, 19)));

        mockMvc.perform(get("/api/usuarios/2/impostos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].contaNome").value("MEI"));
        mockMvc.perform(post("/api/usuarios/2/impostos")
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(ID));
        mockMvc.perform(put("/api/usuarios/2/impostos/5")
                        .contentType(MediaType.APPLICATION_JSON).content(corpo))
                .andExpect(status().isOk());
        mockMvc.perform(delete("/api/usuarios/2/impostos/5"))
                .andExpect(status().isNoContent());

        verify(servico).excluirImposto(USUARIO, ID);
    }

    private FinanceiroResponse.Transacao transacao() {
        return new FinanceiroResponse.Transacao(ID, 1L, "Pessoal", 3L, "Alimentação",
                "despesa", new BigDecimal("120.50"), "Mercado", LocalDate.of(2026, 11, 19));
    }

    private FinanceiroResponse.Transferencia transferencia() {
        return new FinanceiroResponse.Transferencia(ID, 1L, "Pessoal", 2L, "MEI",
                new BigDecimal("250"), "Aporte", LocalDate.of(2026, 11, 19));
    }

    private FinanceiroResponse.Orcamento orcamento() {
        return new FinanceiroResponse.Orcamento(ID, 3L, "Alimentação",
                LocalDate.of(2026, 11, 1), new BigDecimal("800"),
                new BigDecimal("120.50"), new BigDecimal("15.06"), false);
    }

    private FinanceiroResponse.Imposto imposto() {
        return new FinanceiroResponse.Imposto(ID, 2L, "MEI", "das",
                LocalDate.of(2026, 11, 1), new BigDecimal("67.50"),
                LocalDate.of(2026, 11, 30), LocalDate.of(2026, 11, 19), true);
    }
}
