package tg.edziinku.whatsapp;

import tg.edziinku.domain.BotState;
import tg.edziinku.domain.WaterLevel;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Scénario du bot WhatsApp (abonnement par quartier, alerte, signalement photo).
 * Les réponses en éwé sont un premier jet : À RELIRE PAR UN LOCUTEUR NATIF.
 */
public final class BotEngine {

    public static final boolean EWE_NEEDS_NATIVE_REVIEW = true;

    private BotEngine() {
    }

    public record Hood(UUID id, String name, String commune, String riskLabel) {
    }

    public record Inbound(
            String text,
            String buttonId,
            boolean image,
            Double latitude,
            Double longitude,
            String locationName,
            Hood resolved
    ) {
    }

    public static final class Conversation {
        public BotState state = BotState.NEW;
        public String language;
        public UUID neighborhoodId;
        public String neighborhoodName;
        public String commune;
        public String riskLabel;
        public String pendingPlace;
        public Double latitude;
        public Double longitude;
        public boolean active;
    }

    public record Button(String id, String title) {
    }

    public record Out(String body, List<Button> buttons) {
    }

    public record Draft(WaterLevel level, String place, Double latitude, Double longitude) {
    }

    public record Outcome(List<Out> messages, Draft report) {
    }

    public static Outcome handle(Conversation conv, Inbound in, List<Hood> hoods, String mapUrl) {
        String button = in.buttonId() == null ? "" : in.buttonId();
        String text = in.text() == null ? "" : in.text().trim();
        String folded = TextFold.fold(text + " " + button);
        boolean ewe = "ewe".equals(conv.language);

        if (conv.state != BotState.NEW && conv.state != BotState.AWAITING_LANGUAGE
                && (folded.equals("stop") || button.equals("stop"))) {
            conv.state = BotState.UNSUBSCRIBED;
            conv.active = false;
            return new Outcome(List.of(text(ewe
                    ? "Wò ŋkɔ le eme. Ne èdi be nàgbugbɔ la, ŋlɔ naneke. (À relire)"
                    : "Vous êtes désabonné·e. Envoyez un message pour vous réinscrire.")), null);
        }

        return switch (conv.state) {
            case NEW, UNSUBSCRIBED -> welcome(conv);
            case AWAITING_LANGUAGE -> language(conv, folded, button);
            case AWAITING_QUARTER -> quarter(conv, in, hoods, folded);
            case AWAITING_CONFIRM -> confirm(conv, folded, button);
            case SUBSCRIBED -> subscribed(conv, folded, button, mapUrl);
            case AWAITING_PHOTO -> photo(conv, in);
            case AWAITING_LOCATION -> location(conv, in, hoods);
            case AWAITING_LEVEL -> level(conv, folded, button);
        };
    }

    public static Out alert(boolean ewe, String neighborhood, String window, String mm, String source) {
        if (ewe) {
            return text("""
                    ⚠️ NYANUƉEƉE: TSI GÃ · %s
                    Tsi gã adza fiẽ sia %s (%s).
                    🔴 Tsiɖɔɖɔ ƒe afɔku le wò kɔƒe me.
                    ✅ Ɖo wò nuwo kple wò agbalẽwo ɖe dzi
                    🚫 Mègaɖo tsiveɖawo kple tsiƒuwo gbɔ o
                    📞 Kpekpeɖeŋu: 170
                    Tso: %s · Edzii-Nku
                    """.formatted(neighborhood.toUpperCase(), window, mm, source));
        }
        return text("""
                ⚠️ ALERTE FORTE PLUIE · %s
                De fortes pluies sont prévues %s (%s).
                🔴 Risque d’inondation élevé dans votre quartier.
                ✅ Surélevez vos biens et vos documents
                🚫 Évitez les caniveaux et les bassins
                📞 Urgence : 170 (numéro vert)
                Source : %s · Edzii-Nku
                """.formatted(neighborhood.toUpperCase(), window, mm, source));
    }

    private static Outcome welcome(Conversation conv) {
        conv.state = BotState.AWAITING_LANGUAGE;
        conv.active = false;
        return new Outcome(List.of(new Out(
                "👋 Bienvenue sur Edzii-Nku, l’œil de la pluie.\nJe vous préviens quand une forte pluie menace votre quartier.\n\nQuelle langue préférez-vous ?\nTia wò gbe. (éwé à relire)",
                List.of(new Button("lang_fr", "Français"), new Button("lang_ewe", "Eʋegbe"))
        )), null);
    }

