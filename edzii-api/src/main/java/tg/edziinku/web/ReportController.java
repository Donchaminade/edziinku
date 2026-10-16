package tg.edziinku.web;

import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import tg.edziinku.domain.WaterLevel;
import tg.edziinku.dto.Dtos;
import tg.edziinku.security.AuthUser;
import tg.edziinku.service.MediaStorage;
import tg.edziinku.service.ReportService;

import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reports;
    private final MediaStorage media;

    public ReportController(ReportService reports, MediaStorage media) {
        this.reports = reports;
        this.media = media;
    }

    @GetMapping("/hotspots")
    Dtos.HotspotResponse hotspots(
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(defaultValue = "3") int limit
    ) {
        return reports.publicHotspots(days, limit);
    }

    @GetMapping
    Dtos.PageResponse<Dtos.ReportCard> list(
            @RequestParam(required = false) UUID neighborhoodId,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng,
            @RequestParam(required = false) Double radiusMeters,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return reports.publicSearch(neighborhoodId, parseLevel(level), lat, lng, radiusMeters, clamp(page), clampSize(size));
    }

    @GetMapping("/{id}")
    Dtos.ReportCard one(@PathVariable UUID id) {
        return reports.getPublic(id);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    Dtos.ReportCard create(@Valid @RequestBody Dtos.ReportRequest request, @AuthenticationPrincipal AuthUser user) {
        return reports.create(request, user == null ? null : user.id(), null);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    Dtos.ReportCard createWithPhoto(
            @RequestPart("payload") @Valid Dtos.ReportRequest request,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @AuthenticationPrincipal AuthUser user
    ) {
        return reports.create(request, user == null ? null : user.id(), media.store(photo));
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

    private int clamp(int page) {
        return Math.max(0, page);
    }

    private int clampSize(int size) {
        return Math.min(100, Math.max(1, size));
    }
}
