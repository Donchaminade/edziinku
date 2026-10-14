package tg.edziinku.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "basins")
public class Basin {

    @Id
    private UUID id;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, length = 120)
    private String commune;

    @Column(name = "obstruction_pct", nullable = false)
    private int obstructionPct;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BasinStatus status;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCommune() {
        return commune;
    }

    public int getObstructionPct() {
        return obstructionPct;
    }

    public BasinStatus getStatus() {
        return status;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }
}
