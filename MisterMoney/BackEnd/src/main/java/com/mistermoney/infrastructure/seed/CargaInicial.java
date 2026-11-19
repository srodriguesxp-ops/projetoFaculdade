package com.mistermoney.infrastructure.seed;

import com.mistermoney.application.ports.RepositorioSeed;
import com.mistermoney.domain.seed.CenarioInicialFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/** Executa a carga inicial apenas quando o banco está vazio. */
@Component
public class CargaInicial implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(CargaInicial.class);

    private final RepositorioSeed repositorio;
    private final boolean habilitado;

    public CargaInicial(RepositorioSeed repositorio,
                        @Value("${mistermoney.seed.enabled:true}") boolean habilitado) {
        this.repositorio = repositorio;
        this.habilitado = habilitado;
    }

    @Override
    public void run(String... args) {
        if (!habilitado || !repositorio.bancoVazio()) {
            return;
        }

        String senhaHash = new BCryptPasswordEncoder().encode("123456");
        repositorio.salvar(new CenarioInicialFactory().criar(senhaHash));
        LOGGER.info("Seed de desenvolvimento aplicado. Usuário: samuel@mistermoney.local / senha: 123456");
    }
}
