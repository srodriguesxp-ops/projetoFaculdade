package com.mistermoney.infrastructure.persistence;

import com.mistermoney.application.ports.RepositorioCategorias;
import com.mistermoney.application.ports.RepositorioContas;
import com.mistermoney.application.ports.RepositorioImpostos;
import com.mistermoney.application.ports.RepositorioOrcamentos;
import com.mistermoney.application.ports.RepositorioTransferencias;
import com.mistermoney.application.ports.RepositorioTransacoes;
import com.mistermoney.domain.exception.DomainException;
import com.mistermoney.domain.model.Categoria;
import com.mistermoney.domain.model.Conta;
import com.mistermoney.domain.model.Imposto;
import com.mistermoney.domain.model.Orcamento;
import com.mistermoney.domain.model.Transferencia;
import com.mistermoney.domain.model.Transacao;
import com.mistermoney.domain.valueobject.Competencia;
import com.mistermoney.domain.valueobject.Dinheiro;
import com.mistermoney.domain.valueobject.TipoCategoria;
import com.mistermoney.domain.valueobject.TipoConta;
import com.mistermoney.domain.valueobject.TipoImposto;
import com.mistermoney.domain.valueobject.TipoTransacao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Adaptador de persistência do CRUD financeiro. Implementa as portas de saída
 * com JdbcTemplate; nenhuma SQL aparece na aplicação ou no domínio.
 */
