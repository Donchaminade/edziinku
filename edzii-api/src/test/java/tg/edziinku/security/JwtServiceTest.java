package tg.edziinku.security;

import org.junit.jupiter.api.Test;
import tg.edziinku.config.AppProperties;
import tg.edziinku.domain.Role;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class JwtServiceTest {

    @Test
    void leJetonContientLeSujetEtLeRole() {
        AppProperties properties = new AppProperties();
        properties.getJwt().setSecret("0123456789abcdef0123456789abcdef");
        properties.setEnv("dev");
        JwtService jwt = new JwtService(properties);
        jwt.init();
        UUID id = UUID.randomUUID();
        String token = jwt.issueAccess(id, Role.MAIRIE, "Mairie");
        var claims = jwt.parse(token);
        assertEquals(id.toString(), claims.getSubject());
        assertEquals("MAIRIE", claims.get("role"));
    }
}
