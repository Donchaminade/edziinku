package tg.edziinku.domain;

public enum RiskLevel {
    MODERE("Risque modéré"),
    A_SURVEILLER("À surveiller"),
    ELEVE("Risque élevé");

    private final String label;

    RiskLevel(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