    private static Outcome language(Conversation conv, String folded, String button) {
        if (button.equals("lang_fr") || folded.contains("francais")) {
            conv.language = "fr";
        } else if (button.equals("lang_ewe") || folded.contains("ewe") || folded.contains("evegbe")) {
            conv.language = "ewe";
        } else {
            return welcome(conv);
        }
        conv.state = BotState.AWAITING_QUARTER;
        boolean ewe = "ewe".equals(conv.language);
        return new Outcome(List.of(text(ewe
                ? "De kɔƒe me nèle? Ŋlɔ ŋkɔa alo ɖo wò teƒe ɖe. (À relire)"
                : "Dans quel quartier habitez-vous ? Écrivez son nom ou partagez votre position 📍")), null);
    }

    private static Outcome quarter(Conversation conv, Inbound in, List<Hood> hoods, String folded) {
        Hood hood = in.resolved() != null ? in.resolved() : match(folded, hoods);
        if (hood == null) {
            boolean ewe = "ewe".equals(conv.language);
            return new Outcome(List.of(text(ewe
                    ? "Nyemeke kɔƒea o. Gate ŋkɔa ŋlɔ. (À relire)"
                    : "Je n’ai pas trouvé ce quartier. Essayez Bè, Agoè-Nyivé, Zogbédji, Adakpamé, Hédzranawoé ou Tokoin.")), null);
        }
        conv.neighborhoodId = hood.id();
        conv.neighborhoodName = hood.name();
        conv.commune = hood.commune();
        conv.riskLabel = hood.riskLabel();
        if (in.latitude() != null) {
            conv.latitude = in.latitude();
            conv.longitude = in.longitude();
        }
        conv.state = BotState.AWAITING_CONFIRM;
        boolean ewe = "ewe".equals(conv.language);
        String title = ("Oui, " + hood.name());
        if (title.length() > 20) {
            title = "Oui, suivre";
        }
        String body = ewe
                ? "Meke : " + hood.name() + " · " + hood.commune() + " (" + hood.riskLabel() + "). Èdi be yeakpe ɖe eŋu a? (À relire)"
                : "J’ai trouvé : " + hood.name() + " · " + hood.commune() + " (" + hood.riskLabel().toLowerCase() + ").\nVoulez-vous suivre ce quartier ?";
        return new Outcome(List.of(new Out(body, List.of(new Button("confirm", title), new Button("cancel", "Non")))), null);
    }

    private static Outcome confirm(Conversation conv, String folded, String button) {
        if (button.equals("cancel") || folded.equals("non") || folded.contains("annul")) {
            conv.state = BotState.AWAITING_QUARTER;
            conv.neighborhoodId = null;
            return new Outcome(List.of(text("ewe".equals(conv.language)
                    ? "Nyɔ. Ŋlɔ kɔƒe bubu. (À relire)"
                    : "D’accord. Écrivez un autre quartier.")), null);
        }
        if (!(button.equals("confirm") || folded.contains("oui") || folded.contains("suivre") || folded.contains("yes"))) {
            return new Outcome(List.of(text("Répondez Oui pour suivre " + conv.neighborhoodName + ", ou Non.")), null);
        }
        conv.state = BotState.SUBSCRIBED;
        conv.active = true;
        boolean ewe = "ewe".equals(conv.language);
        return new Outcome(List.of(text(ewe
                ? "Ewɔ ! Nàxɔ nyanyaɖeɖewo tso " + conv.neighborhoodName + ". Ŋlɔ SIGNALER be nàgblɔ tsiɖɔɖɔ, STOP be nàɖe asi le eŋu. (À relire)"
                : "C’est fait ! Vous recevrez les alertes pour " + conv.neighborhoodName + ".\nEnvoyez SIGNALER à tout moment pour signaler une inondation, STOP pour vous désabonner.")), null);
    }

    private static Outcome subscribed(Conversation conv, String folded, String button, String mapUrl) {
        boolean ewe = "ewe".equals(conv.language);
        if (button.equals("report") || folded.contains("signaler") || folded.contains("gblo")) {
            conv.state = BotState.AWAITING_PHOTO;
            return new Outcome(List.of(text(ewe
                    ? "📸 Ɖo tsi ƒe foto ɖa, emegbe wò teƒe. (À relire)"
                    : "📸 Envoyez une photo de l’eau, puis votre position.")), null);
        }
        if (button.equals("safe") || folded.contains("secur") || folded.contains("medze")) {
            return new Outcome(List.of(text(ewe
                    ? "Akpe. Míagblɔe na wò ne nyanya nu aɖo. (À relire)"
                    : "Merci, c’est noté. Restez prudent·e. Nous vous écrirons à la fin de la vigilance.")), null);
        }
        if (button.equals("map") || folded.contains("carte") || folded.contains("kpo")) {
            return new Outcome(List.of(text("Carte : " + mapUrl)), null);
        }
        return new Outcome(List.of(new Out(
                ewe ? "Nyanyaɖeɖe le " + conv.neighborhoodName + ". (À relire)" : "Vous suivez " + conv.neighborhoodName + ". Que souhaitez-vous faire ?",
                List.of(
                        new Button("safe", ewe ? "Medze dedie" : "En sécurité"),
                        new Button("report", ewe ? "Gblɔ tsiɖɔɖɔ" : "Signaler"),
                        new Button("map", "Voir la carte")
                )
        )), null);
    }

