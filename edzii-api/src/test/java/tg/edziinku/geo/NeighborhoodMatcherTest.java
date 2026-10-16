package tg.edziinku.geo;

import org.junit.jupiter.api.Test;
import tg.edziinku.domain.City;
import tg.edziinku.domain.Neighborhood;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class NeighborhoodMatcherTest {

    private final City lome = city("Lomé");
    private final Neighborhood be = hood("be", "Bè", 6.1315, 1.2320, lome);
    private final Neighborhood kpota = hood("be-kpota", "Bè-Kpota", 6.1360, 1.2290, lome);
    private final Neighborhood ahligo = hood("be-ahligo", "Bè-Ahligo", 6.1328, 1.2342, lome);
    private final Neighborhood klikame = hood("be-klikame", "Bè-Klikamé", 6.1280, 1.2380, lome);
    private final Neighborhood adidogome = hood("adidogome", "Adidogomé", 6.1950, 1.1550, lome);
    private final List<Neighborhood> all = List.of(be, kpota, ahligo, klikame, adidogome);

    @Test
    void rattacheLePointAuQuartierLePlusProche() {
        NeighborhoodMatcher.Match match = NeighborhoodMatcher.nearest(all, 6.1361, 1.2288).orElseThrow();
        assertEquals("be-kpota", match.neighborhood().getSlug());
        assertTrue(match.meters() < 80);
    }

    @Test
    void horsZoneAuDelaDe3km() {
        assertTrue(NeighborhoodMatcher.nearest(all, 6.50, 1.80).isEmpty());
    }

    @Test
    void voisinagesDeBekpotaIncluentBeEtAhligoPasAdidogome() {
        List<Neighborhood> neighbors = NeighborhoodMatcher.neighbors(kpota, all);
        Set<String> slugs = neighbors.stream().map(Neighborhood::getSlug).collect(Collectors.toSet());
        assertTrue(slugs.contains("be"));
        assertTrue(slugs.contains("be-ahligo"));
        assertTrue(slugs.contains("be-klikame"));
        assertTrue(!slugs.contains("adidogome"));
        assertTrue(!slugs.contains("be-kpota"));
    }

    @Test
    void villeCibleeAlerteTousSesQuartiersPlusVoisinages() {
        List<Neighborhood> reached = NeighborhoodMatcher.sectorAndNeighbors(null, lome.getId(), all);
        Set<String> slugs = reached.stream().map(Neighborhood::getSlug).collect(Collectors.toSet());
        assertEquals(Set.of("be", "be-kpota", "be-ahligo", "be-klikame", "adidogome"), slugs);
    }

    @Test
    void quartierCibleAlerteLeSecteurEtLesVoisinages() {
        List<Neighborhood> reached = NeighborhoodMatcher.sectorAndNeighbors(kpota, null, all);
        Set<String> slugs = reached.stream().map(Neighborhood::getSlug).collect(Collectors.toSet());
        assertTrue(slugs.contains("be-kpota"));
        assertTrue(slugs.contains("be"));
        assertTrue(slugs.contains("be-ahligo"));
        assertTrue(!slugs.contains("adidogome"));
    }

    private static City city(String name) {
        City city = new City();
        city.setId(UUID.fromString("12121212-0000-4000-8000-000000000001"));
        city.setSlug("lome");
        city.setName(name);
        return city;
    }

    private static Neighborhood hood(String slug, String name, double lat, double lng, City city) {
        Neighborhood neighborhood = new Neighborhood();
        neighborhood.setId(UUID.randomUUID());
        neighborhood.setSlug(slug);
        neighborhood.setName(name);
        neighborhood.setCommune("Golfe 1");
        neighborhood.setLatitude(lat);
        neighborhood.setLongitude(lng);
        neighborhood.setActive(true);
        neighborhood.setCity(city);
        return neighborhood;
    }
}
