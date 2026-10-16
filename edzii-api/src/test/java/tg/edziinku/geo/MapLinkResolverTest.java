package tg.edziinku.geo;

import org.junit.jupiter.api.Test;

import java.net.URI;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MapLinkResolverTest {

    @Test
    void allowlistCartes() {
        assertTrue(MapLinkResolver.allowed(URI.create("https://maps.app.goo.gl/abc")));
        assertTrue(MapLinkResolver.allowed(URI.create("https://www.google.com/maps/@6.1,1.2,17z")));
        assertTrue(MapLinkResolver.allowed(URI.create("https://maps.apple.com/?ll=6.1,1.2")));
        assertTrue(MapLinkResolver.allowed(URI.create("https://www.openstreetmap.org/#map=17/6.1/1.2")));
    }

    @Test
    void refuseHorsAllowlist() {
        assertFalse(MapLinkResolver.allowed(URI.create("https://evil.example/steal")));
        assertFalse(MapLinkResolver.allowed(URI.create("http://169.254.169.254/latest/meta-data")));
        assertFalse(MapLinkResolver.allowed(URI.create("https://google.com.evil.tld/maps")));
    }
}
