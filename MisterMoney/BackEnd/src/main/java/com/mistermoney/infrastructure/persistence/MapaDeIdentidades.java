package com.mistermoney.infrastructure.persistence;

import com.mistermoney.domain.model.Categoria;
import com.mistermoney.domain.model.Conta;
import com.mistermoney.domain.seed.CenarioInicial;
import com.mistermoney.domain.valueobject.TipoConta;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Traduz os ids simbólicos do cenário de seed para os ids reais gerados pela trigger
 * trg_usuarios_dados_iniciais (que já cria contas e categorias no INSERT de usuário).
 */
final class MapaDeIdentidades {

    private final Map<Long, Long> contas = new HashMap<>();
    private final Map<Long, Long> categorias = new HashMap<>();

    private record ContaRow(long id, TipoConta tipo, String nome) {
    }

    private record CategoriaRow(long id, long contaId, String nome) {
    }

    static MapaDeIdentidades carregar(JdbcTemplate jdbc, long usuarioId, CenarioInicial cenario) {
        MapaDeIdentidades mapa = new MapaDeIdentidades();

        List<ContaRow> contasBanco = jdbc.query("""
                SELECT id, tipo, nome FROM dbo.contas WHERE usuario_id = ?
                """,
                (rs, linha) -> new ContaRow(
                        rs.getLong("id"),
                        TipoConta.de(rs.getString("tipo")),
                        rs.getString("nome")),
                usuarioId);

        for (Conta esperada : cenario.contas()) {
            contasBanco.stream()
                    .filter(conta -> conta.tipo() == esperada.getTipo()
                            && conta.nome().equalsIgnoreCase(esperada.getNome()))
                    .findFirst()
                    .ifPresent(conta -> mapa.contas.put(esperada.getId(), conta.id()));
        }

        List<CategoriaRow> categoriasBanco = jdbc.query("""
                SELECT id, conta_id, nome FROM dbo.categorias WHERE usuario_id = ?
                """,
                (rs, linha) -> new CategoriaRow(
                        rs.getLong("id"),
                        rs.getLong("conta_id"),
                        rs.getString("nome")),
                usuarioId);

        for (Categoria esperada : cenario.categorias()) {
            Long contaReal = mapa.contas.get(esperada.getContaId());
            categoriasBanco.stream()
                    .filter(categoria -> Objects.equals(categoria.contaId(), contaReal)
                            && categoria.nome().equalsIgnoreCase(esperada.getNome()))
                    .findFirst()
                    .ifPresent(categoria -> mapa.categorias.put(esperada.getId(), categoria.id()));
        }

        mapa.validar(cenario);
        return mapa;
    }

    private void validar(CenarioInicial cenario) {
        for (Conta conta : cenario.contas()) {
            if (!contas.containsKey(conta.getId())) {
                throw new IllegalStateException("Trigger não criou a conta: " + conta.getNome());
            }
        }
        for (Categoria categoria : cenario.categorias()) {
            if (!categorias.containsKey(categoria.getId())) {
                throw new IllegalStateException("Trigger não criou a categoria: " + categoria.getNome());
            }
        }
    }

    long conta(long idSimbolico) {
        Long id = contas.get(idSimbolico);
        if (id == null) {
            throw new IllegalStateException("Conta do cenário não mapeada: " + idSimbolico);
        }
        return id;
    }

    Long categoria(Long idSimbolico) {
        if (idSimbolico == null) {
            return null;
        }
        Long id = categorias.get(idSimbolico);
        if (id == null) {
            throw new IllegalStateException("Categoria do cenário não mapeada: " + idSimbolico);
        }
        return id;
    }
}
