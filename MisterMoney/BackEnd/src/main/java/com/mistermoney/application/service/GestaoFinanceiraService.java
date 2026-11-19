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
import com.mistermoney.domain.model.Transferencia;
import com.mistermoney.domain.model.Transacao;
import com.mistermoney.domain.readmodel.ProgressoOrcamento;
import com.mistermoney.domain.valueobject.Competencia;
import com.mistermoney.domain.valueobject.Dinheiro;
import com.mistermoney.domain.valueobject.TipoCategoria;
import com.mistermoney.domain.valueobject.TipoConta;
import com.mistermoney.domain.valueobject.TipoImposto;
import com.mistermoney.domain.valueobject.TipoTransacao;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Serviço de aplicação do CRUD financeiro. Conhece as portas e as regras de
 * montagem dos DTOs, mas não sabe se os dados vêm de JDBC, JPA ou de uma API.
 */
@Service
@Transactional(readOnly = true)
public class GestaoFinanceiraService {

    private final RepositorioContas repositorioContas;
    private final RepositorioCategorias repositorioCategorias;
    private final RepositorioTransacoes repositorioTransacoes;
    private final RepositorioTransferencias repositorioTransferencias;
    private final RepositorioOrcamentos repositorioOrcamentos;
    private final RepositorioImpostos repositorioImpostos;
    private final RepositorioDashboard repositorioDashboard;

    public GestaoFinanceiraService(RepositorioContas repositorioContas,
                                   RepositorioCategorias repositorioCategorias,
                                   RepositorioTransacoes repositorioTransacoes,
                                   RepositorioTransferencias repositorioTransferencias,
                                   RepositorioOrcamentos repositorioOrcamentos,
                                   RepositorioImpostos repositorioImpostos,
                                   RepositorioDashboard repositorioDashboard) {
        this.repositorioContas = repositorioContas;
        this.repositorioCategorias = repositorioCategorias;
        this.repositorioTransacoes = repositorioTransacoes;
        this.repositorioTransferencias = repositorioTransferencias;
        this.repositorioOrcamentos = repositorioOrcamentos;
        this.repositorioImpostos = repositorioImpostos;
        this.repositorioDashboard = repositorioDashboard;
    }

    // ---------------------------------------------------------------- contas

    public java.util.List<FinanceiroResponse.Conta> listarContas(long usuarioId) {
        Map<Long, BigDecimal> saldos = repositorioContas.saldosAtuais(usuarioId);
        return repositorioContas.listar(usuarioId).stream()
                .map(conta -> paraResponse(conta, saldos.getOrDefault(conta.getId(),
                        conta.getSaldoInicial().valor())))
                .toList();
    }

    @Transactional
    public FinanceiroResponse.Conta criarConta(long usuarioId, FinanceiroRequest.Conta pedido) {
        BigDecimal saldo = pedido.saldoInicial() == null
                ? BigDecimal.ZERO : pedido.saldoInicial();
        Conta conta = repositorioContas.salvar(new Conta(null, usuarioId,
                TipoConta.de(pedido.tipo()), pedido.nome(), pedido.documento(),
                Dinheiro.de(saldo), null));
        return paraResponse(conta, saldo);
    }

    @Transactional
    public FinanceiroResponse.Conta atualizarConta(long usuarioId, long id,
                                                   FinanceiroRequest.Conta pedido) {
        Conta atual = obrigatorio(repositorioContas.buscar(usuarioId, id), "Conta não encontrada.");
        BigDecimal saldo = repositorioContas.saldosAtuais(usuarioId)
                .getOrDefault(id, atual.getSaldoInicial().valor());
        Conta conta = repositorioContas.salvar(new Conta(id, usuarioId,
                TipoConta.de(pedido.tipo()), pedido.nome(), pedido.documento(),
                Dinheiro.de(pedido.saldoInicial() == null
                        ? atual.getSaldoInicial().valor() : pedido.saldoInicial()),
                atual.getCriadoEm()));
        return paraResponse(conta, saldo);
    }

    @Transactional
    public void excluirConta(long usuarioId, long id) {
        repositorioContas.excluir(usuarioId, id);
    }

    private FinanceiroResponse.Conta paraResponse(Conta conta, BigDecimal saldo) {
        return new FinanceiroResponse.Conta(conta.getId(), conta.getTipo().valor(), conta.getNome(),
                conta.getDocumento(), conta.getSaldoInicial().valor(), saldo);
    }

    // ------------------------------------------------------------ categorias

