package tg.edziinku.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tg.edziinku.domain.Neighborhood;
import tg.edziinku.domain.Report;
import tg.edziinku.domain.ReportChannel;
import tg.edziinku.domain.ReportStatus;
import tg.edziinku.domain.UserAccount;
import tg.edziinku.domain.WaterLevel;
import tg.edziinku.dto.Dtos;
import tg.edziinku.geo.GeoRepository;
import tg.edziinku.repo.NeighborhoodRepository;
import tg.edziinku.repo.ReportRepository;
import tg.edziinku.repo.UserRepository;
import tg.edziinku.web.ApiException;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
public class ReportService {

    private final ReportRepository reports;
    private final NeighborhoodRepository neighborhoods;
    private final UserRepository users;
    private final GeoRepository geo;
    private final ViewMapper mapper;
    private final JdbcTemplate jdbc;

    public ReportService(
            ReportRepository reports,
            NeighborhoodRepository neighborhoods,
            UserRepository users,
            GeoRepository geo,
            ViewMapper mapper,
            JdbcTemplate jdbc
    ) {
        this.reports = reports;
        this.neighborhoods = neighborhoods;
        this.users = users;
        this.geo = geo;
        this.mapper = mapper;
        this.jdbc = jdbc;
    }

    @Transactional
    public Dtos.ReportCard create(Dtos.ReportRequest request, UUID authorId, String photoFilename) {
        if (request.latitude() < -90 || request.latitude() > 90 || request.longitude() < -180 || request.longitude() > 180) {
            throw new ApiException(400, "Position invalide");
        }
        WaterLevel level;
        try {
            level = WaterLevel.valueOf(request.waterLevel().trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException(400, "Niveau attendu : CHEVILLE, GENOU ou TAILLE");
        }
        Neighborhood neighborhood = resolveNeighborhood(request.neighborhoodId(), request.latitude(), request.longitude());
        Report report = new Report();
        report.setReference(nextReference());
        if (authorId != null) {
            UserAccount author = users.findById(authorId).orElse(null);
            report.setAuthor(author);
        }
        report.setNeighborhood(neighborhood);
        report.setPlaceLabel(request.placeLabel().trim());
        report.setLatitude(request.latitude());
        report.setLongitude(request.longitude());
        report.setAccuracyM(request.accuracyM());
        report.setWaterLevel(level);
        report.setComment(request.comment() == null ? null : request.comment().trim());
        report.setStatus(ReportStatus.A_VERIFIER);
        report.setChannel(channel(request.channel()));
        report.setPhotoFilename(photoFilename);
        report.setConfirmations(0);
        if (request.tags() != null) {
            report.setTags(new HashSet<>(request.tags().stream().map(String::trim).filter(s -> !s.isBlank()).limit(8).toList()));
        }
        reports.save(report);
        return mapper.report(report);
    }

    @Transactional(readOnly = true)
    public Dtos.PageResponse<Dtos.ReportCard> publicSearch(UUID neighborhoodId, WaterLevel level, Double lat, Double lng, Double radius, int page, int size) {
        if (lat != null && lng != null) {
            double radiusMeters = radius == null ? 8000 : Math.min(Math.max(radius, 100), 50000);
            List<UUID> ids = geo.validatedReportsNear(lat, lng, radiusMeters);
            List<Dtos.ReportCard> items = reports.findByIdIn(ids).stream()
                    .filter(r -> r.getStatus() == ReportStatus.VALIDE)
                    .filter(r -> neighborhoodId == null || (r.getNeighborhood() != null && neighborhoodId.equals(r.getNeighborhood().getId())))
                    .filter(r -> level == null || r.getWaterLevel() == level)
                    .sorted(Comparator.comparing(Report::getCreatedAt).reversed())
                    .map(mapper::report)
                    .toList();
            return new Dtos.PageResponse<>(items, 0, items.size(), items.size());
        }
        var result = reports.search(ReportStatus.VALIDE, level, neighborhoodId, "", PageRequest.of(page, size));
        return new Dtos.PageResponse<>(result.map(mapper::report).getContent(), page, size, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Dtos.PageResponse<Dtos.ReportCard> adminSearch(ReportStatus status, WaterLevel level, UUID neighborhoodId, String q, int page, int size) {
        String query = q == null || q.isBlank() ? "" : q.trim();
        var result = reports.search(status, level, neighborhoodId, query, PageRequest.of(page, size));
        return new Dtos.PageResponse<>(result.map(mapper::report).getContent(), page, size, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Dtos.ReportCard getPublic(UUID id) {
        Report report = reports.findById(id).orElseThrow(() -> new ApiException(404, "Signalement introuvable"));
        if (report.getStatus() != ReportStatus.VALIDE) {
            throw new ApiException(404, "Signalement introuvable");
        }
        return mapper.report(report);
    }

    @Transactional
    public Dtos.ReportCard moderate(UUID id, String status) {
        Report report = reports.findById(id).orElseThrow(() -> new ApiException(404, "Signalement introuvable"));
        try {
            report.setStatus(ReportStatus.valueOf(status.trim().toUpperCase()));
        } catch (IllegalArgumentException ex) {
            throw new ApiException(400, "Statut attendu : A_VERIFIER, VALIDE, REJETE ou DOUBLON");
        }
        return mapper.report(report);
    }

    @Transactional(readOnly = true)
    public List<Dtos.ReportCard> mine(UUID authorId) {
        return reports.findByAuthor_IdOrderByCreatedAtDesc(authorId).stream().map(mapper::report).toList();
    }

    @Transactional(readOnly = true)
    public String exportCsv(ReportStatus status) {
        StringBuilder csv = new StringBuilder();
        csv.append('\uFEFF');
        csv.append("reference;lieu;quartier;niveau;statut;canal;heure\n");
        reports.search(status, null, null, "", PageRequest.of(0, 500)).forEach(report -> csv
                .append(report.getReference()).append(';')
                .append(safe(report.getPlaceLabel())).append(';')
                .append(report.getNeighborhood() == null ? "" : safe(report.getNeighborhood().getName())).append(';')
                .append(report.getWaterLevel().getLabel()).append(';')
                .append(report.getStatus().getLabel()).append(';')
                .append(report.getChannel().name()).append(';')
                .append(report.getCreatedAt()).append('\n'));
        return csv.toString();
    }

    private Neighborhood resolveNeighborhood(UUID id, double lat, double lng) {
        if (id != null) {
            return neighborhoods.findById(id).orElseThrow(() -> new ApiException(404, "Quartier introuvable"));
        }
        UUID found = geo.neighborhoodContaining(lat, lng)
                .orElseThrow(() -> new ApiException(400, "Aucun quartier ne couvre cette position. Choisissez un quartier."));
        return neighborhoods.findById(found).orElseThrow(() -> new ApiException(404, "Quartier introuvable"));
    }

    private String nextReference() {
        Long value = jdbc.queryForObject("SELECT nextval('report_ref_seq')", Long.class);
        if (value == null) {
            throw new ApiException(500, "Impossible de numéroter le signalement");
        }
        return "EN-" + String.format("%04d", value);
    }

    private ReportChannel channel(String raw) {
        if (raw == null || raw.isBlank()) {
            return ReportChannel.WEB;
        }
        try {
            return ReportChannel.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ApiException(400, "Canal attendu : WEB, APP, WHATSAPP ou SMS");
        }
    }

    private String safe(String value) {
        return value == null ? "" : value.replace(';', ',');
    }
}
