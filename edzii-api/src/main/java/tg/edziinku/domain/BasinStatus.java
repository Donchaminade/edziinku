package tg.edziinku.domain;

public enum BasinStatus {
    SURVEILLE("Surveillé"),
    ELEVE("Élevé"),
    CRITIQUE("Critique");

    private final String label;

    BasinStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
