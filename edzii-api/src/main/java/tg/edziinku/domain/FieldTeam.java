package tg.edziinku.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "field_teams")
public class FieldTeam {

    @Id
    private UUID id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 120)
    private String zone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TeamStatus status;

    @Column(length = 200)
    private String assignment;

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getZone() {
        return zone;
    }

    public TeamStatus getStatus() {
        return status;
    }

    public String getAssignment() {
        return assignment;
    }
}
