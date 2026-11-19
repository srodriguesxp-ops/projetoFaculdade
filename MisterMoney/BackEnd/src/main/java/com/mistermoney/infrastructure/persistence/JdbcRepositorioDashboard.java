package com.mistermoney.infrastructure.persistence;

import com.mistermoney.application.ports.RepositorioDashboard;
import com.mistermoney.domain.readmodel.ProgressoOrcamento;
import com.mistermoney.domain.readmodel.ReceitaAnual;
import com.mistermoney.domain.readmodel.ResumoMensal;
import com.mistermoney.domain.readmodel.SaldoConta;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

/** Adaptador de persistência: converte as views do SQL Server em modelos de leitura. */
@Repository
public class JdbcRepositorioDashboard implements RepositorioDashboard {

    private final JdbcTemplate jdbc;

    public JdbcRepositorioDashboard(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<SaldoConta> saldosDoUsuario(long usuarioId) {
        return jdbc.query("""
                SELECT conta_id, tipo, nome, saldo
                FROM dbo.v_saldo_contas
                WHERE usuario_id = ?
                ORDER BY nome
                """,
                (rs, linha) -> new SaldoConta(
                        rs.getLong("conta_id"),
                        rs.getString("tipo"),
                        rs.getString("nome"),
                        rs.getBigDecimal("saldo")),
                usuarioId);
    }

    @Override
    public List<ResumoMensal> resumoMensalDoUsuario(long usuarioId) {
        return jdbc.query("""
                SELECT conta_id, mes, receita, custos, impostos, lucro_liquido
                FROM dbo.v_resumo_mensal
                WHERE usuario_id = ?
                ORDER BY mes DESC, conta_id
                """,
                (rs, linha) -> new ResumoMensal(
                        rs.getLong("conta_id"),
                        rs.getDate("mes").toLocalDate(),
                        rs.getBigDecimal("receita"),
                        rs.getBigDecimal("custos"),
                        rs.getBigDecimal("impostos"),
                        rs.getBigDecimal("lucro_liquido")),
                usuarioId);
    }

    @Override
    public List<ReceitaAnual> receitaAnualDoUsuario(long usuarioId) {
        return jdbc.query("""
                SELECT conta_id, ano, receita_ano
                FROM dbo.v_receita_anual
                WHERE usuario_id = ?
                ORDER BY ano DESC, conta_id
                """,
                (rs, linha) -> new ReceitaAnual(
                        rs.getLong("conta_id"),
                        rs.getInt("ano"),
                        rs.getBigDecimal("receita_ano")),
                usuarioId);
    }

    @Override
    public List<ProgressoOrcamento> progressoDosOrcamentosDoUsuario(long usuarioId) {
        return jdbc.query("""
                SELECT orcamento_id, categoria, mes, limite, gasto, percentual, estourou
                FROM dbo.v_orcamento_progresso
                WHERE usuario_id = ?
                ORDER BY mes DESC, categoria
                """,
                (rs, linha) -> new ProgressoOrcamento(
                        rs.getLong("orcamento_id"),
                        rs.getString("categoria"),
                        rs.getDate("mes").toLocalDate(),
                        rs.getBigDecimal("limite"),
                        rs.getBigDecimal("gasto"),
                        rs.getBigDecimal("percentual"),
                        rs.getBoolean("estourou")),
                usuarioId);
    }
}
