package tg.edziinku.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tg.edziinku.domain.City;
import tg.edziinku.domain.Neighborhood;
import tg.edziinku.domain.ReportStatus;
import tg.edziinku.domain.RiskLevel;
import tg.edziinku.domain.UrgencyLevel;
import tg.edziinku.dto.Dtos;
import tg.edziinku.repo.AlertRepository;
import tg.edziinku.repo.CityRepository;
import tg.edziinku.repo.NeighborhoodRepository;
import tg.edziinku.repo.ReportRepository;
import tg.edziinku.repo.UrgencyLevelRepository;
import tg.edziinku.web.ApiException;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class TerritoryService {

    private static final Pattern HEX = Pattern.compile("^#([0-9A-Fa-f]{6})$");

    private final CityRepository cities;
    private final NeighborhoodRepository neighborhoods;
    private final UrgencyLevelRepository urgencies;
    private final ReportRepository reports;
    private final AlertRepository alerts;
    private final ViewMapper mapper;

    public TerritoryService(
            CityRepository cities,
            NeighborhoodRepository neighborhoods,
            UrgencyLevelRepository urgencies,
            ReportRepository reports,
            AlertRepository alerts,
            ViewMapper mapper
    ) {
        this.cities = cities;
        this.neighborhoods = neighborhoods;
        this.urgencies = urgencies;
        this.reports = reports;
        this.alerts = alerts;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<Dtos.CityCard> publicCities() {
        return cities.findAllByActiveTrueOrderByNameAsc().stream()
                .map(city -> mapper.city(city, neighborhoods.countByCity_Id(city.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Dtos.CityCard> adminCities() {
        return cities.findAllByOrderByNameAsc().stream()
                .map(city -> mapper.city(city, neighborhoods.countByCity_Id(city.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Dtos.UrgencyLevelCard> publicUrgencies() {
        return urgencies.findAllByActiveTrueOrderByRankAsc().stream()
                .map(level -> mapper.urgency(level, neighborhoods.countByUrgencyLevel_Id(level.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Dtos.UrgencyLevelCard> adminUrgencies() {
        return urgencies.findAllByOrderByRankAsc().stream()
                .map(level -> mapper.urgency(level, neighborhoods.countByUrgencyLevel_Id(level.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Dtos.NeighborhoodCard> adminNeighborhoods() {
        return neighborhoods.findAdminCatalog().stream().map(mapper::neighborhood).toList();
    }

    @Transactional(readOnly = true)
    public Dtos.NeighborhoodDetail neighborhoodDetail(UUID id) {
        Neighborhood neighborhood = neighborhoods.findDetailedById(id)
                .orElseThrow(() -> new ApiException(404, "Quartier introuvable"));
        if (!neighborhood.isActive()) {
            throw new ApiException(404, "Quartier introuvable");
        }
        List<Dtos.ReportCard> recent = reports
                .findTop8ByNeighborhood_IdAndStatusOrderByCreatedAtDesc(neighborhood.getId(), ReportStatus.VALIDE)
                .stream()
                .map(mapper::report)
                .toList();
        return new Dtos.NeighborhoodDetail(mapper.neighborhood(neighborhood), recent);
    }

    @Transactional
    public Dtos.CityCard createCity(Dtos.CityRequest request) {
        City city = new City();
        applyCity(city, request, true);
        cities.save(city);
        return mapper.city(city, 0);
    }

    @Transactional
    public Dtos.CityCard updateCity(UUID id, Dtos.CityRequest request) {
        City city = cities.findById(id).orElseThrow(() -> new ApiException(404, "Ville introuvable"));
        applyCity(city, request, false);
        return mapper.city(city, neighborhoods.countByCity_Id(id));
    }

    @Transactional
    public void deleteCity(UUID id) {
        City city = cities.findById(id).orElseThrow(() -> new ApiException(404, "Ville introuvable"));
        long count = neighborhoods.countByCity_Id(id);
        if (count > 0) {
            throw new ApiException(409, "Cette ville a encore " + count + " quartier(s). Désactivez-la ou déplacez les quartiers avant de la supprimer.");
        }
        cities.delete(city);
    }

    @Transactional
    public Dtos.UrgencyLevelCard createUrgency(Dtos.UrgencyLevelRequest request) {
        UrgencyLevel level = new UrgencyLevel();
        applyUrgency(level, request, true);
        urgencies.save(level);
        return mapper.urgency(level, 0);
    }

    @Transactional
    public Dtos.UrgencyLevelCard updateUrgency(UUID id, Dtos.UrgencyLevelRequest request) {
        UrgencyLevel level = urgencies.findById(id).orElseThrow(() -> new ApiException(404, "Niveau d’urgence introuvable"));
        applyUrgency(level, request, false);
        return mapper.urgency(level, neighborhoods.countByUrgencyLevel_Id(id));
    }

    @Transactional
    public void deleteUrgency(UUID id) {
        UrgencyLevel level = urgencies.findById(id).orElseThrow(() -> new ApiException(404, "Niveau d’urgence introuvable"));
        long count = neighborhoods.countByUrgencyLevel_Id(id);
        if (count > 0) {
            throw new ApiException(409, "Ce niveau est encore attribué à " + count + " quartier(s). Désactivez-le ou réassignez les quartiers avant de le supprimer.");
        }
        urgencies.delete(level);
    }

    @Transactional
    public Dtos.NeighborhoodCard createNeighborhood(Dtos.NeighborhoodRequest request) {
        Neighborhood neighborhood = new Neighborhood();
        applyNeighborhood(neighborhood, request, true);
        neighborhoods.save(neighborhood);
        return mapper.neighborhood(neighborhood);
    }

    @Transactional
    public Dtos.NeighborhoodCard updateNeighborhood(UUID id, Dtos.NeighborhoodRequest request) {
        Neighborhood neighborhood = neighborhoods.findDetailedById(id)
                .orElseThrow(() -> new ApiException(404, "Quartier introuvable"));
        if (neighborhood.isUnlocated()) {
            throw new ApiException(400, "Le quartier « Non localisé » ne peut pas être renommé. Vous pouvez seulement changer son niveau d’urgence.");
        }
        applyNeighborhood(neighborhood, request, false);
        return mapper.neighborhood(neighborhood);
    }

    @Transactional
    public void deleteNeighborhood(UUID id) {
        Neighborhood neighborhood = neighborhoods.findById(id).orElseThrow(() -> new ApiException(404, "Quartier introuvable"));
        if (neighborhood.isUnlocated()) {
            throw new ApiException(400, "Le quartier « Non localisé » ne peut pas être supprimé.");
        }
        long reportCount = reports.countByNeighborhood_Id(id);
        if (reportCount > 0) {
            throw new ApiException(409, "Des signalements pointent encore sur ce quartier (" + reportCount + "). Désactivez-le plutôt que de le supprimer.");
        }
        long alertCount = alerts.countByNeighborhood_Id(id);
        if (alertCount > 0) {
            throw new ApiException(409, "Des alertes ciblent encore ce quartier. Désactivez-le plutôt que de le supprimer.");
        }
        neighborhoods.delete(neighborhood);
    }

    private void applyCity(City city, Dtos.CityRequest request, boolean creating) {
        String name = request.name().trim();
        String slug = uniqueCitySlug(Slugs.of(name), creating ? null : city.getId());
        validateOptionalCoord(request.latitude(), request.longitude());
        city.setName(name);
        city.setSlug(slug);
        city.setRegion(blankToNull(request.region()));
        city.setCommune(blankToNull(request.commune()));
        city.setLatitude(request.latitude());
        city.setLongitude(request.longitude());
        city.setActive(request.active() == null || request.active());
    }

    private void applyUrgency(UrgencyLevel level, Dtos.UrgencyLevelRequest request, boolean creating) {
        String label = request.label().trim();
        String color = request.color().trim().toUpperCase(Locale.ROOT);
        if (!HEX.matcher(color).matches()) {
            throw new ApiException(400, "La couleur doit être un aplat hexadécimal (#RRGGBB), sans dégradé.");
        }
        int rank = request.rank();
        if (rank < 1 || rank > 99) {
            throw new ApiException(400, "Le rang doit être un entier entre 1 et 99 (1 = le plus urgent).");
        }
        UUID currentId = creating ? null : level.getId();
        if (currentId == null ? urgencies.existsByRank(rank) : urgencies.existsByRankAndIdNot(rank, currentId)) {
            throw new ApiException(409, "Ce rang est déjà pris. Choisissez un autre ordre de gravité.");
        }
        String slug = uniqueUrgencySlug(Slugs.of(label), currentId);
        level.setLabel(label);
        level.setSlug(slug);
        level.setColor(color);
        level.setRank(rank);
        level.setActive(request.active() == null || request.active());
    }

    private void applyNeighborhood(Neighborhood neighborhood, Dtos.NeighborhoodRequest request, boolean creating) {
        String name = request.name().trim();
        String slug = uniqueNeighborhoodSlug(Slugs.of(name), creating ? null : neighborhood.getId());
        City city = null;
        if (request.cityId() != null) {
            city = cities.findById(request.cityId()).orElseThrow(() -> new ApiException(404, "Ville introuvable"));
        }
        UrgencyLevel urgency = null;
        if (request.urgencyLevelId() != null) {
            urgency = urgencies.findById(request.urgencyLevelId())
                    .orElseThrow(() -> new ApiException(404, "Niveau d’urgence introuvable"));
        }
        Double lat = request.latitude();
        Double lng = request.longitude();
        if (lat == null && city != null) {
            lat = city.getLatitude();
        }
        if (lng == null && city != null) {
            lng = city.getLongitude();
        }
        if (lat == null || lng == null) {
            throw new ApiException(400, "Indiquez une latitude et une longitude, ou rattachez le quartier à une ville qui en a.");
        }
        validateCoord(lat, lng);
        String commune = blankToNull(request.commune());
        if (commune == null && city != null) {
            commune = city.getCommune() != null ? city.getCommune() : city.getName();
        }
        if (commune == null) {
            commune = city != null ? city.getName() : "Togo";
        }
        neighborhood.setName(name);
        neighborhood.setSlug(slug);
        neighborhood.setCity(city);
        neighborhood.setUrgencyLevel(urgency);
        neighborhood.setCommune(commune);
        neighborhood.setAliases(blankToNull(request.aliases()));
        neighborhood.setLatitude(lat);
        neighborhood.setLongitude(lng);
        neighborhood.setApproximate(request.approximate() == null || request.approximate());
        neighborhood.setActive(request.active() == null || request.active());
        neighborhood.setRiskLevel(riskFrom(urgency));
    }

    static RiskLevel riskFrom(UrgencyLevel urgency) {
        if (urgency == null) {
            return RiskLevel.A_SURVEILLER;
        }
        return switch (urgency.getRank()) {
            case 1, 2 -> RiskLevel.ELEVE;
            case 3 -> RiskLevel.A_SURVEILLER;
            default -> RiskLevel.MODERE;
        };
    }

    private String uniqueCitySlug(String base, UUID currentId) {
        return uniqueSlug(base, slug -> currentId == null ? cities.existsBySlug(slug) : cities.existsBySlugAndIdNot(slug, currentId));
    }

    private String uniqueUrgencySlug(String base, UUID currentId) {
        return uniqueSlug(base, slug -> currentId == null ? urgencies.existsBySlug(slug) : urgencies.existsBySlugAndIdNot(slug, currentId));
    }

    private String uniqueNeighborhoodSlug(String base, UUID currentId) {
        return uniqueSlug(base, slug -> currentId == null ? neighborhoods.existsBySlug(slug) : neighborhoods.existsBySlugAndIdNot(slug, currentId));
    }

    private String uniqueSlug(String base, java.util.function.Predicate<String> taken) {
        String candidate = base;
        int index = 2;
        while (taken.test(candidate)) {
            String suffix = "-" + index;
            candidate = base.length() + suffix.length() > 64
                    ? base.substring(0, 64 - suffix.length()) + suffix
                    : base + suffix;
            index++;
            if (index > 50) {
                throw new ApiException(409, "Impossible de générer un identifiant unique pour ce nom.");
            }
        }
        return candidate;
    }

    private void validateOptionalCoord(Double lat, Double lng) {
        if (lat == null && lng == null) {
            return;
        }
        if (lat == null || lng == null) {
            throw new ApiException(400, "Latitude et longitude vont ensemble.");
        }
        validateCoord(lat, lng);
    }

    private void validateCoord(double lat, double lng) {
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new ApiException(400, "Coordonnées invalides.");
        }
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
