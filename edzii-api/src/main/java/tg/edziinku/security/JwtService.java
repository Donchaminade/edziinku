package tg.edziinku.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import tg.edziinku.config.AppProperties;
import tg.edziinku.domain.Role;
import tg.edziinku.web.ApiException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final AppProperties properties;
    private SecretKey key;

    public JwtService(AppProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void init() {
        String secret = properties.getJwt().getSecret();
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET doit contenir au moins 32 octets");
        }
        if (!properties.isDev() && secret.contains("dev-only")) {
            throw new IllegalStateException("JWT_SECRET de développement refusé quand APP_ENV=prod");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String issueAccess(UUID userId, Role role, String name) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(properties.getJwt().getAccessTtlSeconds());
        return Jwts.builder()
                .subject(userId.toString())
                .claim("role", role.name())
                .claim("name", name)
                .issuedAt(Date.from(now))
                .expiration(Date.from(exp))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        try {
            return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        } catch (RuntimeException ex) {
            throw new ApiException(401, "Session expirée ou jeton invalide");
        }
    }

    public long accessTtlSeconds() {
        return properties.getJwt().getAccessTtlSeconds();
    }
}
