package tg.edziinku.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "whatsapp_contacts")
public class WhatsAppContact {

    @Id
    private UUID id;

    @Column(name = "wa_id", nullable = false, unique = true, length = 32)
    private String waId;

    @Column(name = "display_name", length = 120)
    private String displayName;

    @Column(length = 16)
    private String language;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "neighborhood_id")
    private Neighborhood neighborhood;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private BotState state = BotState.NEW;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "pending_place", length = 180)
    private String pendingPlace;

    @Column(name = "pending_latitude")
    private Double pendingLatitude;

    @Column(name = "pending_longitude")
    private Double pendingLongitude;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getWaId() {
        return waId;
    }

    public void setWaId(String waId) {
        this.waId = waId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Neighborhood getNeighborhood() {
        return neighborhood;
    }

    public void setNeighborhood(Neighborhood neighborhood) {
        this.neighborhood = neighborhood;
    }

    public BotState getState() {
        return state;
    }

    public void setState(BotState state) {
        this.state = state;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getPendingPlace() {
        return pendingPlace;
    }

    public void setPendingPlace(String pendingPlace) {
        this.pendingPlace = pendingPlace;
    }

    public Double getPendingLatitude() {
        return pendingLatitude;
    }

    public void setPendingLatitude(Double pendingLatitude) {
        this.pendingLatitude = pendingLatitude;
    }

    public Double getPendingLongitude() {
        return pendingLongitude;
    }

    public void setPendingLongitude(Double pendingLongitude) {
        this.pendingLongitude = pendingLongitude;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
