package tg.edziinku.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import tg.edziinku.config.AppProperties;
import tg.edziinku.web.ApiException;

import java.time.Duration;

/**
 * Point d’extension Google. Le flux authorization code (bouton « Continuer avec Google »)
 * pourra appeler ce vérificateur avec l’ID token obtenu côté client, sans changer le schéma :
 * la colonne users.google_sub est déjà prévue.
 */
@Service
public class GoogleIdentityService {

    private final AppProperties properties;
    private final RestClient http;

    public GoogleIdentityService(AppProperties properties) {
        this.properties = properties;
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(4));
        factory.setReadTimeout(Duration.ofSeconds(6));
        this.http = RestClient.builder().requestFactory(factory).build();
    }

    public Profile verify(String idToken) {
        String url = UriComponentsBuilder
                .fromUriString("https://oauth2.googleapis.com/tokeninfo")
                .queryParam("id_token", idToken)
                .build()
                .encode()
                .toUriString();
        JsonNode body;
        try {
            body = http.get().uri(url).retrieve().body(JsonNode.class);
        } catch (RuntimeException ex) {
            throw new ApiException(401, "Jeton Google refusé");
        }
        if (body == null || !properties.getGoogle().getClientId().equals(body.path("aud").asText())) {
            throw new ApiException(401, "Jeton Google refusé");
        }
        if (!"true".equals(body.path("email_verified").asText())) {
            throw new ApiException(401, "L’e-mail Google n’est pas vérifié");
        }
        String email = body.path("email").asText(null);
        return new Profile(body.path("sub").asText(), email == null ? null : email.toLowerCase(), body.path("name").asText(null));
    }

    public record Profile(String sub, String email, String name) {
    }
}
