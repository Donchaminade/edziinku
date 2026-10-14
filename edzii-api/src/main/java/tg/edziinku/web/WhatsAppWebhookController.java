package tg.edziinku.web;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tg.edziinku.config.AppProperties;
import tg.edziinku.service.WhatsAppBotService;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/whatsapp/webhook")
public class WhatsAppWebhookController {

    private final AppProperties properties;
    private final WhatsAppBotService bot;

    public WhatsAppWebhookController(AppProperties properties, WhatsAppBotService bot) {
        this.properties = properties;
        this.bot = bot;
    }

    @GetMapping(produces = MediaType.TEXT_PLAIN_VALUE)
    ResponseEntity<String> verify(
            @RequestParam(name = "hub.mode", required = false) String mode,
            @RequestParam(name = "hub.verify_token", required = false) String token,
            @RequestParam(name = "hub.challenge", required = false) String challenge
    ) {
        if ("subscribe".equals(mode) && properties.getWhatsapp().getVerifyToken().equals(token) && challenge != null) {
            return ResponseEntity.ok(challenge);
        }
        return ResponseEntity.status(403).body("Jeton de vérification refusé");
    }

    @PostMapping
    ResponseEntity<Void> receive(HttpServletRequest request) throws IOException {
        String body = new String(request.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        bot.verifySignature(body, request.getHeader("X-Hub-Signature-256"));
        if (!body.isBlank()) {
            bot.handlePayload(body);
        }
        return ResponseEntity.ok().build();
    }
}
