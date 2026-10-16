package tg.edziinku.service;

import org.junit.jupiter.api.Test;
import tg.edziinku.domain.Neighborhood;
import tg.edziinku.domain.RiskLevel;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class NeighborhoodMatcherTest {

    @Test
    void rattacheBeEtBè() {
        Neighborhood be = hood("be", "Bè", "Be,Bé,Bè Ahligo");
        Neighborhood agoe = hood("agoe-nyive", "Agoè-Nyivé", "Agoe");
        List<Neighborhood> catalog = List.of(be, agoe);
        assertEquals(be.getId(), NeighborhoodMatcher.match("Be", catalog).orElseThrow().getId());
        assertEquals(be.getId(), NeighborhoodMatcher.match("Bè Ahligo, près du marché", catalog).orElseThrow().getId());
        assertEquals(agoe.getId(), NeighborhoodMatcher.match("Agoè-Nyivé", catalog).orElseThrow().getId());
        assertTrue(NeighborhoodMatcher.match("Quartier inconnu de nulle part", catalog).isEmpty());
    }

    @Test
    void ignoreLeQuartierNonLocalise() {
        Neighborhood ghost = hood(Neighborhood.UNLOCATED_SLUG, "Non localisé", "");
        ghost.setActive(true);
        assertTrue(NeighborhoodMatcher.match("Non localisé", List.of(ghost)).isEmpty());
        assertEquals(ghost.getId(), NeighborhoodMatcher.unlocated(List.of(ghost)).orElseThrow().getId());
    }

    private Neighborhood hood(String slug, String name, String aliases) {
        Neighborhood neighborhood = new Neighborhood();
        neighborhood.setId(UUID.nameUUIDFromBytes(slug.getBytes()));
        neighborhood.setSlug(slug);
        neighborhood.setName(name);
        neighborhood.setCommune("Golfe");
        neighborhood.setAliases(aliases);
        neighborhood.setActive(true);
        neighborhood.setRiskLevel(RiskLevel.ELEVE);
        neighborhood.setLatitude(6.13);
        neighborhood.setLongitude(1.22);
        return neighborhood;
    }
}
