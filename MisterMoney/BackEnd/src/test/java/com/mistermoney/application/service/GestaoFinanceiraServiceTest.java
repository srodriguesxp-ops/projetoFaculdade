package com.mistermoney.application.service;

import com.mistermoney.application.dto.FinanceiroRequest;
import com.mistermoney.application.dto.FinanceiroResponse;
import com.mistermoney.application.ports.RepositorioCategorias;
import com.mistermoney.application.ports.RepositorioContas;
import com.mistermoney.application.ports.RepositorioDashboard;
import com.mistermoney.application.ports.RepositorioImpostos;
import com.mistermoney.application.ports.RepositorioOrcamentos;
import com.mistermoney.application.ports.RepositorioTransferencias;
import com.mistermoney.application.ports.RepositorioTransacoes;
import com.mistermoney.domain.exception.DomainException;
import com.mistermoney.domain.exception.RecursoNaoEncontradoException;
import com.mistermoney.domain.model.Categoria;
import com.mistermoney.domain.model.Conta;
import com.mistermoney.domain.model.Imposto;
import com.mistermoney.domain.model.Orcamento;
import com.mistermoney.domain.model.Transacao;
import com.mistermoney.domain.model.Transferencia;
import com.mistermoney.domain.valueobject.Dinheiro;
import com.mistermoney.domain.valueobject.TipoCategoria;
import com.mistermoney.domain.valueobject.TipoConta;
import com.mistermoney.domain.valueobject.TipoImposto;
import com.mistermoney.domain.valueobject.TipoTransacao;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** Testes unitários do serviço de aplicação, sem banco nem HTTP. */
@ExtendWith(MockitoExtension.class)
class GestaoFinanceiraServiceTest {

    private static final long USUARIO = 2L;

    @Mock
    private RepositorioContas repositorioContas;
    @Mock
    private RepositorioCategorias repositorioCategorias;
    @Mock
    private RepositorioTransacoes repositorioTransacoes;
    @Mock
    private RepositorioTransferencias repositorioTransferencias;
    @Mock
    private RepositorioOrcamentos repositorioOrcamentos;
    @Mock
    private RepositorioImpostos repositorioImpostos;
    @Mock
    private RepositorioDashboard repositorioDashboard;

    @InjectMocks
    private GestaoFinanceiraService servico;

    @Test
    void criarContaSemSaldoInicialDeveSalvarZero() {
        when(repositorioContas.salvar(any(Conta.class))).thenAnswer(invocacao -> {
            Conta recebida = invocacao.getArgument(0);
            return new Conta(9L, recebida.getUsuarioId(), recebida.getTipo(), recebida.getNome(),
                    recebida.getDocumento(), recebida.getSaldoInicial(), recebida.getCriadoEm());
        });

        FinanceiroResponse.Conta resposta = servico.criarConta(USUARIO,
                new FinanceiroRequest.Conta("cpf", "Pessoal", "123", null));

        ArgumentCaptor<Conta> captor = ArgumentCaptor.forClass(Conta.class);
        verify(repositorioContas).salvar(captor.capture());
        assertEquals(USUARIO, captor.getValue().getUsuarioId());
        assertMesmoValor(BigDecimal.ZERO, captor.getValue().getSaldoInicial().valor());
        assertMesmoValor(BigDecimal.ZERO, resposta.saldoInicial());
        assertMesmoValor(BigDecimal.ZERO, resposta.saldo());
    }

    @Test
    void listarContasDeveUsarSaldoCalculadoPelaView() {
        when(repositorioContas.listar(USUARIO)).thenReturn(List.of(conta(1L, "Pessoal")));
        when(repositorioContas.saldosAtuais(USUARIO))
                .thenReturn(Map.of(1L, new BigDecimal("7500.00")));

        List<FinanceiroResponse.Conta> resposta = servico.listarContas(USUARIO);

        assertEquals(1, resposta.size());
        assertMesmoValor(new BigDecimal("7500.00"), resposta.get(0).saldo());
        assertMesmoValor(BigDecimal.ZERO, resposta.get(0).saldoInicial());
    }

