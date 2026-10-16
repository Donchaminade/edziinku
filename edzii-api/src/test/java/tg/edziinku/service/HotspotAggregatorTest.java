package tg.edziinku.service;

import org.junit.jupiter.api.Test;
import tg.edziinku.domain.Neighborhood;
import tg.edziinku.domain.Report;
import tg.edziinku.domain.ReportChannel;
import tg.edziinku.domain.ReportStatus;
import tg.edziinku.domain.RiskLevel;
import tg.edziinku.domain.UrgencyLevel;
import tg.edziinku.domain.WaterLevel;
import tg.edziinku.dto.Dtos;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HotspotAggregatorTest {

    @Test
    void videSiAucunSignalement() {
        Dtos.HotspotResponse empty = HotspotAggregator.aggregate(List.of(), 7, 3);
        assertEquals(7, empty.days());
        assertTrue(empty.zones().isEmpty());
    }

    @Test
    void top3ParQuartierCanoniqueEtCentroide() {
        Neighborhood be = neighborhood("be", "Bè", 6.13, 1.24);
        Neighborhood agoe = neighborhood("agoe-nyive", "Agoè-Nyivé", 6.22, 1.18);
        Neighborhood tokoin = neighborhood("tokoin", "Tokoin", 6.15, 1.21);
        Neighborhood adakpame = neighborhood("adakpame", "Adakpamé", 6.14, 1.21);

        Instant now = Instant.parse("2026-10-16T12:00:00Z");
        List<Report> reports = List.of(
                report(be, 6.131, 1.241, "a.jpg", now.minusSeconds(10)),
                report(be, 6.132, 1.242, null, now.minusSeconds(20)),
                report(be, 6.133, 1.243, "c.jpg", now.minusSeconds(30)),
                report(agoe, 6.226, 1.181, "d.jpg", now.minusSeconds(40)),
                report(agoe, 6.227, 1.182, null, now.minusSeconds(50)),
                report(tokoin, 6.155, 1.208, null, now.minusSeconds(60)),
                report(adakpame, 6.148, 1.218, "g.jpg", now.minusSeconds(70))
        );

        Dtos.HotspotResponse response = HotspotAggregator.aggregate(reports, 7, 3);
        assertEquals(7, response.days());
        assertEquals(3, response.zones().size());
        assertEquals("be", response.zones().get(0).id());
        assertEquals("Bè", response.zones().get(0).label());
        assertEquals(3, response.zones().get(0).count());
        assertEquals(6.132, response.zones().get(0).lat(), 0.0001);
        assertEquals(1.242, response.zones().get(0).lng(), 0.0001);
        assertEquals(2, response.zones().get(0).reports().size());
        assertEquals("/api/media/a.jpg", response.zones().get(0).reports().get(0).photoUrl());
        assertEquals("agoe-nyive", response.zones().get(1).id());
        assertEquals(2, response.zones().get(1).count());
        assertEquals("adakpame", response.zones().get(2).id());
        assertEquals(1, response.zones().get(2).count());
    }

    @Test
    void groupeLesLibellesNettoyesSansQuartier() {
        Instant now = Instant.parse("2026-10-16T12:00:00Z");
        List<Report> reports = List.of(
                report(null, 6.13, 1.24, "x.jpg", now, "Bè"),
                report(null, 6.14, 1.25, null, now.minusSeconds(5), "Be"),
                report(null, 6.15, 1.26, null, now.minusSeconds(10), "  be  ")
        );
        Dtos.HotspotResponse response = HotspotAggregator.aggregate(reports, 7, 3);
        assertEquals(1, response.zones().size());
        assertEquals("be", response.zones().get(0).id());
        assertEquals(3, response.zones().get(0).count());
        assertEquals(1, response.zones().get(0).reports().size());
        assertEquals("/api/media/x.jpg", response.zones().get(0).reports().get(0).photoUrl());
    }

    @Test
    void trieParUrgencePuisVolumeEtGardeLesUrgentsSansSignalement() {
        Neighborhood critique = neighborhood("be", "Bè", 6.13, 1.24);
        critique.setUrgencyLevel(urgency(1, "Critique", "#D21034"));
        Neighborhood eleve = neighborhood("baguida", "Baguida", 6.16, 1.32);
        eleve.setUrgencyLevel(urgency(2, "Élevé", "#C8891A"));
        Neighborhood calme = neighborhood("tokoin", "Tokoin", 6.15, 1.21);
        calme.setUrgencyLevel(urgency(4, "Calme", "#059669"));
        Instant now = Instant.parse("2026-10-16T12:00:00Z");
        List<Report> reports = List.of(
                report(calme, 6.15, 1.21, null, now),
                report(calme, 6.15, 1.21, null, now.minusSeconds(5)),
                report(calme, 6.15, 1.21, null, now.minusSeconds(10))
        );
        Dtos.HotspotResponse response = HotspotAggregator.aggregate(
                reports,
                List.of(critique, eleve, calme),
                7,
                200
        );
        assertEquals(3, response.zones().size());
        assertEquals("be", response.zones().get(0).id());
        assertEquals(0, response.zones().get(0).count());
        assertEquals("Critique", response.zones().get(0).urgencyLabel());
        assertEquals("baguida", response.zones().get(1).id());
        assertEquals("tokoin", response.zones().get(2).id());
        assertEquals(3, response.zones().get(2).count());
    }

    @Test
    void listeLesPlusRecentsSiAucunePhoto() {
        Neighborhood be = neighborhood("be", "Bè", 6.13, 1.24);
        Instant now = Instant.parse("2026-10-16T12:00:00Z");
        Report recent = report(be, 6.13, 1.24, null, now);
        Report older = report(be, 6.14, 1.25, "   ", now.minusSeconds(30));
        Dtos.HotspotResponse response = HotspotAggregator.aggregate(List.of(older, recent), 7, 3);
        assertEquals(2, response.zones().get(0).reports().size());
        assertEquals(recent.getId(), response.zones().get(0).reports().get(0).id());
        assertNull(response.zones().get(0).reports().get(0).photoUrl());
    }

    private UrgencyLevel urgency(int rank, String label, String color) {
        UrgencyLevel level = new UrgencyLevel();
        level.setId(UUID.nameUUIDFromBytes(label.getBytes()));
        level.setSlug(label.toLowerCase());
        level.setLabel(label);
        level.setColor(color);
        level.setRank(rank);
        level.setActive(true);
        return level;
    }

    private Neighborhood neighborhood(String slug, String name, double lat, double lng) {
        Neighborhood neighborhood = new Neighborhood();
        neighborhood.setId(UUID.nameUUIDFromBytes(slug.getBytes()));
        neighborhood.setSlug(slug);
        neighborhood.setName(name);
        neighborhood.setCommune("Golfe");
        neighborhood.setRiskLevel(RiskLevel.ELEVE);
        neighborhood.setLatitude(lat);
        neighborhood.setLongitude(lng);
        return neighborhood;
    }

    private Report report(Neighborhood neighborhood, double lat, double lng, String photo, Instant createdAt) {
        return report(neighborhood, lat, lng, photo, createdAt, "Lieu");
    }

    private Report report(Neighborhood neighborhood, double lat, double lng, String photo, Instant createdAt, String place) {
        Report report = new Report();
        report.setId(UUID.randomUUID());
        report.setReference("EN-0001");
        report.setNeighborhood(neighborhood);
        report.setPlaceLabel(place);
        report.setLatitude(lat);
        report.setLongitude(lng);
        report.setWaterLevel(WaterLevel.GENOU);
        report.setStatus(ReportStatus.VALIDE);
        report.setChannel(ReportChannel.WEB);
        report.setPhotoFilename(photo);
        report.setCreatedAt(createdAt);
        return report;
    }
}