    private static Outcome photo(Conversation conv, Inbound in) {
        if (!in.image() && (in.text() == null || in.text().isBlank())) {
            return new Outcome(List.of(text("Envoyez une photo de l’eau.")), null);
        }
        if (!in.image()) {
            return new Outcome(List.of(text("J’ai besoin de la photo avant la position.")), null);
        }
        conv.state = BotState.AWAITING_LOCATION;
        return new Outcome(List.of(text("ewe".equals(conv.language)
                ? "Foto la va. Ɖo wò teƒe ɖe. (À relire)"
                : "Photo reçue. Partagez maintenant votre position 📍")), null);
    }

    private static Outcome location(Conversation conv, Inbound in, List<Hood> hoods) {
        if (in.latitude() != null && in.longitude() != null) {
            conv.latitude = in.latitude();
            conv.longitude = in.longitude();
            conv.pendingPlace = in.locationName() != null && !in.locationName().isBlank()
                    ? in.locationName()
                    : (in.resolved() != null ? in.resolved().name() : conv.neighborhoodName);
        } else if (in.resolved() != null) {
            conv.pendingPlace = in.resolved().name();
            conv.neighborhoodId = in.resolved().id();
            conv.neighborhoodName = in.resolved().name();
        } else if (in.text() != null && TextFold.fold(in.text()).length() >= 3) {
            Hood hood = match(in.text(), hoods);
            conv.pendingPlace = hood != null ? hood.name() : in.text().trim();
            if (hood != null) {
                conv.neighborhoodId = hood.id();
                conv.neighborhoodName = hood.name();
            }
        } else {
            return new Outcome(List.of(text("Partagez votre position ou écrivez le lieu.")), null);
        }
        conv.state = BotState.AWAITING_LEVEL;
        return new Outcome(List.of(new Out(
                "ewe".equals(conv.language) ? "Tsi ƒe didime de? (À relire)" : "Jusqu’où monte l’eau ?",
                List.of(new Button("lvl_cheville", "Cheville"), new Button("lvl_genou", "Genou"), new Button("lvl_taille", "Taille"))
        )), null);
    }

    private static Outcome level(Conversation conv, String folded, String button) {
        WaterLevel level = WaterLevel.fromText(folded + " " + button);
        if (level == null) {
            return new Outcome(List.of(new Out(
                    "Choisissez Cheville, Genou ou Taille.",
                    List.of(new Button("lvl_cheville", "Cheville"), new Button("lvl_genou", "Genou"), new Button("lvl_taille", "Taille"))
            )), null);
        }
        String place = conv.pendingPlace == null ? conv.neighborhoodName : conv.pendingPlace;
        Draft draft = new Draft(level, place, conv.latitude, conv.longitude);
        conv.state = BotState.SUBSCRIBED;
        conv.pendingPlace = null;
        String phrase = switch (level) {
            case CHEVILLE -> "eau à la cheville";
            case GENOU -> "eau au genou";
            case TAILLE -> "eau à la taille";
        };
        String body = "ewe".equals(conv.language)
                ? "✅ Akpe ! Gblɔdɔdɔ la va.\n📍 " + place + " · " + level.getLabel() + "\nEkpe ɖe anyigbatata dzi le dzododokpɔkpɔ megbe. (À relire)"
                : "✅ Merci ! Signalement reçu.\n📍 " + place + " · 🌊 " + phrase + "\nIl apparaîtra sur la carte après vérification. La mairie et la protection civile sont informées.";
        return new Outcome(List.of(text(body)), draft);
    }

    static Hood match(String text, List<Hood> hoods) {
        String folded = TextFold.fold(text);
        if (folded.length() < 2) {
            return null;
        }
        Hood best = null;
        int score = -1;
        for (Hood hood : hoods) {
            String name = TextFold.fold(hood.name());
            int current = -1;
            if (!name.isEmpty() && folded.contains(name)) {
                current = 100 + name.length();
            } else if (folded.length() >= 3 && name.contains(folded)) {
                current = folded.length();
            }
            if (current > score) {
                score = current;
                best = hood;
            }
        }
        return score < 0 ? null : best;
    }

    private static Out text(String body) {
        return new Out(body, List.of());
    }

    public static String confirmationWithReference(String reference, String place, WaterLevel level) {
        String phrase = switch (level) {
            case CHEVILLE -> "eau à la cheville";
            case GENOU -> "eau au genou";
            case TAILLE -> "eau à la taille";
        };
        return "✅ Merci ! Signalement " + reference + " reçu.\n📍 " + place + " · 🌊 " + phrase
                + "\nIl apparaîtra sur la carte après vérification. La mairie et la protection civile sont informées.";
    }
}
