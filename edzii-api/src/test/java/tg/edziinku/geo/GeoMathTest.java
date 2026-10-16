package tg.edziinku.geo;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GeoMathTest {

    @Test
    void distanceNulleSurLeMemePoint() {
        assertEquals(0, GeoMath.haversineMeters(6.136, 1.229, 6.136, 1.229), 0.01);
    }

    @Test
    void beEtBekpotaAMoinsDunKilometre() {
        double meters = GeoMath.haversineMeters(6.1315, 1.2320, 6.1360, 1.2290);
        assertTrue(meters > 400 && meters < 900, "distance=" + meters);
    }

    @Test
    void coordonneesInvalides() {
        assertFalse(GeoMath.validLatLng(null, 1.2));
        assertFalse(GeoMath.validLatLng(91.0, 1.2));
        assertFalse(GeoMath.validLatLng(0.0, 0.0));
        assertTrue(GeoMath.validLatLng(6.13, 1.22));
    }
}
