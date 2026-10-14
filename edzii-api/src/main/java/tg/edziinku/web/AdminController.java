package tg.edziinku.web;

import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tg.edziinku.domain.ReportStatus;
import tg.edziinku.domain.WaterLevel;
import tg.edziinku.dto.Dtos;
import tg.edziinku.service.CatalogService;
import tg.edziinku.service.ReportService;
import tg.edziinku.service.WhatsAppBotService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final CatalogService catalog;
    private final ReportService reports;
    private final WhatsAppBotService whatsapp;

    public AdminController(CatalogService catalog, ReportService reports, WhatsAppBotService whatsapp) {
        this.catalog = catalog;
        this.reports = reports;
        this.whatsapp = whatsapp;
    }

    @GetMapping("/dashboard")
    Dtos.DashboardResponse dashboard() {
        return catalog.dashboard();
    }

    @GetMapping("/timeline")
    List<Dtos.TimelineCard> timeline() {
        return catalog.timeline();
    }

    @GetMapping("/teams")
    List<Dtos.TeamCard> teams() {
        return catalog.teams();
    }

    @GetMapping("/reports")
    Dtos.PageResponse<Dtos.ReportCard> reports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) UUID neighborhoodId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return reports.adminSearch(parseStatus(status), parseLevel(level), neighborhoodId, q, Math.max(page, 0), Math.min(Math.max(size, 1), 200));
    }

    @GetMapping(value = "/reports/export", produces = "text/csv")
    ResponseEntity<String> export(@RequestParam(required = false) String status) {
        String csv = reports.exportCsv(parseStatus(status));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=signalements-edzii-nku.csv")
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .body(csv);
    }

    @PatchMapping("/reports/{id}")
    Dtos.ReportCard moderate(@PathVariable UUID id, @Valid @RequestBody Dtos.StatusRequest request) {
        return reports.moderate(id, request.status());
    }

    @PostMapping("/alerts")
    Dtos.AlertCard createAlert(@Valid @RequestBody Dtos.AlertCreateRequest request) {
        UUID id = catalog.createAlert(request).getId();
        whatsapp.broadcast(id);
        return catalog.alert(id);
    }

    @PostMapping("/alerts/{id}/broadcast")
    void broadcast(@PathVariable UUID id) {
        whatsapp.broadcast(id);
    }

    @GetMapping("/whatsapp/outbox")
    List<Dtos.OutboundCard> outbox() {
        return whatsapp.outbox();
    }

    private ReportStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return ReportStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException(400, "Statut inconnu");
        }
    }

    private WaterLevel parseLevel(String level) {
        if (level == null || level.isBlank()) {
            return null;
        }
        try {
            return WaterLevel.valueOf(level.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException(400, "Niveau inconnu");
        }
    }
}