    public java.util.List<FinanceiroResponse.Categoria> listarCategorias(long usuarioId) {
        return repositorioCategorias.listarCategorias(usuarioId).stream()
                .map(categoria -> new FinanceiroResponse.Categoria(categoria.getId(),
                        categoria.getContaId(), categoria.getNome(), categoria.getTipo().valor()))
                .toList();
    }

    @Transactional
    public FinanceiroResponse.Categoria criarCategoria(long usuarioId,
                                                       FinanceiroRequest.Categoria pedido) {
        obrigarConta(usuarioId, pedido.contaId());
        return paraResponse(repositorioCategorias.salvar(new Categoria(null, usuarioId,
                pedido.contaId(), pedido.nome(), TipoCategoria.de(pedido.tipo()))));
    }

    @Transactional
    public FinanceiroResponse.Categoria atualizarCategoria(long usuarioId, long id,
                                                           FinanceiroRequest.Categoria pedido) {
        obrigatorio(repositorioCategorias.buscarCategoria(usuarioId, id), "Categoria não encontrada.");
        obrigarConta(usuarioId, pedido.contaId());
        return paraResponse(repositorioCategorias.salvar(new Categoria(id, usuarioId,
                pedido.contaId(), pedido.nome(), TipoCategoria.de(pedido.tipo()))));
    }

    @Transactional
    public void excluirCategoria(long usuarioId, long id) {
        repositorioCategorias.excluirCategoria(usuarioId, id);
    }

    private FinanceiroResponse.Categoria paraResponse(Categoria categoria) {
        return new FinanceiroResponse.Categoria(categoria.getId(), categoria.getContaId(),
                categoria.getNome(), categoria.getTipo().valor());
    }

    // ------------------------------------------------------------ transações

    public java.util.List<FinanceiroResponse.Transacao> listarTransacoes(long usuarioId) {
        Map<Long, String> nomesContas = nomesContas(usuarioId);
        Map<Long, String> nomesCategorias = nomesCategorias(usuarioId);
        return repositorioTransacoes.listarTransacoes(usuarioId).stream()
                .map(transacao -> paraResponse(transacao, nomesContas, nomesCategorias))
                .toList();
    }

    @Transactional
    public FinanceiroResponse.Transacao criarTransacao(long usuarioId,
                                                       FinanceiroRequest.Transacao pedido) {
        validarReferenciasTransacao(usuarioId, pedido);
        return paraResponse(repositorioTransacoes.salvar(paraDominio(usuarioId, null, pedido)),
                nomesContas(usuarioId), nomesCategorias(usuarioId));
    }

    @Transactional
    public FinanceiroResponse.Transacao atualizarTransacao(long usuarioId, long id,
                                                           FinanceiroRequest.Transacao pedido) {
        Transacao atual = obrigatorio(repositorioTransacoes.buscarTransacao(usuarioId, id), "Transação não encontrada.");
        validarReferenciasTransacao(usuarioId, pedido);
        Transacao salva = repositorioTransacoes.salvar(paraDominio(usuarioId, id, pedido));
        return paraResponse(salva, nomesContas(usuarioId), nomesCategorias(usuarioId));
    }

    @Transactional
    public void excluirTransacao(long usuarioId, long id) {
        repositorioTransacoes.excluirTransacao(usuarioId, id);
    }

    private Transacao paraDominio(long usuarioId, Long id, FinanceiroRequest.Transacao pedido) {
        return new Transacao(id, usuarioId, pedido.contaId(), pedido.categoriaId(),
                TipoTransacao.de(pedido.tipo()), Dinheiro.de(pedido.valor()),
                pedido.descricao(), pedido.data(), null);
    }

    private FinanceiroResponse.Transacao paraResponse(Transacao transacao,
                                                      Map<Long, String> nomesContas,
                                                      Map<Long, String> nomesCategorias) {
        return new FinanceiroResponse.Transacao(transacao.getId(), transacao.getContaId(),
                nomesContas.getOrDefault(transacao.getContaId(), ""),
                transacao.getCategoriaId(),
                transacao.getCategoriaId() == null ? null : nomesCategorias.get(transacao.getCategoriaId()),
                transacao.getTipo().valor(), transacao.getValor().valor(),
                transacao.getDescricao(), transacao.getData());
    }

    // --------------------------------------------------------- transferências

    public java.util.List<FinanceiroResponse.Transferencia> listarTransferencias(long usuarioId) {
        Map<Long, String> nomes = nomesContas(usuarioId);
        return repositorioTransferencias.listarTransferencias(usuarioId).stream()
                .map(item -> paraResponse(item, nomes))
                .toList();
    }

