package tg.edziinku.geo;

/**
 * Distances à la surface terrestre. Formule de Haversine, rayon moyen WGS84.
 */
public final class GeoMath {

    public static final double EARTH_RADIUS_M = 6_371_000.0;

    private GeoMath() {
    }

    public static double haversineMeters(double lat1, double lng1, double lat2, double lng2) {
        double phi1 = Math.toRadians(lat1);
        double phi2 = Math.toRadians(lat2);
        double dPhi = Math.toRadians(lat2 - lat1);
        double dLambda = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2)
                + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
        return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    public static boolean validLatLng(Double lat, Double lng) {
        return lat != null && lng != null
                && lat >= -90 && lat <= 90
                && lng >= -180 && lng <= 180
                && !(lat == 0 && lng == 0);
    }
}
