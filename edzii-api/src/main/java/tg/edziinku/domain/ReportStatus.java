package tg.edziinku.domain;

public enum ReportStatus {
    A_VERIFIER("À vérifier"),
    VALIDE("Validé"),
    REJETE("Rejeté"),
    DOUBLON("Doublon");

    private final String label;

    ReportStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
