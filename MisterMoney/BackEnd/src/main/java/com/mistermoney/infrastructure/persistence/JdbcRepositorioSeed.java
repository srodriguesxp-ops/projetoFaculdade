package com.mistermoney.infrastructure.persistence;

import com.mistermoney.application.ports.RepositorioSeed;
import com.mistermoney.domain.model.Categoria;
import com.mistermoney.domain.model.Conta;
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
import java.util.HashMap;
import java.util.Map;

/** Adaptador que persiste o agregado de seed preservando os ids gerados pelo banco. */
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

        Map<Long, Long> contas = new HashMap<>();
        for (Conta conta : cenario.contas()) {
            long id = inserir("""
                    INSERT INTO dbo.contas (usuario_id, tipo, nome, documento, saldo_inicial)
                    VALUES (?, ?, ?, ?, ?)
                    """, usuarioId, conta.getTipo().valor(), conta.getNome(), conta.getDocumento(),
                    conta.getSaldoInicial().valor());
            contas.put(conta.getId(), id);
        }

        Map<Long, Long> categorias = new HashMap<>();
        for (Categoria categoria : cenario.categorias()) {
            long id = inserir("""
                    INSERT INTO dbo.categorias (usuario_id, conta_id, nome, tipo)
                    VALUES (?, ?, ?, ?)
                    """, usuarioId, contas.get(categoria.getContaId()), categoria.getNome(),
                    categoria.getTipo().valor());
            categorias.put(categoria.getId(), id);
        }

        for (Transacao transacao : cenario.transacoes()) {
            Long categoriaId = transacao.getCategoriaId() == null
                    ? null
                    : categorias.get(transacao.getCategoriaId());
            inserir("""
                    INSERT INTO dbo.transacoes
                        (usuario_id, conta_id, categoria_id, tipo, valor, descricao, data)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, usuarioId, contas.get(transacao.getContaId()), categoriaId,
                    transacao.getTipo().valor(), transacao.getValor().valor(),
                    transacao.getDescricao(), transacao.getData());
        }

        for (Transferencia transferencia : cenario.transferencias()) {
            inserir("""
                    INSERT INTO dbo.transferencias
                        (usuario_id, origem_conta_id, destino_conta_id, valor, descricao, data)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, usuarioId, contas.get(transferencia.getOrigemContaId()),
                    contas.get(transferencia.getDestinoContaId()), transferencia.getValor().valor(),
                    transferencia.getDescricao(), transferencia.getData());
        }

        for (Orcamento orcamento : cenario.orcamentos()) {
            inserir("""
                    INSERT INTO dbo.orcamentos (usuario_id, categoria_id, mes, limite)
                    VALUES (?, ?, ?, ?)
                    """, usuarioId, categorias.get(orcamento.getCategoriaId()),
                    orcamento.getMes().comoData(), orcamento.getLimite().valor());
        }

        for (Imposto imposto : cenario.impostos()) {
            inserir("""
                    INSERT INTO dbo.impostos
                        (usuario_id, conta_id, tipo, competencia, valor_estimado, vencimento, pago_em)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, usuarioId, contas.get(imposto.getContaId()), imposto.getTipo().valor(),
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
