package tg.edziinku.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.cors.CorsConfiguration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class CorsConfigurationTest {

    private static final String FRONTEND = "https://edziinku.vercel.app,https://*.vercel.app";

    @Test
    void enProductionUnMotifVercelAutoriseLaPreview() {
        CorsConfiguration cors = SecurityConfig.corsConfiguration(false, FRONTEND);
        String preview = "https://edziinku-git-feature-equipe.vercel.app";
        assertEquals(preview, cors.checkOrigin(preview));
        assertEquals("https://edziinku.vercel.app", cors.checkOrigin("https://edziinku.vercel.app"));
    }

    @Test
    void enProductionUneOrigineEtrangereEstRefusee() {
        CorsConfiguration cors = SecurityConfig.corsConfiguration(false, FRONTEND);
        assertNull(cors.checkOrigin("https://example.com"));
        assertNull(cors.checkOrigin("https://evilvercel.app"));
        assertNull(cors.checkOrigin("http://localhost:5173"));
    }

    @Test
    void enDevLocalhostResteAutorise() {
        CorsConfiguration cors = SecurityConfig.corsConfiguration(true, "https://edziinku.vercel.app");
        assertEquals("http://localhost:4173", cors.checkOrigin("http://localhost:4173"));
        assertEquals("http://127.0.0.1:8080", cors.checkOrigin("http://127.0.0.1:8080"));
    }
}
