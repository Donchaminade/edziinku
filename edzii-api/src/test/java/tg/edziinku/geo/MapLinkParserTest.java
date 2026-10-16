package tg.edziinku.geo;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MapLinkParserTest {

    @Test
    void paireCollee() {
        MapLinkParser.Coords coords = MapLinkParser.parse("6.13280, 1.23420").orElseThrow();
        assertEquals(6.13280, coords.latitude(), 1e-6);
        assertEquals(1.23420, coords.longitude(), 1e-6);
        assertEquals("pair", coords.source());
    }

    @Test
    void geoUri() {
        MapLinkParser.Coords coords = MapLinkParser.parse("geo:6.136,-1.22?z=18").orElseThrow();
        assertEquals(6.136, coords.latitude(), 1e-6);
        assertEquals(-1.22, coords.longitude(), 1e-6);
    }

    @Test
    void googleAt() {
        MapLinkParser.Coords coords = MapLinkParser.parse(
                "https://www.google.com/maps/place/Lom%C3%A9/@6.1360,1.2290,17z").orElseThrow();
        assertEquals(6.1360, coords.latitude(), 1e-5);
        assertEquals(1.2290, coords.longitude(), 1e-5);
    }

    @Test
    void googleQuery() {
        MapLinkParser.Coords coords = MapLinkParser.parse(
                "https://www.google.com/maps/search/?api=1&query=6.13,1.23").orElseThrow();
        assertEquals(6.13, coords.latitude(), 1e-6);
        assertEquals(1.23, coords.longitude(), 1e-6);
    }

    @Test
    void googleLl() {
        MapLinkParser.Coords coords = MapLinkParser.parse(
                "https://maps.google.com/?ll=6.1315,1.2320").orElseThrow();
        assertEquals(6.1315, coords.latitude(), 1e-6);
        assertEquals(1.2320, coords.longitude(), 1e-6);
    }

    @Test
    void appleMaps() {
        MapLinkParser.Coords coords = MapLinkParser.parse(
                "https://maps.apple.com/?ll=6.1328,1.2342&z=16").orElseThrow();
        assertEquals(6.1328, coords.latitude(), 1e-6);
        assertEquals(1.2342, coords.longitude(), 1e-6);
    }

    @Test
    void openStreetMapHash() {
        MapLinkParser.Coords coords = MapLinkParser.parse(
                "https://www.openstreetmap.org/#map=17/6.1328/1.2342").orElseThrow();
        assertEquals(6.1328, coords.latitude(), 1e-6);
        assertEquals(1.2342, coords.longitude(), 1e-6);
    }

    @Test
    void osmMlat() {
        MapLinkParser.Coords coords = MapLinkParser.parse(
                "https://www.openstreetmap.org/?mlat=6.136&mlon=1.229#map=16/6.136/1.229").orElseThrow();
        assertEquals(6.136, coords.latitude(), 1e-6);
        assertEquals(1.229, coords.longitude(), 1e-6);
    }

    @Test
    void shortlinkNonResoluCoteParseur() {
        assertTrue(MapLinkParser.parse("https://maps.app.goo.gl/abc123").isEmpty());
        assertTrue(MapLinkParser.looksLikeUnresolvedShortlink("https://maps.app.goo.gl/abc123"));
    }

    @Test
    void refuseHorsBornes() {
        assertTrue(MapLinkParser.parse("91.0, 1.2").isEmpty());
        assertTrue(MapLinkParser.parse("0,0").isEmpty());
    }
}
