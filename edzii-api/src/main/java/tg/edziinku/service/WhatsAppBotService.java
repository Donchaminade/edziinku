package tg.edziinku.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import tg.edziinku.config.AppProperties;
import tg.edziinku.domain.Alert;
import tg.edziinku.domain.BotState;
import tg.edziinku.domain.Neighborhood;
import tg.edziinku.domain.OutboundMessage;
import tg.edziinku.domain.OutboundStatus;
import tg.edziinku.domain.ReportChannel;
import tg.edziinku.domain.WhatsAppContact;
import tg.edziinku.dto.Dtos;
import tg.edziinku.geo.GeoRepository;
import tg.edziinku.geo.NeighborhoodMatcher;
import tg.edziinku.repo.AlertRepository;
import tg.edziinku.repo.NeighborhoodRepository;
import tg.edziinku.repo.OutboundMessageRepository;
import tg.edziinku.repo.WhatsAppContactRepository;
import tg.edziinku.web.ApiException;
import tg.edziinku.whatsapp.BotEngine;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class WhatsAppBotService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppBotService.class);

    private final AppProperties properties;
    private final ObjectMapper objectMapper;
    private final WhatsAppContactRepository contacts;
    private final NeighborhoodRepository neighborhoods;
    private final OutboundMessageRepository outbound;
    private final AlertRepository alerts;
    private final GeoRepository geo;
    private final ReportService reports;
    private final MediaStorage media;
    private final ViewMapper mapper;
    private final RestClient http;

    public WhatsAppBotService(
            AppProperties properties,
            ObjectMapper objectMapper,
            WhatsAppContactRepository contacts,
            NeighborhoodRepository neighborhoods,
            OutboundMessageRepository outbound,
            AlertRepository alerts,
            GeoRepository geo,
            ReportService reports,
            MediaStorage media,
            ViewMapper mapper
    ) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.contacts = contacts;
        this.neighborhoods = neighborhoods;
        this.outbound = outbound;
        this.alerts = alerts;
        this.geo = geo;
        this.reports = reports;
        this.media = media;
        this.mapper = mapper;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(4));
        factory.setReadTimeout(Duration.ofSeconds(8));
        this.http = RestClient.builder().requestFactory(factory).build();
    }

    public void verifySignature(String body, String header) {
        String secret = properties.getWhatsapp().getAppSecret();
        if (secret == null || secret.isBlank()) {
            if (!properties.isDev()) {
                throw new ApiException(401, "WHATSAPP_APP_SECRET est obligatoire en production");
            }
            return;
        }
        if (header == null || !header.startsWith("sha256=")) {
            throw new ApiException(401, "Signature WhatsApp manquante");
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String expected = "sha256=" + HexFormat.of().formatHex(mac.doFinal(body.getBytes(StandardCharsets.UTF_8)));
            if (!MessageDigestEquals(expected, header.trim())) {
                throw new ApiException(401, "Signature WhatsApp invalide");
            }
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(401, "Signature WhatsApp invalide");
        }
    }

    @Transactional
    public void handlePayload(String raw) {
        JsonNode root;
        try {
            root = objectMapper.readTree(raw);
        } catch (Exception ex) {
            throw new ApiException(400, "Corps WhatsApp illisible");
        }
        for (Incoming incoming : parse(root)) {
            handleOne(incoming);
        }
    }

    @Transactional
    public void broadcast(UUID alertId) {
        Alert alert = alerts.findById(alertId).orElse(null);
        if (alert == null) {
            return;
        }
        List<WhatsAppContact> targets;
        if (alert.getNeighborhood() == null && alert.getCity() == null) {
            targets = contacts.findAll().stream().filter(WhatsAppContact::isActive).toList();
        } else {
            List<UUID> reached = NeighborhoodMatcher.sectorAndNeighbors(
                            alert.getNeighborhood(),
                            alert.getCity() == null ? null : alert.getCity().getId(),
                            neighborhoods.findPublicCatalog()
                    ).stream().map(Neighborhood::getId).toList();
            targets = reached.isEmpty()
                    ? List.of()
                    : contacts.findByActiveTrueAndNeighborhood_IdIn(reached);
        }
        String place = alert.getNeighborhood() != null
                ? alert.getNeighborhood().getName()
                : alert.getCity() != null ? alert.getCity().getName() : "Grand Lomé";
        String source = alert.getSource() == null || alert.getSource().isBlank() ? "Edzii-Nku" : alert.getSource();
        boolean hasEwe = alert.getBodyEwe() != null && !alert.getBodyEwe().isBlank();
        for (WhatsAppContact contact : targets) {
            boolean ewe = "ewe".equals(contact.getLanguage());
            boolean both = "both".equals(contact.getLanguage()) || contact.getLanguage() == null;
            if (ewe || both) {
                if (hasEwe) {
                    log.info("Texte éwé diffusé, à relire par un locuteur natif (alerte {})", alert.getId());
                    deliver(contact.getWaId(), BotEngine.bulletin(true, alert.getTitle(), place, alert.getBodyEwe(), source));
                } else if (ewe) {
                    deliver(contact.getWaId(), BotEngine.bulletin(false, alert.getTitle(), place, alert.getBody(), source));
                }
            }
            if (!ewe || both) {
                deliver(contact.getWaId(), BotEngine.bulletin(false, alert.getTitle(), place, alert.getBody(), source));
            }
        }
    }

    @Transactional(readOnly = true)
    public List<Dtos.OutboundCard> outbox() {
        return outbound.findTop50ByOrderByCreatedAtDesc().stream().map(mapper::outbound).toList();
    }

    private void handleOne(Incoming incoming) {
        WhatsAppContact contact = contacts.findByWaId(incoming.from()).orElseGet(() -> {
            WhatsAppContact created = new WhatsAppContact();
            created.setWaId(incoming.from());
            created.setState(BotState.NEW);
            created.setActive(false);
            return contacts.save(created);
        });
        if (incoming.name() != null && !incoming.name().isBlank()) {
            contact.setDisplayName(incoming.name());
        }
        BotEngine.Hood resolved = null;
        if (incoming.latitude() != null && incoming.longitude() != null) {
            resolved = geo.neighborhoodContaining(incoming.latitude(), incoming.longitude())
                    .flatMap(neighborhoods::findById)
                    .map(this::hood)
                    .orElse(null);
        }
        BotEngine.Conversation conv = toConv(contact);
        String photo = null;
        if (incoming.imageId() != null) {
            photo = downloadImage(incoming.imageId());
        }
        BotEngine.Outcome outcome = BotEngine.handle(
                conv,
                new BotEngine.Inbound(incoming.text(), incoming.buttonId(), incoming.imageId() != null || photo != null,
                        incoming.latitude(), incoming.longitude(), incoming.locationName(), resolved),
                neighborhoods.findAll().stream().map(this::hood).toList(),
                properties.getPublicWebUrl() + "/carte"
        );
        apply(contact, conv);
        String reference = null;
        if (outcome.report() != null) {
            Double lat = outcome.report().latitude();
            Double lng = outcome.report().longitude();
            if (lat == null || lng == null) {
                Neighborhood hood = contact.getNeighborhood();
                lat = hood == null ? properties.getWeather().getLatitude() : hood.getLatitude();
                lng = hood == null ? properties.getWeather().getLongitude() : hood.getLongitude();
            }
            Dtos.ReportCard card = reports.create(new Dtos.ReportRequest(
                    contact.getNeighborhood() == null ? null : contact.getNeighborhood().getId(),
                    outcome.report().place() == null ? "Lomé" : outcome.report().place(),
                    lat,
                    lng,
                    null,
                    outcome.report().level().name(),
                    incoming.caption(),
                    ReportChannel.WHATSAPP.name(),
                    List.of()
            ), null, photo);
            reference = card.reference();
        }
        List<BotEngine.Out> messages = new ArrayList<>(outcome.messages());
        if (reference != null && !messages.isEmpty()) {
            BotEngine.Out last = messages.get(messages.size() - 1);
            messages.set(messages.size() - 1, new BotEngine.Out(
                    BotEngine.confirmationWithReference(reference, outcome.report().place(), outcome.report().level()),
                    last.buttons()
            ));
        }
        for (BotEngine.Out message : messages) {
            deliver(contact.getWaId(), message);
        }
    }

    private void deliver(String to, BotEngine.Out message) {
        OutboundMessage row = new OutboundMessage();
        row.setChannel("WHATSAPP");
        row.setRecipient(to);
        row.setBody(message.body());
        if (!properties.getWhatsapp().isConfigured()) {
            row.setStatus(OutboundStatus.SKIPPED);
            outbound.save(row);
            log.info("WhatsApp non configuré, message conservé pour {}", to);
            return;
        }
        try {
            String version = properties.getWhatsapp().getGraphVersion();
            String phoneId = properties.getWhatsapp().getPhoneNumberId();
            Object payload = message.buttons().isEmpty() ? textPayload(to, message.body()) : buttonPayload(to, message);
            http.post()
                    .uri("https://graph.facebook.com/" + version + "/" + phoneId + "/messages")
                    .header("Authorization", "Bearer " + properties.getWhatsapp().getToken())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
            row.setStatus(OutboundStatus.SENT);
        } catch (RuntimeException ex) {
            log.warn("Envoi WhatsApp impossible : {}", ex.getClass().getSimpleName());
            row.setStatus(OutboundStatus.FAILED);
        }
        outbound.save(row);
    }

    private Map<String, Object> textPayload(String to, String body) {
        return Map.of(
                "messaging_product", "whatsapp",
                "to", to,
                "type", "text",
                "text", Map.of("body", body)
        );
    }

    private Map<String, Object> buttonPayload(String to, BotEngine.Out message) {
        List<Map<String, Object>> buttons = message.buttons().stream().limit(3).map(button -> Map.<String, Object>of(
                "type", "reply",
                "reply", Map.of("id", button.id(), "title", trimTitle(button.title()))
        )).toList();
        return Map.of(
                "messaging_product", "whatsapp",
                "to", to,
                "type", "interactive",
                "interactive", Map.of(
                        "type", "button",
                        "body", Map.of("text", trimBody(message.body())),
                        "action", Map.of("buttons", buttons)
                )
        );
    }

    private String downloadImage(String mediaId) {
        if (!properties.getWhatsapp().isConfigured()) {
            return null;
        }
        try {
            String version = properties.getWhatsapp().getGraphVersion();
            JsonNode meta = http.get()
                    .uri("https://graph.facebook.com/" + version + "/" + mediaId)
                    .header("Authorization", "Bearer " + properties.getWhatsapp().getToken())
                    .retrieve()
                    .body(JsonNode.class);
            if (meta == null || !meta.has("url")) {
                return null;
            }
            byte[] bytes = http.get()
                    .uri(meta.path("url").asText())
                    .header("Authorization", "Bearer " + properties.getWhatsapp().getToken())
                    .retrieve()
                    .body(byte[].class);
            return bytes == null ? null : media.store(bytes);
        } catch (RuntimeException ex) {
            log.warn("Photo WhatsApp non téléchargée");
            return null;
        }
    }

    private List<Incoming> parse(JsonNode root) {
        List<Incoming> list = new ArrayList<>();
        for (JsonNode entry : root.path("entry")) {
            for (JsonNode change : entry.path("changes")) {
                JsonNode value = change.path("value");
                String name = null;
                if (value.path("contacts").isArray() && !value.path("contacts").isEmpty()) {
                    name = value.path("contacts").get(0).path("profile").path("name").asText(null);
                }
                for (JsonNode message : value.path("messages")) {
                    String type = message.path("type").asText("");
                    String text = null;
                    String button = null;
                    String imageId = null;
                    String caption = null;
                    Double lat = null;
                    Double lng = null;
                    String locationName = null;
                    if ("text".equals(type)) {
                        text = message.path("text").path("body").asText(null);
                    } else if ("interactive".equals(type)) {
                        JsonNode reply = message.path("interactive").path("button_reply");
                        button = reply.path("id").asText(null);
                        text = reply.path("title").asText(null);
                    } else if ("image".equals(type)) {
                        imageId = message.path("image").path("id").asText(null);
                        caption = message.path("image").path("caption").asText(null);
                        text = caption;
                    } else if ("location".equals(type)) {
                        lat = message.path("location").path("latitude").asDouble();
                        lng = message.path("location").path("longitude").asDouble();
                        locationName = message.path("location").path("name").asText(null);
                        text = locationName;
                    } else {
                        continue;
                    }
                    list.add(new Incoming(message.path("from").asText(), name, text, button, imageId, caption, lat, lng, locationName));
                }
            }
        }
        return list;
    }

    private BotEngine.Conversation toConv(WhatsAppContact contact) {
        BotEngine.Conversation conv = new BotEngine.Conversation();
        conv.state = contact.getState() == null ? BotState.NEW : contact.getState();
        conv.language = contact.getLanguage();
        if (contact.getNeighborhood() != null) {
            conv.neighborhoodId = contact.getNeighborhood().getId();
            conv.neighborhoodName = contact.getNeighborhood().getName();
            conv.commune = contact.getNeighborhood().getCommune();
            conv.riskLabel = contact.getNeighborhood().getRiskLevel().getLabel();
        }
        conv.pendingPlace = contact.getPendingPlace();
        conv.latitude = contact.getPendingLatitude();
        conv.longitude = contact.getPendingLongitude();
        conv.active = contact.isActive();
        return conv;
    }

    private void apply(WhatsAppContact contact, BotEngine.Conversation conv) {
        contact.setState(conv.state);
        contact.setLanguage(conv.language);
        contact.setActive(conv.active);
        contact.setPendingPlace(conv.pendingPlace);
        contact.setPendingLatitude(conv.latitude);
        contact.setPendingLongitude(conv.longitude);
        if (conv.neighborhoodId == null) {
            contact.setNeighborhood(null);
        } else if (contact.getNeighborhood() == null || !conv.neighborhoodId.equals(contact.getNeighborhood().getId())) {
            contact.setNeighborhood(neighborhoods.findById(conv.neighborhoodId).orElse(null));
        }
    }

    private BotEngine.Hood hood(Neighborhood neighborhood) {
        return new BotEngine.Hood(
                neighborhood.getId(),
                neighborhood.getName(),
                neighborhood.getCommune(),
                neighborhood.getRiskLevel().getLabel()
        );
    }

    private static String trimTitle(String title) {
        String clean = title == null ? "" : title;
        return clean.length() <= 20 ? clean : clean.substring(0, 20);
    }

    private static String trimBody(String body) {
        return body.length() <= 1024 ? body : body.substring(0, 1024);
    }

    private static boolean MessageDigestEquals(String a, String b) {
        return java.security.MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }

    private record Incoming(
            String from,
            String name,
            String text,
            String buttonId,
            String imageId,
            String caption,
            Double latitude,
            Double longitude,
            String locationName
    ) {
    }
}
