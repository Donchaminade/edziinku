package tg.edziinku.geo;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Extrait un couple lat/lng d’un lien cartes ou d’un collage « lat,lng ».
 * Ne résout pas les shortlinks ({@code maps.app.goo.gl}) : voir {@link MapLinkResolver}.
 */
public final class MapLinkParser {

    public record Coords(double latitude, double longitude, String source) {
    }

    private static final Pattern BARE = Pattern.compile(
            "^\\s*([+-]?\\d+(?:\\.\\d+)?)\\s*[,;\\s]\\s*([+-]?\\d+(?:\\.\\d+)?)\\s*$");
    private static final Pattern GEO = Pattern.compile(
            "^geo:([+-]?\\d+(?:\\.\\d+)?),([+-]?\\d+(?:\\.\\d+)?)", Pattern.CASE_INSENSITIVE);
    private static final Pattern AT = Pattern.compile(
            "@([+-]?\\d+(?:\\.\\d+)?),([+-]?\\d+(?:\\.\\d+)?)");
    private static final Pattern OSM_HASH = Pattern.compile(
            "#map=\\d+/([+-]?\\d+(?:\\.\\d+)?)/([+-]?\\d+(?:\\.\\d+)?)");
    private static final Pattern D3 = Pattern.compile("^[+-]?\\d+(?:\\.\\d+)?$");

    private MapLinkParser() {
    }

    public static Optional<Coords> parse(String raw) {
        if (raw == null) {
            return Optional.empty();
        }
        String text = raw.trim();
        if (text.isEmpty()) {
            return Optional.empty();
        }

        Matcher geo = GEO.matcher(text);
        if (geo.find()) {
            return coords(geo.group(1), geo.group(2), "geo");
        }

        Matcher bare = BARE.matcher(text);
        if (bare.matches() && !looksLikeUrl(text)) {
            return coords(bare.group(1), bare.group(2), "pair");
        }

        String decoded = decode(text);
        Matcher at = AT.matcher(decoded);
        if (at.find()) {
            return coords(at.group(1), at.group(2), "at");
        }

        Matcher osm = OSM_HASH.matcher(decoded);
        if (osm.find()) {
            return coords(osm.group(1), osm.group(2), "osm");
        }

        Optional<Coords> query = fromQuery(decoded);
        if (query.isPresent()) {
            return query;
        }

        return Optional.empty();
    }

    public static boolean looksLikeUnresolvedShortlink(String raw) {
        if (raw == null) {
            return false;
        }
        String lower = raw.toLowerCase(Locale.ROOT);
        return lower.contains("maps.app.goo.gl") || lower.contains("goo.gl/maps");
    }

    private static Optional<Coords> fromQuery(String text) {
        URI uri = uriOf(text);
        String query = uri == null ? queryOnly(text) : uri.getRawQuery();
        if (query == null || query.isBlank()) {
            return Optional.empty();
        }
        String lat = null;
        String lng = null;
        for (String part : query.split("&")) {
            int eq = part.indexOf('=');
            if (eq < 1) {
                continue;
            }
            String key = decode(part.substring(0, eq)).toLowerCase(Locale.ROOT);
            String value = decode(part.substring(eq + 1));
            if (key.equals("mlat")) {
                lat = value;
            } else if (key.equals("mlon") || key.equals("mlng")) {
                lng = value;
            } else if (key.equals("ll") || key.equals("sll") || key.equals("center") || key.equals("q")
                    || key.equals("query") || key.equals("daddr") || key.equals("saddr")) {
                Optional<Coords> pair = pairIn(value);
                if (pair.isPresent()) {
                    return pair;
                }
            }
        }
        if (lat != null && lng != null) {
            return coords(lat, lng, "query");
        }
        return Optional.empty();
    }

    private static Optional<Coords> pairIn(String value) {
        if (value == null) {
            return Optional.empty();
        }
        String cleaned = value.replace("loc:", "").trim();
        Matcher matcher = Pattern.compile("([+-]?\\d+(?:\\.\\d+)?)\\s*,\\s*([+-]?\\d+(?:\\.\\d+)?)").matcher(cleaned);
        if (matcher.find()) {
            return coords(matcher.group(1), matcher.group(2), "query");
        }
        return Optional.empty();
    }

    private static Optional<Coords> coords(String latRaw, String lngRaw, String source) {
        if (!D3.matcher(latRaw).matches() || !D3.matcher(lngRaw).matches()) {
            return Optional.empty();
        }
        double lat = Double.parseDouble(latRaw);
        double lng = Double.parseDouble(lngRaw);
        if (!GeoMath.validLatLng(lat, lng)) {
            return Optional.empty();
        }
        return Optional.of(new Coords(lat, lng, source));
    }

    private static boolean looksLikeUrl(String text) {
        String lower = text.toLowerCase(Locale.ROOT);
        return lower.startsWith("http://") || lower.startsWith("https://") || lower.contains("maps.");
    }

    private static String decode(String value) {
        try {
            return URLDecoder.decode(value, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ex) {
            return value;
        }
    }

    private static URI uriOf(String text) {
        try {
            URI uri = URI.create(text.contains("://") || text.startsWith("geo:") ? text : "https://" + text);
            return uri.getHost() == null ? null : uri;
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private static String queryOnly(String text) {
        int q = text.indexOf('?');
        return q >= 0 ? text.substring(q + 1) : null;
    }
}
