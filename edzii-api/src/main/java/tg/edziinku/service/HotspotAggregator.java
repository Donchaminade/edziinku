package tg.edziinku.service;

import tg.edziinku.domain.City;
import tg.edziinku.domain.Neighborhood;
import tg.edziinku.domain.Report;
import tg.edziinku.domain.UrgencyLevel;
import tg.edziinku.dto.Dtos;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Agrège les signalements validés par quartier pour le hero public.
 * Tri : rang d’urgence (plus petit = plus urgent) puis volume récent.
 */
public final class HotspotAggregator {

    static final int REPORTS_PER_ZONE = 8;
    static final int MAX_LIMIT = 200;
    static final int URGENT_RANK_MAX = 2;

    private HotspotAggregator() {
    }

    public static Dtos.HotspotResponse aggregate(List<Report> reports, int days, int limit) {
        return aggregate(reports, List.of(), days, limit);
    }

    public static Dtos.HotspotResponse aggregate(
            List<Report> reports,
            List<Neighborhood> catalog,
            int days,
            int limit
    ) {
        int window = Math.min(31, Math.max(1, days));
        int top = Math.min(MAX_LIMIT, Math.max(1, limit));
        Map<String, Bucket> buckets = new LinkedHashMap<>();
        if (catalog != null) {
            for (Neighborhood neighborhood : catalog) {
                if (neighborhood == null || neighborhood.getId() == null) {
                    continue;
                }
                BucketKey key = keyOf(neighborhood);
                buckets.putIfAbsent(key.id(), new Bucket(key, neighborhood));
            }
        }
        if (reports != null) {
            for (Report report : reports) {
                BucketKey key = keyOf(report);
                Bucket bucket = buckets.get(key.id());
                if (bucket == null && report.getNeighborhood() != null) {
                    Neighborhood neighborhood = report.getNeighborhood();
                    String slug = neighborhood.getSlug();
                    if (slug != null && buckets.containsKey(slug.trim())) {
                        bucket = buckets.get(slug.trim());
                    }
                }
                if (bucket == null) {
                    bucket = buckets.computeIfAbsent(key.id(), ignored -> new Bucket(key, report.getNeighborhood()));
                }
                bucket.add(report);
            }
        }

        List<Dtos.HotspotZone> zones = buckets.values().stream()
                .filter(bucket -> include(bucket, top))
                .sorted(Comparator.comparingInt(Bucket::urgencyRank)
                        .thenComparing(Comparator.comparingLong(Bucket::count).reversed())
                        .thenComparing(bucket -> bucket.label, String.CASE_INSENSITIVE_ORDER))
                .limit(top)
                .map(Bucket::toZone)
                .toList();
        return new Dtos.HotspotResponse(window, zones);
    }

    static boolean include(Bucket bucket, int limit) {
        if (bucket.count() > 0) {
            return true;
        }
        if (bucket.neighborhood != null && bucket.neighborhood.isUnlocated()) {
            return false;
        }
        if (limit <= 10) {
            return false;
        }
        return bucket.urgencyRank() <= URGENT_RANK_MAX;
    }

    static BucketKey keyOf(Neighborhood neighborhood) {
        String id = neighborhood.getSlug() != null && !neighborhood.getSlug().isBlank()
                ? neighborhood.getSlug().trim()
                : neighborhood.getId().toString();
        String label = neighborhood.getName() == null || neighborhood.getName().isBlank()
                ? "Quartier"
                : neighborhood.getName().trim();
        return new BucketKey(id, label, neighborhood.getLatitude(), neighborhood.getLongitude(), neighborhood.getId());
    }

    static BucketKey keyOf(Report report) {
        Neighborhood neighborhood = report.getNeighborhood();
        if (neighborhood != null && neighborhood.getId() != null) {
            return keyOf(neighborhood);
        }
        String raw = report.getPlaceLabel() == null ? "" : report.getPlaceLabel().trim();
        if (raw.isEmpty()) {
            return new BucketKey("inconnu", "Quartier inconnu", report.getLatitude(), report.getLongitude(), null);
        }
        return new BucketKey(normalize(raw), raw, report.getLatitude(), report.getLongitude(), null);
    }

    static String normalize(String value) {
        String folded = Normalizer.normalize(value.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ");
        return folded.isBlank() ? "inconnu" : folded;
    }

    static String photoUrl(Report report) {
        String filename = report.getPhotoFilename();
        if (filename == null || filename.isBlank()) {
            return null;
        }
        return "/api/media/" + filename.trim();
    }

    static String quartierOf(Report report) {
        Neighborhood neighborhood = report.getNeighborhood();
        if (neighborhood != null && neighborhood.getName() != null && !neighborhood.getName().isBlank()) {
            return neighborhood.getName().trim();
        }
        String place = report.getPlaceLabel();
        return place == null || place.isBlank() ? "Quartier inconnu" : place.trim();
    }

    static boolean hasPhoto(Report report) {
        return report.getPhotoFilename() != null && !report.getPhotoFilename().isBlank();
    }

    record BucketKey(String id, String label, double lat, double lng, UUID neighborhoodId) {
    }

    static final class Bucket {
        private final String id;
        private final String label;
        private final double fallbackLat;
        private final double fallbackLng;
        private final UUID neighborhoodId;
        private final Neighborhood neighborhood;
        private final List<Report> reports = new ArrayList<>();
        private double latSum;
        private double lngSum;

        Bucket(BucketKey key, Neighborhood neighborhood) {
            this.id = key.id();
            this.label = key.label();
            this.fallbackLat = key.lat();
            this.fallbackLng = key.lng();
            this.neighborhoodId = neighborhood != null ? neighborhood.getId() : key.neighborhoodId();
            this.neighborhood = neighborhood;
        }

        void add(Report report) {
            reports.add(report);
            latSum += report.getLatitude();
            lngSum += report.getLongitude();
        }

        long count() {
            return reports.size();
        }

        int urgencyRank() {
            UrgencyLevel urgency = neighborhood == null ? null : neighborhood.getUrgencyLevel();
            return urgency == null ? 999 : urgency.getRank();
        }

        Dtos.HotspotZone toZone() {
            double lat = reports.isEmpty() ? fallbackLat : latSum / reports.size();
            double lng = reports.isEmpty() ? fallbackLng : lngSum / reports.size();
            List<Report> withPhoto = reports.stream()
                    .filter(HotspotAggregator::hasPhoto)
                    .sorted(Comparator.comparing(Report::getCreatedAt).reversed())
                    .limit(REPORTS_PER_ZONE)
                    .toList();
            List<Report> picked = withPhoto.isEmpty()
                    ? reports.stream()
                    .sorted(Comparator.comparing(Report::getCreatedAt).reversed())
                    .limit(REPORTS_PER_ZONE)
                    .toList()
                    : withPhoto;
            List<Dtos.HotspotReport> cards = picked.stream()
                    .map(report -> new Dtos.HotspotReport(
                            report.getId(),
                            photoUrl(report),
                            report.getCreatedAt(),
                            quartierOf(report)
                    ))
                    .toList();
            City city = neighborhood == null ? null : neighborhood.getCity();
            UrgencyLevel urgency = neighborhood == null ? null : neighborhood.getUrgencyLevel();
            return new Dtos.HotspotZone(
                    id,
                    label,
                    reports.size(),
                    lat,
                    lng,
                    cards,
                    neighborhoodId,
                    city == null ? null : city.getName(),
                    urgency == null ? null : urgency.getLabel(),
                    urgency == null ? null : urgency.getColor(),
                    urgency == null ? null : urgency.getRank()
            );
        }
    }
}
