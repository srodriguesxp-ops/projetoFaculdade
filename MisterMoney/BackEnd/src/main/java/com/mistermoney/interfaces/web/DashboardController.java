package com.mistermoney.interfaces.web;

import com.mistermoney.application.dto.DashboardResponse;
import com.mistermoney.application.mapper.DashboardMapper;
import com.mistermoney.application.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Adaptador de entrada: expõe o dashboard como REST para o Next.js. */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/{usuarioId}")
    public DashboardResponse obterDashboard(@PathVariable long usuarioId) {
        return DashboardMapper.paraResponse(dashboardService.obterDashboard(usuarioId));
    }
}