@Repository
public class JdbcRepositorioFinanceiro implements RepositorioContas, RepositorioCategorias,
        RepositorioTransacoes, RepositorioTransferencias, RepositorioOrcamentos, RepositorioImpostos {

    private final JdbcTemplate jdbc;

    public JdbcRepositorioFinanceiro(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ---------------------------------------------------------------- contas

    @Override
    public List<Conta> listar(long usuarioId) {
        return jdbc.query("""
                SELECT id, usuario_id, tipo, nome, documento, saldo_inicial, criado_em
                FROM dbo.contas WHERE usuario_id = ? ORDER BY id
                """, this::mapearConta, usuarioId);
    }

    @Override
    public Optional<Conta> buscar(long usuarioId, long id) {
        return jdbc.query("""
                SELECT id, usuario_id, tipo, nome, documento, saldo_inicial, criado_em
                FROM dbo.contas WHERE usuario_id = ? AND id = ?
                """, this::mapearConta, usuarioId, id).stream().findFirst();
    }

    @Override
    public Map<Long, BigDecimal> saldosAtuais(long usuarioId) {
        Map<Long, BigDecimal> saldos = new HashMap<>();
        jdbc.query("SELECT conta_id, saldo FROM dbo.v_saldo_contas WHERE usuario_id = ?",
                rs -> {
                    saldos.put(rs.getLong("conta_id"), rs.getBigDecimal("saldo"));
                }, usuarioId);
        return saldos;
    }

    @Override
    public Conta salvar(Conta conta) {
        if (conta.getId() == null) {
            long id = inserir("""
                    INSERT INTO dbo.contas (usuario_id, tipo, nome, documento, saldo_inicial)
                    VALUES (?, ?, ?, ?, ?)
                    """, conta.getUsuarioId(), conta.getTipo().valor(), conta.getNome(),
                    conta.getDocumento(), conta.getSaldoInicial().valor());
            return new Conta(id, conta.getUsuarioId(), conta.getTipo(), conta.getNome(),
                    conta.getDocumento(), conta.getSaldoInicial(), conta.getCriadoEm());
        }
        jdbc.update("""
                UPDATE dbo.contas SET tipo = ?, nome = ?, documento = ?, saldo_inicial = ?
                WHERE id = ? AND usuario_id = ?
                """, conta.getTipo().valor(), conta.getNome(), conta.getDocumento(),
                conta.getSaldoInicial().valor(), conta.getId(), conta.getUsuarioId());
        return conta;
    }

    @Override
    public void excluir(long usuarioId, long id) {
        jdbc.update("DELETE FROM dbo.contas WHERE id = ? AND usuario_id = ?", id, usuarioId);
    }

    private Conta mapearConta(ResultSet rs, int linha) throws SQLException {
        return new Conta(rs.getLong("id"), rs.getLong("usuario_id"),
                TipoConta.de(rs.getString("tipo")), rs.getString("nome"),
                rs.getString("documento"), Dinheiro.de(rs.getBigDecimal("saldo_inicial")),
                rs.getTimestamp("criado_em").toLocalDateTime());
    }

    // ------------------------------------------------------------ categorias

    @Override
    public List<Categoria> listarCategorias(long usuarioId) {
        return jdbc.query("""
                SELECT id, usuario_id, conta_id, nome, tipo
                FROM dbo.categorias WHERE usuario_id = ? ORDER BY conta_id, nome
                """, this::mapearCategoria, usuarioId);
    }

    @Override
    public Optional<Categoria> buscarCategoria(long usuarioId, long id) {
        return jdbc.query("""
                SELECT id, usuario_id, conta_id, nome, tipo
                FROM dbo.categorias WHERE usuario_id = ? AND id = ?
                """, this::mapearCategoria, usuarioId, id).stream().findFirst();
    }

    @Override
    public Categoria salvar(Categoria categoria) {
        if (categoria.getId() == null) {
            long id = inserir("""
                    INSERT INTO dbo.categorias (usuario_id, conta_id, nome, tipo)
                    VALUES (?, ?, ?, ?)
                    """, categoria.getUsuarioId(), categoria.getContaId(), categoria.getNome(),
                    categoria.getTipo().valor());
            return new Categoria(id, categoria.getUsuarioId(), categoria.getContaId(),
                    categoria.getNome(), categoria.getTipo());
        }
        jdbc.update("""
                UPDATE dbo.categorias SET conta_id = ?, nome = ?, tipo = ?
                WHERE id = ? AND usuario_id = ?
                """, categoria.getContaId(), categoria.getNome(), categoria.getTipo().valor(),
                categoria.getId(), categoria.getUsuarioId());
        return categoria;
    }

    @Override
    public void excluirCategoria(long usuarioId, long id) {
        jdbc.update("DELETE FROM dbo.categorias WHERE id = ? AND usuario_id = ?", id, usuarioId);
    }

    private Categoria mapearCategoria(ResultSet rs, int linha) throws SQLException {
        return new Categoria(rs.getLong("id"), rs.getLong("usuario_id"), rs.getLong("conta_id"),
                rs.getString("nome"), TipoCategoria.de(rs.getString("tipo")));
    }

    // ------------------------------------------------------------ transações

    @Override
    public List<Transacao> listarTransacoes(long usuarioId) {
        return jdbc.query("""
                SELECT id, usuario_id, conta_id, categoria_id, tipo, valor, descricao, data, criado_em
                FROM dbo.transacoes WHERE usuario_id = ? ORDER BY data DESC, id DESC
                """, this::mapearTransacao, usuarioId);
    }

    @Override
    public Optional<Transacao> buscarTransacao(long usuarioId, long id) {
        return jdbc.query("""
                SELECT id, usuario_id, conta_id, categoria_id, tipo, valor, descricao, data, criado_em
                FROM dbo.transacoes WHERE usuario_id = ? AND id = ?
                """, this::mapearTransacao, usuarioId, id).stream().findFirst();
    }

    @Override
    public Transacao salvar(Transacao transacao) {
        if (transacao.getId() == null) {
            long id = inserir("""
                    INSERT INTO dbo.transacoes
                        (usuario_id, conta_id, categoria_id, tipo, valor, descricao, data)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, transacao.getUsuarioId(), transacao.getContaId(), transacao.getCategoriaId(),
                    transacao.getTipo().valor(), transacao.getValor().valor(),
                    transacao.getDescricao(), transacao.getData());
            return new Transacao(id, transacao.getUsuarioId(), transacao.getContaId(),
                    transacao.getCategoriaId(), transacao.getTipo(), transacao.getValor(),
                    transacao.getDescricao(), transacao.getData(), transacao.getCriadoEm());
        }
        jdbc.update("""
                UPDATE dbo.transacoes SET conta_id = ?, categoria_id = ?, tipo = ?, valor = ?,
                    descricao = ?, data = ? WHERE id = ? AND usuario_id = ?
                """, transacao.getContaId(), transacao.getCategoriaId(), transacao.getTipo().valor(),
                transacao.getValor().valor(), transacao.getDescricao(), transacao.getData(),
                transacao.getId(), transacao.getUsuarioId());
        return transacao;
    }

    @Override
    public void excluirTransacao(long usuarioId, long id) {
        jdbc.update("DELETE FROM dbo.transacoes WHERE id = ? AND usuario_id = ?", id, usuarioId);
    }

    private Transacao mapearTransacao(ResultSet rs, int linha) throws SQLException {
        long categoria = rs.getLong("categoria_id");
        Long categoriaId = rs.wasNull() ? null : categoria;
        return new Transacao(rs.getLong("id"), rs.getLong("usuario_id"), rs.getLong("conta_id"),
                categoriaId, TipoTransacao.de(rs.getString("tipo")),
                Dinheiro.de(rs.getBigDecimal("valor")), rs.getString("descricao"),
                rs.getDate("data").toLocalDate(), rs.getTimestamp("criado_em").toLocalDateTime());
    }

    // --------------------------------------------------------- transferências

    @Override
    public List<Transferencia> listarTransferencias(long usuarioId) {
        return jdbc.query("""
                SELECT id, usuario_id, origem_conta_id, destino_conta_id, valor, descricao, data, criado_em
                FROM dbo.transferencias WHERE usuario_id = ? ORDER BY data DESC, id DESC
                """, this::mapearTransferencia, usuarioId);
    }

    @Override
    public Optional<Transferencia> buscarTransferencia(long usuarioId, long id) {
        return jdbc.query("""
                SELECT id, usuario_id, origem_conta_id, destino_conta_id, valor, descricao, data, criado_em
                FROM dbo.transferencias WHERE usuario_id = ? AND id = ?
                """, this::mapearTransferencia, usuarioId, id).stream().findFirst();
    }

    @Override
    public Transferencia salvar(Transferencia transferencia) {
        if (transferencia.getId() == null) {
            long id = inserir("""
                    INSERT INTO dbo.transferencias
                        (usuario_id, origem_conta_id, destino_conta_id, valor, descricao, data)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, transferencia.getUsuarioId(), transferencia.getOrigemContaId(),
                    transferencia.getDestinoContaId(), transferencia.getValor().valor(),
                    transferencia.getDescricao(), transferencia.getData());
            return new Transferencia(id, transferencia.getUsuarioId(),
                    transferencia.getOrigemContaId(), transferencia.getDestinoContaId(),
                    transferencia.getValor(), transferencia.getDescricao(), transferencia.getData(),
                    transferencia.getCriadoEm());
        }
        jdbc.update("""
                UPDATE dbo.transferencias SET origem_conta_id = ?, destino_conta_id = ?, valor = ?,
                    descricao = ?, data = ? WHERE id = ? AND usuario_id = ?
                """, transferencia.getOrigemContaId(), transferencia.getDestinoContaId(),
                transferencia.getValor().valor(), transferencia.getDescricao(), transferencia.getData(),
                transferencia.getId(), transferencia.getUsuarioId());
        return transferencia;
    }

    @Override
    public void excluirTransferencia(long usuarioId, long id) {
        jdbc.update("DELETE FROM dbo.transferencias WHERE id = ? AND usuario_id = ?", id, usuarioId);
    }

    private Transferencia mapearTransferencia(ResultSet rs, int linha) throws SQLException {
        return new Transferencia(rs.getLong("id"), rs.getLong("usuario_id"),
                rs.getLong("origem_conta_id"), rs.getLong("destino_conta_id"),
                Dinheiro.de(rs.getBigDecimal("valor")), rs.getString("descricao"),
                rs.getDate("data").toLocalDate(), rs.getTimestamp("criado_em").toLocalDateTime());
    }

    // ------------------------------------------------------------ orçamentos

    @Override
    public List<Orcamento> listarOrcamentos(long usuarioId) {
        return jdbc.query("""
                SELECT id, usuario_id, categoria_id, mes, limite, criado_em
                FROM dbo.orcamentos WHERE usuario_id = ? ORDER BY mes DESC, id
                """, this::mapearOrcamento, usuarioId);
    }

    @Override
    public Optional<Orcamento> buscarOrcamento(long usuarioId, long id) {
        return jdbc.query("""
                SELECT id, usuario_id, categoria_id, mes, limite, criado_em
                FROM dbo.orcamentos WHERE usuario_id = ? AND id = ?
                """, this::mapearOrcamento, usuarioId, id).stream().findFirst();
    }

    @Override
    public Orcamento salvar(Orcamento orcamento) {
        if (orcamento.getId() == null) {
            long id = inserir("""
                    INSERT INTO dbo.orcamentos (usuario_id, categoria_id, mes, limite)
                    VALUES (?, ?, ?, ?)
                    """, orcamento.getUsuarioId(), orcamento.getCategoriaId(),
                    orcamento.getMes().comoData(), orcamento.getLimite().valor());
            return new Orcamento(id, orcamento.getUsuarioId(), orcamento.getCategoriaId(),
                    orcamento.getMes(), orcamento.getLimite(), orcamento.getCriadoEm());
        }
        jdbc.update("""
                UPDATE dbo.orcamentos SET categoria_id = ?, mes = ?, limite = ?
                WHERE id = ? AND usuario_id = ?
                """, orcamento.getCategoriaId(), orcamento.getMes().comoData(),
                orcamento.getLimite().valor(), orcamento.getId(), orcamento.getUsuarioId());
        return orcamento;
    }

    @Override
    public void excluirOrcamento(long usuarioId, long id) {
        jdbc.update("DELETE FROM dbo.orcamentos WHERE id = ? AND usuario_id = ?", id, usuarioId);
    }

    private Orcamento mapearOrcamento(ResultSet rs, int linha) throws SQLException {
        return new Orcamento(rs.getLong("id"), rs.getLong("usuario_id"), rs.getLong("categoria_id"),
                Competencia.de(rs.getDate("mes").toLocalDate()), Dinheiro.de(rs.getBigDecimal("limite")),
                rs.getTimestamp("criado_em").toLocalDateTime());
    }

    // --------------------------------------------------------------- impostos

    @Override
    public List<Imposto> listarImpostos(long usuarioId) {
        return jdbc.query("""
                SELECT id, usuario_id, conta_id, tipo, competencia, valor_estimado, vencimento,
                       pago_em, criado_em
                FROM dbo.impostos WHERE usuario_id = ? ORDER BY competencia DESC, id
                """, this::mapearImposto, usuarioId);
    }

    @Override
    public Optional<Imposto> buscarImposto(long usuarioId, long id) {
        return jdbc.query("""
                SELECT id, usuario_id, conta_id, tipo, competencia, valor_estimado, vencimento,
                       pago_em, criado_em
                FROM dbo.impostos WHERE usuario_id = ? AND id = ?
                """, this::mapearImposto, usuarioId, id).stream().findFirst();
    }

    @Override
    public Imposto salvar(Imposto imposto) {
        if (imposto.getId() == null) {
            long id = inserir("""
                    INSERT INTO dbo.impostos
                        (usuario_id, conta_id, tipo, competencia, valor_estimado, vencimento, pago_em)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, imposto.getUsuarioId(), imposto.getContaId(), imposto.getTipo().valor(),
                    imposto.getCompetencia().comoData(), imposto.getValorEstimado().valor(),
                    imposto.getVencimento(), imposto.getPagoEm());
            return new Imposto(id, imposto.getUsuarioId(), imposto.getContaId(), imposto.getTipo(),
                    imposto.getCompetencia(), imposto.getValorEstimado(), imposto.getVencimento(),
                    imposto.getPagoEm(), imposto.getCriadoEm());
        }
        jdbc.update("""
                UPDATE dbo.impostos SET conta_id = ?, tipo = ?, competencia = ?, valor_estimado = ?,
                    vencimento = ?, pago_em = ? WHERE id = ? AND usuario_id = ?
                """, imposto.getContaId(), imposto.getTipo().valor(),
                imposto.getCompetencia().comoData(), imposto.getValorEstimado().valor(),
                imposto.getVencimento(), imposto.getPagoEm(), imposto.getId(), imposto.getUsuarioId());
        return imposto;
    }

    @Override
    public void excluirImposto(long usuarioId, long id) {
        jdbc.update("DELETE FROM dbo.impostos WHERE id = ? AND usuario_id = ?", id, usuarioId);
    }

    private Imposto mapearImposto(ResultSet rs, int linha) throws SQLException {
        java.sql.Date vencimento = rs.getDate("vencimento");
        java.sql.Date pagoEm = rs.getDate("pago_em");
        return new Imposto(rs.getLong("id"), rs.getLong("usuario_id"), rs.getLong("conta_id"),
                TipoImposto.de(rs.getString("tipo")),
                Competencia.de(rs.getDate("competencia").toLocalDate()),
                Dinheiro.de(rs.getBigDecimal("valor_estimado")),
                vencimento == null ? null : vencimento.toLocalDate(),
                pagoEm == null ? null : pagoEm.toLocalDate(),
                rs.getTimestamp("criado_em").toLocalDateTime());
    }

    // ----------------------------------------------------------------- comum

    private long inserir(String sql, Object... parametros) {
        KeyHolder chave = new GeneratedKeyHolder();
        jdbc.update(connection -> {
            PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            for (int i = 0; i < parametros.length; i++) {
                statement.setObject(i + 1, parametros[i]);
            }
            return statement;
        }, chave);

        Number id = chave.getKey();
        if (id == null) {
            throw new DomainException("Inserção não retornou id gerado.");
        }
        return id.longValue();
    }
}
