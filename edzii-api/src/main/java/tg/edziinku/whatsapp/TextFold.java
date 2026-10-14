package tg.edziinku.whatsapp;

import java.text.Normalizer;
import java.util.Locale;

public final class TextFold {

    private TextFold() {
    }

    public static String fold(String value) {
        if (value == null) {
            return "";
        }
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return normalized.toLowerCase(Locale.ROOT).replace('ʋ', 'v').replace('ɖ', 'd').trim();
    }
}
