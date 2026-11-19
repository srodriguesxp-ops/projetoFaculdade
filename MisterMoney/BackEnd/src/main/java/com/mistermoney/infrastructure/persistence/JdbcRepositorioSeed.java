package com.mistermoney.infrastructure.persistence;

import com.mistermoney.application.ports.RepositorioSeed;
import com.mistermoney.domain.model.Imposto;
import com.mistermoney.domain.model.Orcamento;
import com.mistermoney.domain.model.Transacao;
import com.mistermoney.domain.model.Transferencia;
import com.mistermoney.domain.model.Usuario;
import com.mistermoney.domain.seed.CenarioInicial;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;

/**
 * Adaptador que persiste o cenário de seed. A trigger do banco já cria contas e
 * categorias padrão no INSERT de usuário; aqui apenas reaproveitamos esses ids.
 */
@Repository
public class JdbcRepositorioSeed implements RepositorioSeed {

    private final JdbcTemplate jdbc;

    public JdbcRepositorioSeed(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public boolean bancoVazio() {
        Integer total = jdbc.queryForObject("SELECT COUNT(*) FROM dbo.usuarios", Integer.class);
        return total == null || total == 0;
    }

    @Override
    @Transactional
    public void salvar(CenarioInicial cenario) {
        Usuario usuario = cenario.usuario();
        long usuarioId = inserir("""
                INSERT INTO dbo.usuarios (nome, email, senha_hash)
                VALUES (?, ?, ?)
                """, usuario.getNome(), usuario.getEmail(), usuario.getSenhaHash());

        MapaDeIdentidades mapa = MapaDeIdentidades.carregar(jdbc, usuarioId, cenario);

        for (Transacao transacao : cenario.transacoes()) {
            inserir("""
                    INSERT INTO dbo.transacoes
                        (usuario_id, conta_id, categoria_id, tipo, valor, descricao, data)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, usuarioId, mapa.conta(transacao.getContaId()),
                    mapa.categoria(transacao.getCategoriaId()),
                    transacao.getTipo().valor(), transacao.getValor().valor(),
                    transacao.getDescricao(), transacao.getData());
        }

        for (Transferencia transferencia : cenario.transferencias()) {
            inserir("""
                    INSERT INTO dbo.transferencias
                        (usuario_id, origem_conta_id, destino_conta_id, valor, descricao, data)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, usuarioId, mapa.conta(transferencia.getOrigemContaId()),
                    mapa.conta(transferencia.getDestinoContaId()), transferencia.getValor().valor(),
                    transferencia.getDescricao(), transferencia.getData());
        }

        for (Orcamento orcamento : cenario.orcamentos()) {
            inserir("""
                    INSERT INTO dbo.orcamentos (usuario_id, categoria_id, mes, limite)
                    VALUES (?, ?, ?, ?)
                    """, usuarioId, mapa.categoria(orcamento.getCategoriaId()),
                    orcamento.getMes().comoData(), orcamento.getLimite().valor());
        }

        for (Imposto imposto : cenario.impostos()) {
            inserir("""
                    INSERT INTO dbo.impostos
                        (usuario_id, conta_id, tipo, competencia, valor_estimado, vencimento, pago_em)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, usuarioId, mapa.conta(imposto.getContaId()), imposto.getTipo().valor(),
                    imposto.getCompetencia().comoData(), imposto.getValorEstimado().valor(),
                    imposto.getVencimento(), imposto.getPagoEm());
        }
    }

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
            throw new IllegalStateException("Inserção não retornou id gerado: " + sql);
        }
        return id.longValue();
    }
}