    @Transactional
    public FinanceiroResponse.Transferencia criarTransferencia(
            long usuarioId, FinanceiroRequest.Transferencia pedido) {
        Conta origem = validarTransferencia(usuarioId, pedido);
        Transferencia salva = repositorioTransferencias.salvar(new Transferencia(null, usuarioId,
                pedido.origemContaId(), pedido.destinoContaId(), Dinheiro.de(pedido.valor()),
                pedido.descricao(), pedido.data(), null));
        return paraResponse(salva, nomesContas(usuarioId));
    }

    @Transactional
    public FinanceiroResponse.Transferencia atualizarTransferencia(
            long usuarioId, long id, FinanceiroRequest.Transferencia pedido) {
        obrigatorio(repositorioTransferencias.buscarTransferencia(usuarioId, id), "Transferência não encontrada.");
        validarTransferencia(usuarioId, pedido);
        Transferencia salva = repositorioTransferencias.salvar(new Transferencia(id, usuarioId,
                pedido.origemContaId(), pedido.destinoContaId(), Dinheiro.de(pedido.valor()),
                pedido.descricao(), pedido.data(), null));
        return paraResponse(salva, nomesContas(usuarioId));
    }

    @Transactional
    public void excluirTransferencia(long usuarioId, long id) {
        repositorioTransferencias.excluirTransferencia(usuarioId, id);
    }

    private FinanceiroResponse.Transferencia paraResponse(Transferencia item,
                                                          Map<Long, String> nomes) {
        return new FinanceiroResponse.Transferencia(item.getId(), item.getOrigemContaId(),
                nomes.getOrDefault(item.getOrigemContaId(), ""), item.getDestinoContaId(),
                nomes.getOrDefault(item.getDestinoContaId(), ""), item.getValor().valor(),
                item.getDescricao(), item.getData());
    }

    // ------------------------------------------------------------ orçamentos

    public java.util.List<FinanceiroResponse.Orcamento> listarOrcamentos(long usuarioId) {
        Map<Long, String> nomes = nomesCategorias(usuarioId);
        Map<Long, ProgressoOrcamento> progressos =
                repositorioDashboard.progressoDosOrcamentosDoUsuario(usuarioId).stream()
                        .collect(Collectors.toMap(ProgressoOrcamento::orcamentoId, Function.identity(),
                                (primeiro, segundo) -> primeiro));
        return repositorioOrcamentos.listarOrcamentos(usuarioId).stream()
                .map(item -> paraResponse(item, nomes, progressos))
                .toList();
    }

    @Transactional
    public FinanceiroResponse.Orcamento criarOrcamento(long usuarioId,
                                                       FinanceiroRequest.Orcamento pedido) {
        obrigarCategoria(usuarioId, pedido.categoriaId());
        Orcamento salvo = repositorioOrcamentos.salvar(new Orcamento(null, usuarioId,
                pedido.categoriaId(), competenciaDe(pedido.mes()), Dinheiro.de(pedido.limite()), null));
        return paraResponse(salvo, nomesCategorias(usuarioId), Map.of());
    }

    @Transactional
    public FinanceiroResponse.Orcamento atualizarOrcamento(long usuarioId, long id,
                                                           FinanceiroRequest.Orcamento pedido) {
        Orcamento atual = obrigatorio(repositorioOrcamentos.buscarOrcamento(usuarioId, id), "Orçamento não encontrado.");
        obrigarCategoria(usuarioId, pedido.categoriaId());
        Orcamento salvo = repositorioOrcamentos.salvar(new Orcamento(id, usuarioId,
                pedido.categoriaId(), competenciaDe(pedido.mes()), Dinheiro.de(pedido.limite()),
                atual.getCriadoEm()));
        return paraResponse(salvo, nomesCategorias(usuarioId), Map.of());
    }

    @Transactional
    public void excluirOrcamento(long usuarioId, long id) {
        repositorioOrcamentos.excluirOrcamento(usuarioId, id);
    }

    private FinanceiroResponse.Orcamento paraResponse(Orcamento item,
                                                      Map<Long, String> nomes,
                                                      Map<Long, ProgressoOrcamento> progressos) {
        ProgressoOrcamento progresso = progressos.get(item.getId());
        return new FinanceiroResponse.Orcamento(item.getId(), item.getCategoriaId(),
                nomes.getOrDefault(item.getCategoriaId(), ""), item.getMes().comoData(),
                item.getLimite().valor(),
                progresso == null ? BigDecimal.ZERO : progresso.gasto(),
                progresso == null ? BigDecimal.ZERO : progresso.percentual(),
                progresso != null && progresso.estourou());
    }

    // --------------------------------------------------------------- impostos

