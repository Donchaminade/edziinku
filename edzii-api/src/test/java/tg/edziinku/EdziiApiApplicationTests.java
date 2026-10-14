package tg.edziinku;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import tg.edziinku.geo.GeoRepository;
import tg.edziinku.repo.UserRepository;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class EdziiApiApplicationTests {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository users;

    @Autowired
    private GeoRepository geo;

    @Test
    void leMotDePasseDeDemonstrationCorrespond() {
        var afi = users.findByEmailIgnoreCase("afi@edzii.local").orElseThrow();
        assertTrue(passwordEncoder.matches("Demo-Edzii-2026", afi.getPasswordHash()));
    }

    @Test
    void postgisRattacheBeAuPointDuQuartier() {
        assertTrue(geo.neighborhoodContaining(6.1315, 1.2320).isPresent());
        assertFalse(geo.neighborhoodContaining(0, 0).isPresent());
    }
}
