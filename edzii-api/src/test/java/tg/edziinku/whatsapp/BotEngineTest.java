package tg.edziinku.whatsapp;

import org.junit.jupiter.api.Test;
import tg.edziinku.domain.BotState;
import tg.edziinku.domain.WaterLevel;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BotEngineTest {

    private final BotEngine.Hood be = new BotEngine.Hood(UUID.randomUUID(), "Bè", "Golfe 1", "Risque élevé");

    @Test
    void inscriptionPuisSignalement() {
        BotEngine.Conversation conv = new BotEngine.Conversation();
        BotEngine.Outcome welcome = BotEngine.handle(conv, empty(), List.of(be), "http://localhost:5173/carte");
        assertEquals(BotState.AWAITING_LANGUAGE, conv.state);
        assertTrue(welcome.messages().get(0).body().contains("Edzii-Nku"));

        BotEngine.handle(conv, new BotEngine.Inbound("Français", "lang_fr", false, null, null, null, null), List.of(be), "http://localhost:5173/carte");
        assertEquals("fr", conv.language);
        assertEquals(BotState.AWAITING_QUARTER, conv.state);

        BotEngine.handle(conv, new BotEngine.Inbound("Bè Ahligo", null, false, null, null, null, null), List.of(be), "http://localhost:5173/carte");
        assertEquals(BotState.AWAITING_CONFIRM, conv.state);
        assertEquals(be.id(), conv.neighborhoodId);

        BotEngine.handle(conv, new BotEngine.Inbound("Oui, suivre Bè", "confirm", false, null, null, null, null), List.of(be), "http://localhost:5173/carte");
        assertEquals(BotState.SUBSCRIBED, conv.state);
        assertTrue(conv.active);

        BotEngine.handle(conv, new BotEngine.Inbound("SIGNALER", null, false, null, null, null, null), List.of(be), "http://localhost:5173/carte");
        assertEquals(BotState.AWAITING_PHOTO, conv.state);

        BotEngine.handle(conv, new BotEngine.Inbound(null, null, true, null, null, null, null), List.of(be), "http://localhost:5173/carte");
        assertEquals(BotState.AWAITING_LOCATION, conv.state);

        BotEngine.handle(conv, new BotEngine.Inbound(null, null, false, 6.13, 1.23, "Bè Ahligo", be), List.of(be), "http://localhost:5173/carte");
        assertEquals(BotState.AWAITING_LEVEL, conv.state);

        BotEngine.Outcome done = BotEngine.handle(conv, new BotEngine.Inbound("Genou", "lvl_genou", false, null, null, null, null), List.of(be), "http://localhost:5173/carte");
        assertEquals(BotState.SUBSCRIBED, conv.state);
        assertNotNull(done.report());
        assertEquals(WaterLevel.GENOU, done.report().level());
        assertTrue(done.messages().get(0).body().contains("Merci"));
    }

    @Test
    void bulletinReprendLeTitreEtLeCorps() {
        BotEngine.Out calme = BotEngine.bulletin(
                false, "Retour au calme", "Bè", "Plus de signe météo immédiat dans le secteur.", "Mairie");
        assertTrue(calme.body().contains("Retour au calme"));
        assertTrue(calme.body().contains("Plus de signe météo immédiat"));
        assertTrue(calme.body().contains("BÈ"));
        assertFalse(calme.body().contains("ALERTE FORTE PLUIE"));
        assertFalse(calme.body().contains("ce soir"));
        assertFalse(calme.body().contains("? à ?"));
    }

    @Test
    void alerteEweEstMarqueeCommeBrouillon() {
        assertTrue(BotEngine.EWE_NEEDS_NATIVE_REVIEW);
        BotEngine.Out alert = BotEngine.alert(true, "Bè", "tso gaƒoƒo 18 vaseɖe 23", "45–60 mm", "Open-Meteo");
        assertTrue(alert.body().contains("NYANUƉEƉE"));
    }

    private BotEngine.Inbound empty() {
        return new BotEngine.Inbound(null, null, false, null, null, null, null);
    }
}
