package tg.edziinku.web;

import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import tg.edziinku.domain.ReportStatus;
import tg.edziinku.domain.WaterLevel;
import tg.edziinku.dto.Dtos;
import tg.edziinku.service.CatalogService;
import tg.edziinku.service.ReportService;
import tg.edziinku.service.TerritoryService;
import tg.edziinku.service.WhatsAppBotService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final CatalogService catalog;
    private final ReportService reports;
    private final WhatsAppBotService whatsapp;
    private final TerritoryService territory;

    public AdminController(CatalogService catalog, ReportService reports, WhatsAppBotService whatsapp, TerritoryService territory) {
        this.catalog = catalog;
        this.reports = reports;
        this.whatsapp = whatsapp;
        this.territory = territory;
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

    @PostMapping("/alerts/{id}/end")
    Dtos.AlertCard endAlert(@PathVariable UUID id) {
        return catalog.endAlert(id);
    }

    @GetMapping("/whatsapp/outbox")
    List<Dtos.OutboundCard> outbox() {
        return whatsapp.outbox();
    }

    @GetMapping("/cities")
    List<Dtos.CityCard> cities() {
        return territory.adminCities();
    }

    @PostMapping("/cities")
    @ResponseStatus(HttpStatus.CREATED)
    Dtos.CityCard createCity(@Valid @RequestBody Dtos.CityRequest request) {
        return territory.createCity(request);
    }

    @PutMapping("/cities/{id}")
    Dtos.CityCard updateCity(@PathVariable UUID id, @Valid @RequestBody Dtos.CityRequest request) {
        return territory.updateCity(id, request);
    }

    @DeleteMapping("/cities/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteCity(@PathVariable UUID id) {
        territory.deleteCity(id);
    }

    @GetMapping("/neighborhoods")
    List<Dtos.NeighborhoodCard> adminNeighborhoods() {
        return territory.adminNeighborhoods();
    }

    @PostMapping("/neighborhoods")
    @ResponseStatus(HttpStatus.CREATED)
    Dtos.NeighborhoodCard createNeighborhood(@Valid @RequestBody Dtos.NeighborhoodRequest request) {
        return territory.createNeighborhood(request);
    }

    @PutMapping("/neighborhoods/{id}")
    Dtos.NeighborhoodCard updateNeighborhood(@PathVariable UUID id, @Valid @RequestBody Dtos.NeighborhoodRequest request) {
        return territory.updateNeighborhood(id, request);
    }

    @DeleteMapping("/neighborhoods/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteNeighborhood(@PathVariable UUID id) {
        territory.deleteNeighborhood(id);
    }

    @GetMapping("/urgency-levels")
    List<Dtos.UrgencyLevelCard> urgencyLevels() {
        return territory.adminUrgencies();
    }

    @PostMapping("/urgency-levels")
    @ResponseStatus(HttpStatus.CREATED)
    Dtos.UrgencyLevelCard createUrgency(@Valid @RequestBody Dtos.UrgencyLevelRequest request) {
        return territory.createUrgency(request);
    }

    @PutMapping("/urgency-levels/{id}")
    Dtos.UrgencyLevelCard updateUrgency(@PathVariable UUID id, @Valid @RequestBody Dtos.UrgencyLevelRequest request) {
        return territory.updateUrgency(id, request);
    }

    @DeleteMapping("/urgency-levels/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteUrgency(@PathVariable UUID id) {
        territory.deleteUrgency(id);
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
