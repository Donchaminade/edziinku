package tg.edziinku.service;

import tg.edziinku.domain.Neighborhood;
import tg.edziinku.domain.Report;
import tg.edziinku.dto.Dtos;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Agrège les signalements validés par quartier pour le hero public.
 * Groupement canonique sur l’id de quartier ; sinon sur le libellé nettoyé.
 */
public final class HotspotAggregator {

    static final int REPORTS_PER_ZONE = 8;

    private HotspotAggregator() {
    }

    public static Dtos.HotspotResponse aggregate(List<Report> reports, int days, int limit) {
        int window = Math.min(31, Math.max(1, days));
        int top = Math.min(10, Math.max(1, limit));
        if (reports == null || reports.isEmpty()) {
            return new Dtos.HotspotResponse(window, List.of());
        }

        Map<String, Bucket> buckets = new LinkedHashMap<>();
        for (Report report : reports) {
            BucketKey key = keyOf(report);
            Bucket bucket = buckets.computeIfAbsent(key.id(), ignored -> new Bucket(key));
            bucket.add(report);
        }

        List<Dtos.HotspotZone> zones = buckets.values().stream()
                .sorted(Comparator.comparingLong(Bucket::count).reversed()
                        .thenComparing(bucket -> bucket.label, String.CASE_INSENSITIVE_ORDER))
                .limit(top)
                .map(Bucket::toZone)
                .toList();
        return new Dtos.HotspotResponse(window, zones);
    }

    static BucketKey keyOf(Report report) {
        Neighborhood neighborhood = report.getNeighborhood();
        if (neighborhood != null && neighborhood.getId() != null) {
            String id = neighborhood.getSlug() != null && !neighborhood.getSlug().isBlank()
                    ? neighborhood.getSlug().trim()
                    : neighborhood.getId().toString();
            String label = neighborhood.getName() == null || neighborhood.getName().isBlank()
                    ? "Quartier"
                    : neighborhood.getName().trim();
            return new BucketKey(id, label, neighborhood.getLatitude(), neighborhood.getLongitude());
        }
        String raw = report.getPlaceLabel() == null ? "" : report.getPlaceLabel().trim();
        if (raw.isEmpty()) {
            return new BucketKey("inconnu", "Quartier inconnu", report.getLatitude(), report.getLongitude());
        }
        return new BucketKey(normalize(raw), raw, report.getLatitude(), report.getLongitude());
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

    record BucketKey(String id, String label, double lat, double lng) {
    }

    static final class Bucket {
        private final String id;
        private final String label;
        private final double fallbackLat;
        private final double fallbackLng;
        private final List<Report> reports = new ArrayList<>();
        private double latSum;
        private double lngSum;

        Bucket(BucketKey key) {
            this.id = key.id();
            this.label = key.label();
            this.fallbackLat = key.lat();
            this.fallbackLng = key.lng();
        }

        void add(Report report) {
            reports.add(report);
            latSum += report.getLatitude();
            lngSum += report.getLongitude();
        }

        long count() {
            return reports.size();
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
            return new Dtos.HotspotZone(id, label, reports.size(), lat, lng, cards);
        }
    }
}
