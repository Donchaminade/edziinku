package tg.edziinku.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tg.edziinku.domain.Alert;
import tg.edziinku.domain.AlertKind;
import tg.edziinku.domain.AlertLevel;
import tg.edziinku.domain.CampaignSnapshot;
import tg.edziinku.domain.City;
import tg.edziinku.domain.Neighborhood;
import tg.edziinku.domain.ReportStatus;
import tg.edziinku.dto.Dtos;
import tg.edziinku.geo.GeoRepository;
import tg.edziinku.geo.MapLinkParser;
import tg.edziinku.geo.MapLinkResolver;
import tg.edziinku.geo.NeighborhoodMatcher;
import tg.edziinku.repo.AlertRepository;
import tg.edziinku.repo.BasinRepository;
import tg.edziinku.repo.CampaignSnapshotRepository;
import tg.edziinku.repo.CityRepository;
import tg.edziinku.repo.FieldTeamRepository;
import tg.edziinku.repo.NeighborhoodRepository;
import tg.edziinku.repo.ReportRepository;
import tg.edziinku.repo.TimelineRepository;
import tg.edziinku.web.ApiException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
    private final CityRepository cities;
    private final GeoRepository geo;
    private final MapLinkResolver links;
    private final ViewMapper mapper;

    public CatalogService(
            NeighborhoodRepository neighborhoods,
            AlertRepository alerts,
            BasinRepository basins,
            TimelineRepository timeline,
            FieldTeamRepository teams,
            CampaignSnapshotRepository snapshots,
            ReportRepository reports,
            CityRepository cities,
            GeoRepository geo,
            MapLinkResolver links,
            ViewMapper mapper
    ) {
        this.neighborhoods = neighborhoods;
        this.alerts = alerts;
        this.basins = basins;
        this.timeline = timeline;
        this.teams = teams;
        this.snapshots = snapshots;
        this.reports = reports;
        this.cities = cities;
        this.geo = geo;
        this.links = links;
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
        return nearestHood(latitude, longitude)
                .map(match -> new Dtos.LocateResponse(mapper.neighborhood(match.neighborhood())))
                .orElse(new Dtos.LocateResponse(null));
    }

    @Transactional(readOnly = true)
    public Dtos.LocalRiskResponse risk(Double latitude, Double longitude, UUID neighborhoodId) {
        List<Neighborhood> catalog = neighborhoods.findPublicCatalog();
        Neighborhood here = null;
        Double distance = null;
        if (neighborhoodId != null) {
            here = neighborhoods.findDetailedById(neighborhoodId).orElse(null);
            if (here != null && !NeighborhoodMatcher.usable(here)) {
                here = null;
            }
            if (here != null) {
                distance = 0d;
            }
        }
        if (here == null && latitude != null && longitude != null) {
            Optional<NeighborhoodMatcher.Match> match = nearestHood(latitude, longitude);
            if (match.isPresent()) {
                here = match.get().neighborhood();
                distance = match.get().meters();
            }
        }
        if (here == null) {
            return new Dtos.LocalRiskResponse(
                    null, null, true, null, null, null, null,
                    List.of(), List.of(),
                    NeighborhoodMatcher.NEIGHBOR_RADIUS_KM,
                    NeighborhoodMatcher.MATCH_MAX_KM
            );
        }
        Neighborhood sector = here;
        List<Neighborhood> neighbors = NeighborhoodMatcher.neighbors(sector, catalog);
        List<String> neighborNames = neighbors.stream().map(Neighborhood::getName).toList();
        Instant now = Instant.now();
        List<Dtos.LocalAlertCard> localAlerts = new ArrayList<>();
        for (Alert alert : alerts.findAllByOrderByCreatedAtDesc()) {
            if (!isActive(alert, now)) {
                continue;
            }
            String scope = scopeFor(alert, sector, catalog);
            if (scope == null) {
                continue;
            }
            List<Neighborhood> reached = NeighborhoodMatcher.sectorAndNeighbors(
                    alert.getNeighborhood(),
                    alert.getCity() == null ? null : alert.getCity().getId(),
                    catalog
            );
            String hereName = sector.getName();
            List<String> others = reached.stream()
                    .map(Neighborhood::getName)
                    .filter(name -> !name.equals(hereName))
                    .toList();
            localAlerts.add(new Dtos.LocalAlertCard(mapper.alert(alert), scope, others));
        }
        var urgency = sector.getUrgencyLevel();
        return new Dtos.LocalRiskResponse(
                mapper.neighborhood(sector),
                distance,
                false,
                urgency == null ? here.getRiskLevel().getLabel() : urgency.getLabel(),
                urgency == null ? null : urgency.getColor(),
                urgency == null ? null : urgency.getRank(),
                here.getRiskLevel().name(),
                localAlerts,
                neighborNames,
                NeighborhoodMatcher.NEIGHBOR_RADIUS_KM,
                NeighborhoodMatcher.MATCH_MAX_KM
        );
    }

    @Transactional(readOnly = true)
    public Dtos.ParseLinkResponse parseLink(Dtos.ParseLinkRequest request) {
        Optional<MapLinkParser.Coords> coords = links.resolve(request.url());
        if (coords.isPresent()) {
            MapLinkParser.Coords found = coords.get();
            return new Dtos.ParseLinkResponse(found.latitude(), found.longitude(), found.source(), false, null);
        }
        if (MapLinkParser.looksLikeUnresolvedShortlink(request.url())) {
            return new Dtos.ParseLinkResponse(
                    null, null, null, true,
                    "Ouvrez le lien dans Maps, puis copiez les coordonnées (lat, lng) affichées."
            );
        }
        return new Dtos.ParseLinkResponse(
                null, null, null, false,
                "Lien ou coordonnées non reconnus. Collez un lien Google / Apple / OSM, geo: ou un couple lat,lng."
        );
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
            Neighborhood neighborhood = neighborhoods.findDetailedById(request.neighborhoodId())
                    .orElseThrow(() -> new ApiException(404, "Quartier introuvable"));
            alert.setNeighborhood(neighborhood);
        }
        if (request.cityId() != null && request.neighborhoodId() == null) {
            City city = cities.findById(request.cityId())
                    .orElseThrow(() -> new ApiException(404, "Ville introuvable"));
            alert.setCity(city);
        }
        alert.setStartsAt(request.startsAt());
        alert.setEndsAt(request.endsAt());
        alert.setRainMmMin(request.rainMmMin());
        alert.setRainMmMax(request.rainMmMax());
        alert.setSource(request.source() == null || request.source().isBlank() ? "Edzii-Nku" : request.source().trim());
        return alerts.save(alert);
    }

    @Transactional
    public Dtos.AlertCard endAlert(UUID id) {
        Alert alert = alerts.findById(id).orElseThrow(() -> new ApiException(404, "Alerte introuvable"));
        alert.setEndsAt(Instant.now());
        return mapper.alert(alerts.save(alert));
    }

    public List<Neighborhood> broadcastTargets(Alert alert) {
        List<Neighborhood> catalog = neighborhoods.findPublicCatalog();
        if (alert.getNeighborhood() == null && alert.getCity() == null) {
            return catalog;
        }
        return NeighborhoodMatcher.sectorAndNeighbors(
                alert.getNeighborhood(),
                alert.getCity() == null ? null : alert.getCity().getId(),
                catalog
        );
    }

    private Optional<NeighborhoodMatcher.Match> nearestHood(double latitude, double longitude) {
        Optional<NeighborhoodMatcher.Match> byDistance = NeighborhoodMatcher.nearest(
                neighborhoods.findPublicCatalog(), latitude, longitude);
        if (byDistance.isPresent()) {
            return byDistance;
        }
        return geo.neighborhoodContaining(latitude, longitude)
                .flatMap(neighborhoods::findDetailedById)
                .filter(NeighborhoodMatcher::usable)
                .map(n -> new NeighborhoodMatcher.Match(n, 0));
    }

    private static boolean isActive(Alert alert, Instant now) {
        if (alert.getEndsAt() != null && !alert.getEndsAt().isAfter(now)) {
            return false;
        }
        return alert.getStartsAt() == null || !alert.getStartsAt().isAfter(now);
    }

    /**
     * {@code SECTOR} : le quartier (ou sa ville) est la cible.
     * {@code NEIGHBOR} : centroïde dans le rayon de 2 km d’une cible.
     */
    private static String scopeFor(Alert alert, Neighborhood here, List<Neighborhood> catalog) {
        if (here == null) {
            return null;
        }
        if (alert.getNeighborhood() == null && alert.getCity() == null) {
            return "SECTOR";
        }
        if (alert.getNeighborhood() != null && here.getId().equals(alert.getNeighborhood().getId())) {
            return "SECTOR";
        }
        if (alert.getCity() != null && here.getCity() != null
                && alert.getCity().getId().equals(here.getCity().getId())) {
            return "SECTOR";
        }
        List<Neighborhood> reached = NeighborhoodMatcher.sectorAndNeighbors(
                alert.getNeighborhood(),
                alert.getCity() == null ? null : alert.getCity().getId(),
                catalog
        );
        return reached.stream().anyMatch(n -> n.getId().equals(here.getId())) ? "NEIGHBOR" : null;
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