    public java.util.List<FinanceiroResponse.Imposto> listarImpostos(long usuarioId) {
        Map<Long, String> nomes = nomesContas(usuarioId);
        return repositorioImpostos.listarImpostos(usuarioId).stream()
                .map(item -> paraResponse(item, nomes))
                .toList();
    }

    @Transactional
    public FinanceiroResponse.Imposto criarImposto(long usuarioId, FinanceiroRequest.Imposto pedido) {
        obrigarConta(usuarioId, pedido.contaId());
        Imposto salvo = repositorioImpostos.salvar(paraDominio(usuarioId, null, pedido));
        return paraResponse(salvo, nomesContas(usuarioId));
    }

    @Transactional
    public FinanceiroResponse.Imposto atualizarImposto(long usuarioId, long id,
                                                       FinanceiroRequest.Imposto pedido) {
        obrigatorio(repositorioImpostos.buscarImposto(usuarioId, id), "Imposto não encontrado.");
        obrigarConta(usuarioId, pedido.contaId());
        return paraResponse(repositorioImpostos.salvar(paraDominio(usuarioId, id, pedido)),
                nomesContas(usuarioId));
    }

    @Transactional
    public void excluirImposto(long usuarioId, long id) {
        repositorioImpostos.excluirImposto(usuarioId, id);
    }

    private Imposto paraDominio(long usuarioId, Long id, FinanceiroRequest.Imposto pedido) {
        return new Imposto(id, usuarioId, pedido.contaId(), TipoImposto.de(pedido.tipo()),
                competenciaDe(pedido.competencia()), Dinheiro.de(pedido.valorEstimado()),
                pedido.vencimento(), pedido.pagoEm(), null);
    }

    private FinanceiroResponse.Imposto paraResponse(Imposto item, Map<Long, String> nomes) {
        return new FinanceiroResponse.Imposto(item.getId(), item.getContaId(),
                nomes.getOrDefault(item.getContaId(), ""), item.getTipo().valor(),
                item.getCompetencia().comoData(), item.getValorEstimado().valor(),
                item.getVencimento(), item.getPagoEm(), item.estaPago());
    }

    // ----------------------------------------------------------------- comum

    /** Toda chave estrangeira do payload precisa apontar para um registro do próprio usuário. */
    private Conta obrigarConta(long usuarioId, long contaId) {
        return obrigatorio(repositorioContas.buscar(usuarioId, contaId), "Conta não encontrada.");
    }

    private void obrigarCategoria(long usuarioId, long categoriaId) {
        obrigatorio(repositorioCategorias.buscarCategoria(usuarioId, categoriaId), "Categoria não encontrada.");
    }

    private void validarReferenciasTransacao(long usuarioId, FinanceiroRequest.Transacao pedido) {
        obrigarConta(usuarioId, pedido.contaId());
        if (pedido.categoriaId() != null) {
            obrigarCategoria(usuarioId, pedido.categoriaId());
        }
    }

    private Conta validarTransferencia(long usuarioId, FinanceiroRequest.Transferencia pedido) {
        Conta origem = obrigarConta(usuarioId, pedido.origemContaId());
        obrigarConta(usuarioId, pedido.destinoContaId());
        BigDecimal saldo = repositorioContas.saldosAtuais(usuarioId)
                .getOrDefault(origem.getId(), origem.getSaldoInicial().valor());
        if (pedido.valor() == null || saldo.compareTo(pedido.valor()) < 0) {
            throw new DomainException("Saldo insuficiente na conta de origem.");
        }
        return origem;
    }

    private Map<Long, String> nomesContas(long usuarioId) {
        return repositorioContas.listar(usuarioId).stream()
                .collect(Collectors.toMap(Conta::getId, Conta::getNome, (a, b) -> a));
    }

    private Map<Long, String> nomesCategorias(long usuarioId) {
        return repositorioCategorias.listarCategorias(usuarioId).stream()
                .collect(Collectors.toMap(Categoria::getId, Categoria::getNome, (a, b) -> a));
    }

    private <T> T obrigatorio(Optional<T> item, String mensagem) {
        return item.orElseThrow(() -> new RecursoNaoEncontradoException(mensagem));
    }

    /** Aceita "2026-11" e "2026-11-01"; o banco exige sempre o dia 1. */
    private Competencia competenciaDe(String valor) {
        if (valor == null || valor.isBlank()) {
            return Competencia.atual();
        }
        try {
            return Competencia.de(YearMonth.parse(valor.substring(0, Math.min(7, valor.length()))));
        } catch (DateTimeParseException excecao) {
            throw new DomainException("Competência inválida: " + valor, excecao);
        }
    }
}
