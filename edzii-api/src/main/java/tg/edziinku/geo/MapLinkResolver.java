package tg.edziinku.geo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

/**
 * Suit les redirections des shortlinks cartes, uniquement vers une allowlist
 * (pas de SSRF ouvert). N’ouvre jamais un hôte hors cartes.
 */
@Component
public class MapLinkResolver {

    private static final Logger log = LoggerFactory.getLogger(MapLinkResolver.class);

    static final Set<String> ALLOWED_HOSTS = Set.of(
            "maps.app.goo.gl",
            "goo.gl",
            "www.google.com",
            "google.com",
            "maps.google.com",
            "www.maps.google.com",
            "maps.apple.com",
            "www.openstreetmap.org",
            "openstreetmap.org"
    );

    private static final int MAX_HOPS = 5;

    private final HttpClient http = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NEVER)
            .connectTimeout(Duration.ofSeconds(4))
            .build();

    public Optional<MapLinkParser.Coords> resolve(String raw) {
        Optional<MapLinkParser.Coords> direct = MapLinkParser.parse(raw);
        if (direct.isPresent()) {
            return direct;
        }
        URI uri = startUri(raw);
        if (uri == null) {
            return Optional.empty();
        }
        URI current = uri;
        for (int hop = 0; hop < MAX_HOPS; hop++) {
            if (!allowed(current)) {
                log.info("Lien cartes refusé (hôte hors allowlist) : {}", current.getHost());
                return Optional.empty();
            }
            Optional<MapLinkParser.Coords> parsed = MapLinkParser.parse(current.toString());
            if (parsed.isPresent()) {
                return parsed;
            }
            Optional<URI> next = headLocation(current);
            if (next.isEmpty()) {
                return Optional.empty();
            }
            current = next.get();
        }
        return MapLinkParser.parse(current.toString());
    }

    static boolean allowed(URI uri) {
        if (uri == null || uri.getHost() == null) {
            return false;
        }
        String host = uri.getHost().toLowerCase(Locale.ROOT);
        if (host.endsWith(".")) {
            host = host.substring(0, host.length() - 1);
        }
        return ALLOWED_HOSTS.contains(host);
    }

    private Optional<URI> headLocation(URI uri) {
        try {
            HttpRequest request = HttpRequest.newBuilder(uri)
                    .timeout(Duration.ofSeconds(5))
                    .method("HEAD", HttpRequest.BodyPublishers.noBody())
                    .header("User-Agent", "Edzii-Nku/1.0")
                    .build();
            HttpResponse<Void> response = http.send(request, HttpResponse.BodyHandlers.discarding());
            Optional<String> location = response.headers().firstValue("location");
            if (location.isEmpty()) {
                return Optional.empty();
            }
            URI next = uri.resolve(location.get());
            return Optional.of(next);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            return Optional.empty();
        } catch (Exception ex) {
            log.info("Résolution de lien cartes impossible : {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private static URI startUri(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String text = raw.trim();
        try {
            URI uri = URI.create(text.contains("://") ? text : "https://" + text);
            if (uri.getHost() == null || !allowed(uri)) {
                return null;
            }
            return uri;
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
