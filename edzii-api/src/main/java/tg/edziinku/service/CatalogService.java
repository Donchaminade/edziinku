package tg.edziinku.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tg.edziinku.domain.Alert;
import tg.edziinku.domain.AlertKind;
import tg.edziinku.domain.AlertLevel;
import tg.edziinku.domain.CampaignSnapshot;
import tg.edziinku.domain.Neighborhood;
import tg.edziinku.domain.ReportStatus;
import tg.edziinku.dto.Dtos;
import tg.edziinku.geo.GeoRepository;
import tg.edziinku.repo.AlertRepository;
import tg.edziinku.repo.BasinRepository;
import tg.edziinku.repo.CampaignSnapshotRepository;
import tg.edziinku.repo.FieldTeamRepository;
import tg.edziinku.repo.NeighborhoodRepository;
import tg.edziinku.repo.ReportRepository;
import tg.edziinku.repo.TimelineRepository;
import tg.edziinku.web.ApiException;

import java.util.List;
import java.util.UUID;

@Service
public class CatalogService {

    private final NeighborhoodRepository neighborhoods;
    private final AlertRepository alerts;
    private final BasinRepository basins;
    private final TimelineRepository timeline;
    private final FieldTeamRepository teams;
    private final CampaignSnapshotRepository snapshots;
    private final ReportRepository reports;
    private final GeoRepository geo;
    private final ViewMapper mapper;

    public CatalogService(
            NeighborhoodRepository neighborhoods,
            AlertRepository alerts,
            BasinRepository basins,
            TimelineRepository timeline,
            FieldTeamRepository teams,
            CampaignSnapshotRepository snapshots,
            ReportRepository reports,
            GeoRepository geo,
            ViewMapper mapper
    ) {
        this.neighborhoods = neighborhoods;
        this.alerts = alerts;
        this.basins = basins;
        this.timeline = timeline;
        this.teams = teams;
        this.snapshots = snapshots;
        this.reports = reports;
        this.geo = geo;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<Dtos.NeighborhoodCard> neighborhoods() {
        return neighborhoods.findPublicCatalog().stream()
                .filter(item -> !item.isUnlocated())
                .map(mapper::neighborhood)
                .toList();
    }

    @Transactional(readOnly = true)
    public Dtos.LocateResponse locate(double latitude, double longitude) {
        return geo.neighborhoodContaining(latitude, longitude)
                .flatMap(neighborhoods::findById)
                .map(n -> new Dtos.LocateResponse(mapper.neighborhood(n)))
                .orElse(new Dtos.LocateResponse(null));
    }

    @Transactional(readOnly = true)
    public List<Dtos.AlertCard> alerts() {
        return alerts.findAllByOrderByCreatedAtDesc().stream().map(mapper::alert).toList();
    }

    @Transactional(readOnly = true)
    public Dtos.AlertCard alert(UUID id) {
        return alerts.findById(id).map(mapper::alert).orElseThrow(() -> new ApiException(404, "Alerte introuvable"));
    }

    @Transactional
    public Alert createAlert(Dtos.AlertCreateRequest request) {
        Alert alert = new Alert();
        alert.setTitle(request.title().trim());
        alert.setBody(request.body().trim());
        alert.setBodyEwe(request.bodyEwe() == null || request.bodyEwe().isBlank() ? null : request.bodyEwe().trim());
        alert.setEweNeedsReview(alert.getBodyEwe() != null);
        try {
            alert.setLevel(AlertLevel.valueOf(request.level().trim().toUpperCase()));
            alert.setKind(AlertKind.valueOf(request.kind().trim().toUpperCase()));
        } catch (IllegalArgumentException ex) {
            throw new ApiException(400, "Niveau ou type d’alerte invalide");
        }
        if (request.neighborhoodId() != null) {
            Neighborhood neighborhood = neighborhoods.findById(request.neighborhoodId())
                    .orElseThrow(() -> new ApiException(404, "Quartier introuvable"));
            alert.setNeighborhood(neighborhood);
        }
        alert.setStartsAt(request.startsAt());
        alert.setEndsAt(request.endsAt());
        alert.setRainMmMin(request.rainMmMin());
        alert.setRainMmMax(request.rainMmMax());
        alert.setSource(request.source() == null || request.source().isBlank() ? "Edzii-Nku" : request.source().trim());
        return alerts.save(alert);
    }

    @Transactional(readOnly = true)
    public List<Dtos.BasinCard> basins() {
        return basins.findAllByOrderByObstructionPctDesc().stream().map(mapper::basin).toList();
    }

    @Transactional(readOnly = true)
    public List<Dtos.TimelineCard> timeline() {
        return timeline.findAllByOrderByOccurredAtDesc().stream().map(mapper::timeline).toList();
    }

    @Transactional(readOnly = true)
    public List<Dtos.TeamCard> teams() {
        return teams.findAll().stream().map(mapper::team).toList();
    }

    @Transactional(readOnly = true)
    public Dtos.DashboardResponse dashboard() {
        CampaignSnapshot snap = snapshots.findById(1).orElseThrow(() -> new ApiException(404, "Tableau de bord indisponible"));
        return new Dtos.DashboardResponse(
                snap.isDemo(),
                snap.getAlertsSentToday(),
                snap.getReports24h(),
                snap.getReportsTrend(),
                snap.getActiveBlackSpots(),
                snap.getCriticalBlackSpots(),
                snap.getDrainsToClear(),
                snap.getPlannedThisWeek(),
                snap.getVigilanceLabel(),
                snap.getVigilanceWindow(),
                snap.getVigilanceNeighborhood(),
                reports.count(),
                reports.countByStatus(ReportStatus.A_VERIFIER)
        );
    }
}
