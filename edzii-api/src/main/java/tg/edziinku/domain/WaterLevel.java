package tg.edziinku.domain;

public enum WaterLevel {
    CHEVILLE("Cheville", "~10 cm"),
    GENOU("Genou", "~50 cm"),
    TAILLE("Taille", "~1 m");

    private final String label;
    private final String hint;

    WaterLevel(String label, String hint) {
        this.label = label;
        this.hint = hint;
    }

    public String getLabel() {
        return label;
    }

    public String getHint() {
        return hint;
    }

    public static WaterLevel fromText(String raw) {
        if (raw == null) {
            return null;
        }
        String folded = raw.toLowerCase();
        if (folded.contains("cheville") || folded.contains("lvl_cheville")) {
            return CHEVILLE;
        }
        if (folded.contains("genou") || folded.contains("lvl_genou")) {
            return GENOU;
        }
        if (folded.contains("taille") || folded.contains("lvl_taille")) {
            return TAILLE;
        }
        return null;
    }
}
