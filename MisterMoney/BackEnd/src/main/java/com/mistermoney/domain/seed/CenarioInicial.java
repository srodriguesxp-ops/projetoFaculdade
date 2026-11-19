package com.mistermoney.domain.seed;

import com.mistermoney.domain.model.Categoria;
import com.mistermoney.domain.model.Conta;
import com.mistermoney.domain.model.Imposto;
import com.mistermoney.domain.model.Orcamento;
import com.mistermoney.domain.model.Transacao;
import com.mistermoney.domain.model.Transferencia;
import com.mistermoney.domain.model.Usuario;

import java.util.List;

/** Agregado de criação: conjunto completo de entidades para o cenário de desenvolvimento. */
public record CenarioInicial(Usuario usuario,
                             List<Conta> contas,
                             List<Categoria> categorias,
                             List<Transacao> transacoes,
                             List<Transferencia> transferencias,
                             List<Orcamento> orcamentos,
                             List<Imposto> impostos) {

    public CenarioInicial {
        contas = List.copyOf(contas);
        categorias = List.copyOf(categorias);
        transacoes = List.copyOf(transacoes);
        transferencias = List.copyOf(transferencias);
        orcamentos = List.copyOf(orcamentos);
        impostos = List.copyOf(impostos);
    }
}
