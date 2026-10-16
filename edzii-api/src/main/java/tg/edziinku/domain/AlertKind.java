package tg.edziinku.domain;

public enum AlertKind {
    RAIN,
    REPORT,
    WORKS,
    CLEAR,
    ORAGE,
    FORTE_PLUIE,
    VIGILANCE_INONDATION,
    CALME;

    public boolean isWeatherSign() {
        return this == ORAGE || this == FORTE_PLUIE || this == VIGILANCE_INONDATION || this == CALME || this == RAIN;
    }

    public String labelFr() {
        return switch (this) {
            case ORAGE -> "Orage";
            case FORTE_PLUIE -> "Forte pluie";
            case VIGILANCE_INONDATION -> "Vigilance inondation";
            case CALME -> "Calme";
            case RAIN -> "Pluie";
            case REPORT -> "Signalements";
            case WORKS -> "Travaux";
            case CLEAR -> "Levée";
        };
    }
}
