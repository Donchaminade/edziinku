package tg.edziinku.service;

import tg.edziinku.whatsapp.TextFold;

import java.util.Locale;

public final class Slugs {

    private Slugs() {
    }

    public static String of(String value) {
        String folded = TextFold.fold(value)
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-)|(-$)", "");
        if (folded.isBlank()) {
            return "quartier";
        }
        return folded.length() > 64 ? folded.substring(0, 64).replaceAll("-$", "") : folded;
    }
}