    @Test
    void atualizarContaInexistenteDeveLancarRecursoNaoEncontrado() {
        when(repositorioContas.buscar(USUARIO, 99L)).thenReturn(Optional.empty());

        assertThrows(RecursoNaoEncontradoException.class, () -> servico.atualizarConta(USUARIO, 99L,
                new FinanceiroRequest.Conta("cpf", "Pessoal", "123", BigDecimal.TEN)));
    }

    @Test
    void excluirContaDeveDelegarAoRepositorio() {
        servico.excluirConta(USUARIO, 4L);
        verify(repositorioContas).excluir(USUARIO, 4L);
    }

    @Test
    void criarTransacaoDevePreencherOsNomesDeContaECategoria() {
        when(repositorioTransacoes.salvar(any(Transacao.class))).thenAnswer(invocacao -> {
            Transacao recebida = invocacao.getArgument(0);
            return new Transacao(55L, recebida.getUsuarioId(), recebida.getContaId(),
                    recebida.getCategoriaId(), recebida.getTipo(), recebida.getValor(),
                    recebida.getDescricao(), recebida.getData(), recebida.getCriadoEm());
        });
        when(repositorioContas.listar(USUARIO)).thenReturn(List.of(conta(1L, "Pessoal")));
        when(repositorioCategorias.listarCategorias(USUARIO))
                .thenReturn(List.of(categoria(3L, "Alimentação")));

        FinanceiroResponse.Transacao resposta = servico.criarTransacao(USUARIO,
                new FinanceiroRequest.Transacao(1L, 3L, "despesa", new BigDecimal("120.50"),
                        "Mercado", LocalDate.of(2026, 11, 19)));

        assertEquals(55L, resposta.id());
        assertEquals("Pessoal", resposta.contaNome());
        assertEquals("Alimentação", resposta.categoriaNome());
        assertEquals("despesa", resposta.tipo());
        assertMesmoValor(new BigDecimal("120.50"), resposta.valor());
    }

    @Test
    void criarTransferenciaParaAMesmaContaDeveSerRejeitadaAntesDeSalvar() {
        FinanceiroRequest.Transferencia pedido = new FinanceiroRequest.Transferencia(
                1L, 1L, BigDecimal.TEN, "Inválida", LocalDate.of(2026, 11, 19));

        assertThrows(DomainException.class, () -> servico.criarTransferencia(USUARIO, pedido));
        verifyNoInteractions(repositorioTransferencias);
    }

    @Test
    void criarTransferenciaDevePreencherOsNomesDasContas() {
        when(repositorioTransferencias.salvar(any(Transferencia.class))).thenAnswer(invocacao -> {
            Transferencia recebida = invocacao.getArgument(0);
            return new Transferencia(8L, recebida.getUsuarioId(), recebida.getOrigemContaId(),
                    recebida.getDestinoContaId(), recebida.getValor(), recebida.getDescricao(),
                    recebida.getData(), recebida.getCriadoEm());
        });
        when(repositorioContas.listar(USUARIO)).thenReturn(List.of(
                conta(1L, "Pessoal"), conta(2L, "MEI")));

        FinanceiroResponse.Transferencia resposta = servico.criarTransferencia(USUARIO,
                new FinanceiroRequest.Transferencia(1L, 2L, new BigDecimal("250"),
                        "Aporte", LocalDate.of(2026, 11, 19)));

        assertEquals("Pessoal", resposta.origemNome());
        assertEquals("MEI", resposta.destinoNome());
        assertMesmoValor(new BigDecimal("250"), resposta.valor());
    }

