package com.mistermoney.application.service;

import com.mistermoney.application.ports.RepositorioDashboard;
import com.mistermoney.domain.readmodel.Dashboard;
import org.springframework.stereotype.Service;

/** Serviço de aplicação: orquestra as consultas sem conhecer JDBC nem HTTP. */
@Service
public class DashboardService {

    private final RepositorioDashboard repositorio;

    public DashboardService(RepositorioDashboard repositorio) {
        this.repositorio = repositorio;
    }

    public Dashboard obterDashboard(long usuarioId) {
        return new Dashboard(
                repositorio.saldosDoUsuario(usuarioId),
                repositorio.resumoMensalDoUsuario(usuarioId),
                repositorio.receitaAnualDoUsuario(usuarioId),
                repositorio.progressoDosOrcamentosDoUsuario(usuarioId)
        );
    }
}
