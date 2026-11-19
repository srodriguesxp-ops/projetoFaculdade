package com.mistermoney.domain.seed;

import com.mistermoney.domain.model.Categoria;
import com.mistermoney.domain.model.Conta;
import com.mistermoney.domain.model.Imposto;
import com.mistermoney.domain.model.Orcamento;
import com.mistermoney.domain.model.Transacao;
import com.mistermoney.domain.model.Transferencia;
import com.mistermoney.domain.model.Usuario;
import com.mistermoney.domain.valueobject.Competencia;
import com.mistermoney.domain.valueobject.Dinheiro;
import com.mistermoney.domain.valueobject.TipoCategoria;
import com.mistermoney.domain.valueobject.TipoConta;
import com.mistermoney.domain.valueobject.TipoImposto;
import com.mistermoney.domain.valueobject.TipoTransacao;

import java.time.LocalDate;
import java.util.List;

/** Fábrica do cenário de desenvolvimento. Não conhece JDBC nem Spring. */
public final class CenarioInicialFactory {

    private static final long ID_USUARIO = 1L;
    private static final long ID_CONTA_PESSOAL = 1L;
    private static final long ID_CONTA_EMPRESA = 2L;
    private static final long ID_CATEGORIA_SALARIO = 1L;
    private static final long ID_CATEGORIA_ALIMENTACAO = 2L;
    private static final long ID_CATEGORIA_CONSULTORIA = 3L;
    private static final long ID_CATEGORIA_EQUIPAMENTOS = 4L;

    public CenarioInicial criar(String senhaHash) {
        LocalDate hoje = LocalDate.now();
        Competencia competenciaAtual = Competencia.atual();

        Usuario usuario = new Usuario(
                ID_USUARIO, "Samuel Rodrigues", "samuel@mistermoney.local", senhaHash, null);

        Conta pessoal = new Conta(
                ID_CONTA_PESSOAL, ID_USUARIO, TipoConta.CPF, "Pessoal",
                "123.456.789-00", Dinheiro.de("1000.00"), null);
        Conta empresa = new Conta(
                ID_CONTA_EMPRESA, ID_USUARIO, TipoConta.CNPJ, "Empresa",
                "12.345.678/0001-90", Dinheiro.de("5000.00"), null);

        List<Categoria> categorias = List.of(
                new Categoria(ID_CATEGORIA_SALARIO, ID_USUARIO, ID_CONTA_PESSOAL, "Salário", TipoCategoria.RECEITA),
                new Categoria(ID_CATEGORIA_ALIMENTACAO, ID_USUARIO, ID_CONTA_PESSOAL, "Alimentação", TipoCategoria.DESPESA),
                new Categoria(ID_CATEGORIA_CONSULTORIA, ID_USUARIO, ID_CONTA_EMPRESA, "Consultoria", TipoCategoria.RECEITA),
                new Categoria(ID_CATEGORIA_EQUIPAMENTOS, ID_USUARIO, ID_CONTA_EMPRESA, "Equipamentos", TipoCategoria.DESPESA)
        );

        List<Transacao> transacoes = List.of(
                new Transacao(null, ID_USUARIO, ID_CONTA_PESSOAL, ID_CATEGORIA_SALARIO,
                        TipoTransacao.RECEITA, Dinheiro.de("3500.00"), "Salário do mês", hoje.minusDays(10), null),
                new Transacao(null, ID_USUARIO, ID_CONTA_PESSOAL, ID_CATEGORIA_ALIMENTACAO,
                        TipoTransacao.DESPESA, Dinheiro.de("450.00"), "Supermercado", hoje.minusDays(5), null),
                new Transacao(null, ID_USUARIO, ID_CONTA_EMPRESA, ID_CATEGORIA_CONSULTORIA,
                        TipoTransacao.RECEITA, Dinheiro.de("8200.00"), "Projeto cliente", hoje.minusDays(8), null),
                new Transacao(null, ID_USUARIO, ID_CONTA_EMPRESA, ID_CATEGORIA_EQUIPAMENTOS,
                        TipoTransacao.DESPESA, Dinheiro.de("1200.00"), "Notebook", hoje.minusDays(4), null),
                new Transacao(null, ID_USUARIO, ID_CONTA_EMPRESA, null,
                        TipoTransacao.IMPOSTO, Dinheiro.de("300.00"), "DAS estimado", hoje.minusDays(3), null)
        );

        List<Transferencia> transferencias = List.of(
                new Transferencia(null, ID_USUARIO, ID_CONTA_PESSOAL, ID_CONTA_EMPRESA,
                        Dinheiro.de("800.00"), "Aporte inicial", hoje.minusDays(6), null)
        );

        List<Orcamento> orcamentos = List.of(
                new Orcamento(null, ID_USUARIO, ID_CATEGORIA_ALIMENTACAO, competenciaAtual,
                        Dinheiro.de("600.00"), null),
                new Orcamento(null, ID_USUARIO, ID_CATEGORIA_EQUIPAMENTOS, competenciaAtual,
                        Dinheiro.de("2000.00"), null)
        );

        List<Imposto> impostos = List.of(
                new Imposto(null, ID_USUARIO, ID_CONTA_EMPRESA, TipoImposto.DAS, competenciaAtual,
                        Dinheiro.de("300.00"), competenciaAtual.comoData().withDayOfMonth(20), null, null)
        );

        return new CenarioInicial(usuario, List.of(pessoal, empresa), categorias, transacoes,
                transferencias, orcamentos, impostos);
    }
}
