package tg.edziinku.service;

import tg.edziinku.domain.Neighborhood;
import tg.edziinku.whatsapp.TextFold;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Rattache un libellé libre (lieu, alias « Be » / « Bè ») à un quartier connu.
 */
public final class NeighborhoodMatcher {

    private NeighborhoodMatcher() {
    }

    public static Optional<Neighborhood> match(String place, List<Neighborhood> catalog) {
        String folded = fold(place);
        if (folded.isEmpty() || catalog == null || catalog.isEmpty()) {
            return Optional.empty();
        }
        List<Neighborhood> candidates = catalog.stream()
                .filter(item -> item != null && item.isActive() && !item.isUnlocated())
                .toList();
        for (Neighborhood neighborhood : candidates) {
            for (String token : tokensOf(neighborhood)) {
                if (token.equals(folded)) {
                    return Optional.of(neighborhood);
                }
            }
        }
        Neighborhood best = null;
        int bestLength = 0;
        for (Neighborhood neighborhood : candidates) {
            for (String token : tokensOf(neighborhood)) {
                if (token.length() < 3) {
                    continue;
                }
                if (isPrefixed(folded, token) && token.length() > bestLength) {
                    best = neighborhood;
                    bestLength = token.length();
                }
            }
        }
        return Optional.ofNullable(best);
    }

    public static Optional<Neighborhood> unlocated(List<Neighborhood> catalog) {
        if (catalog == null) {
            return Optional.empty();
        }
        return catalog.stream()
                .filter(Neighborhood::isUnlocated)
                .min(Comparator.comparing(Neighborhood::getName, String.CASE_INSENSITIVE_ORDER));
    }

    static List<String> tokensOf(Neighborhood neighborhood) {
        List<String> tokens = new ArrayList<>();
        addToken(tokens, neighborhood.getName());
        addToken(tokens, neighborhood.getSlug());
        if (neighborhood.getAliases() != null) {
            for (String alias : neighborhood.getAliases().split("[,;|/]")) {
                addToken(tokens, alias);
            }
        }
        return tokens;
    }

    static String fold(String value) {
        return TextFold.fold(value)
                .replaceAll("[^a-z0-9]+", " ")
                .replaceAll("\\s+", " ")
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private static void addToken(List<String> tokens, String raw) {
        String folded = fold(raw);
        if (!folded.isEmpty() && !tokens.contains(folded)) {
            tokens.add(folded);
        }
    }

    private static boolean isPrefixed(String place, String token) {
        return place.startsWith(token + " ") || place.startsWith(token + ",");
    }
}
