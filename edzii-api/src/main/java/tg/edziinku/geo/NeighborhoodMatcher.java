package tg.edziinku.geo;

import tg.edziinku.domain.Neighborhood;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Appariement point → quartier (Haversine) et diffusion aux voisinages.
 * <p>
 * Rayon de rattachement : {@value #MATCH_MAX_KM} km (sinon « hors zone connue »).<br>
 * Rayon de voisinage : {@value #NEIGHBOR_RADIUS_KM} km entre centroïdes.
 * Une ville ciblée alerte tous ses quartiers, plus les quartiers hors ville
 * dont le centroïde est dans ce rayon d’un quartier de la ville.
 */
public final class NeighborhoodMatcher {

    public static final double MATCH_MAX_KM = 3.0;
    public static final double NEIGHBOR_RADIUS_KM = 2.0;

    private NeighborhoodMatcher() {
    }

    public record Match(Neighborhood neighborhood, double meters) {
    }

    public static Optional<Match> nearest(List<Neighborhood> neighborhoods, double latitude, double longitude) {
        return nearest(neighborhoods, latitude, longitude, MATCH_MAX_KM);
    }

    public static Optional<Match> nearest(
            List<Neighborhood> neighborhoods,
            double latitude,
            double longitude,
            double maxKm
    ) {
        if (!GeoMath.validLatLng(latitude, longitude)) {
            return Optional.empty();
        }
        Match best = null;
        for (Neighborhood neighborhood : neighborhoods) {
            if (!usable(neighborhood)) {
                continue;
            }
            double meters = GeoMath.haversineMeters(
                    latitude, longitude, neighborhood.getLatitude(), neighborhood.getLongitude());
            if (best == null || meters < best.meters()) {
                best = new Match(neighborhood, meters);
            }
        }
        if (best == null || best.meters() > maxKm * 1000) {
            return Optional.empty();
        }
        return Optional.of(best);
    }

    /**
     * Quartiers dont le centroïde est dans {@code radiusKm} du quartier d’origine.
     * N’inclut pas l’origine. Même ville non requise : Bè-Kpota alerte Bè, Bè-Ahligo, etc.
     */
    public static List<Neighborhood> neighbors(Neighborhood origin, List<Neighborhood> all, double radiusKm) {
        if (origin == null || !usable(origin)) {
            return List.of();
        }
        double max = radiusKm * 1000;
        List<Neighborhood> found = new ArrayList<>();
        for (Neighborhood candidate : all) {
            if (!usable(candidate) || candidate.getId().equals(origin.getId())) {
                continue;
            }
            double meters = GeoMath.haversineMeters(
                    origin.getLatitude(), origin.getLongitude(),
                    candidate.getLatitude(), candidate.getLongitude());
            if (meters <= max) {
                found.add(candidate);
            }
        }
        found.sort(Comparator.comparing(Neighborhood::getName, String.CASE_INSENSITIVE_ORDER));
        return found;
    }

    public static List<Neighborhood> neighbors(Neighborhood origin, List<Neighborhood> all) {
        return neighbors(origin, all, NEIGHBOR_RADIUS_KM);
    }

    /**
     * Quartiers du secteur (cible ville et/ou quartier) plus les voisinages à {@value #NEIGHBOR_RADIUS_KM} km.
     */
    public static List<Neighborhood> sectorAndNeighbors(
            Neighborhood target,
            UUID cityId,
            List<Neighborhood> all
    ) {
        Set<UUID> seen = new LinkedHashSet<>();
        List<Neighborhood> sector = new ArrayList<>();
        if (target != null && usable(target)) {
            sector.add(target);
            seen.add(target.getId());
        }
        if (cityId != null) {
            for (Neighborhood neighborhood : all) {
                if (!usable(neighborhood) || neighborhood.getCity() == null) {
                    continue;
                }
                if (cityId.equals(neighborhood.getCity().getId()) && seen.add(neighborhood.getId())) {
                    sector.add(neighborhood);
                }
            }
        }
        List<Neighborhood> result = new ArrayList<>(sector);
        for (Neighborhood origin : sector) {
            for (Neighborhood neighbor : neighbors(origin, all, NEIGHBOR_RADIUS_KM)) {
                if (seen.add(neighbor.getId())) {
                    result.add(neighbor);
                }
            }
        }
        return result;
    }

    public static boolean usable(Neighborhood neighborhood) {
        return neighborhood != null
                && neighborhood.isActive()
                && !neighborhood.isUnlocated()
                && GeoMath.validLatLng(neighborhood.getLatitude(), neighborhood.getLongitude());
    }
}