    @Test
    void criarOrcamentoDeveNormalizarCompetenciaParaODiaUm() {
        when(repositorioOrcamentos.salvar(any(Orcamento.class))).thenAnswer(invocacao -> {
            Orcamento recebido = invocacao.getArgument(0);
            return new Orcamento(4L, recebido.getUsuarioId(), recebido.getCategoriaId(),
                    recebido.getMes(), recebido.getLimite(), recebido.getCriadoEm());
        });
        when(repositorioCategorias.listarCategorias(USUARIO))
                .thenReturn(List.of(categoria(3L, "Alimentação")));

        FinanceiroResponse.Orcamento resposta = servico.criarOrcamento(USUARIO,
                new FinanceiroRequest.Orcamento(3L, "2026-11", new BigDecimal("800")));

        assertEquals(LocalDate.of(2026, 11, 1), resposta.mes());
        assertEquals("Alimentação", resposta.categoria());
        assertMesmoValor(BigDecimal.ZERO, resposta.gasto());
        assertFalse(resposta.estourou());
    }

    @Test
    void competenciaInvalidaDeveSerRejeitada() {
        assertThrows(DomainException.class, () -> servico.criarOrcamento(USUARIO,
                new FinanceiroRequest.Orcamento(3L, "aaa-11", new BigDecimal("800"))));
        verifyNoInteractions(repositorioOrcamentos);
    }

    @Test
    void criarImpostoComDataDePagamentoDeveMarcarComoPago() {
        when(repositorioImpostos.salvar(any(Imposto.class))).thenAnswer(invocacao -> {
            Imposto recebido = invocacao.getArgument(0);
            return new Imposto(6L, recebido.getUsuarioId(), recebido.getContaId(), recebido.getTipo(),
                    recebido.getCompetencia(), recebido.getValorEstimado(), recebido.getVencimento(),
                    recebido.getPagoEm(), recebido.getCriadoEm());
        });
        when(repositorioContas.listar(USUARIO)).thenReturn(List.of(conta(2L, "MEI")));

        FinanceiroResponse.Imposto resposta = servico.criarImposto(USUARIO,
                new FinanceiroRequest.Imposto(2L, "das", "2026-11", new BigDecimal("67.50"),
                        LocalDate.of(2026, 11, 30), LocalDate.of(2026, 11, 19)));

        assertTrue(resposta.pago());
        assertEquals(LocalDate.of(2026, 11, 19), resposta.pagoEm());
        assertEquals(LocalDate.of(2026, 11, 1), resposta.competencia());
        assertEquals("MEI", resposta.contaNome());
    }

    @Test
    void escritasDevemSerTransacionaisELeiturasSomenteLeitura() {
        Transactional classe = GestaoFinanceiraService.class.getAnnotation(Transactional.class);
        assertNotNull(classe);
        assertTrue(classe.readOnly());

        for (Method metodo : GestaoFinanceiraService.class.getDeclaredMethods()) {
            if (!Modifier.isPublic(metodo.getModifiers())) {
                continue;
            }
            Transactional anotacao = metodo.getAnnotation(Transactional.class);
            boolean leitura = metodo.getName().startsWith("listar");
            if (leitura) {
                // Leituras herdam o readOnly da classe; não precisam redeclarar.
                assertTrue(anotacao == null || anotacao.readOnly(),
                        () -> metodo.getName() + " não deveria gravar");
            } else {
                assertNotNull(anotacao, () -> metodo.getName() + " deveria declarar @Transactional");
                assertFalse(anotacao.readOnly(),
                        () -> metodo.getName() + " deveria abrir transação de escrita");
            }
        }
    }

    private void assertMesmoValor(BigDecimal esperado, BigDecimal atual) {
        assertEquals(0, esperado.compareTo(atual),
                () -> "Esperado " + esperado + " mas veio " + atual);
    }

    private Conta conta(long id, String nome) {
        return new Conta(id, USUARIO, TipoConta.CPF, nome, "123", Dinheiro.zero(), null);
    }

    private Categoria categoria(long id, String nome) {
        return new Categoria(id, USUARIO, 1L, nome, TipoCategoria.DESPESA);
    }
}
