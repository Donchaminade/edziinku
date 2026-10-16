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
@Table(name = "alerts")
public class Alert {

    @Id
    private UUID id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String body;

    @Column(name = "body_ewe", columnDefinition = "text")
    private String bodyEwe;

    @Column(name = "ewe_needs_review", nullable = false)
    private boolean eweNeedsReview = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertLevel level;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AlertKind kind;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "neighborhood_id")
    private Neighborhood neighborhood;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    private City city;

    @Column(name = "starts_at")
    private Instant startsAt;

    @Column(name = "ends_at")
    private Instant endsAt;

    @Column(name = "rain_mm_min")
    private Integer rainMmMin;

    @Column(name = "rain_mm_max")
    private Integer rainMmMax;

    @Column(name = "rain_series", columnDefinition = "text")
    private String rainSeries;

    @Column(length = 80)
    private String source;

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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getBodyEwe() {
        return bodyEwe;
    }

    public void setBodyEwe(String bodyEwe) {
        this.bodyEwe = bodyEwe;
    }

    public boolean isEweNeedsReview() {
        return eweNeedsReview;
    }

    public void setEweNeedsReview(boolean eweNeedsReview) {
        this.eweNeedsReview = eweNeedsReview;
    }

    public AlertLevel getLevel() {
        return level;
    }

    public void setLevel(AlertLevel level) {
        this.level = level;
    }

    public AlertKind getKind() {
        return kind;
    }

    public void setKind(AlertKind kind) {
        this.kind = kind;
    }

    public Neighborhood getNeighborhood() {
        return neighborhood;
    }

    public void setNeighborhood(Neighborhood neighborhood) {
        this.neighborhood = neighborhood;
    }

    public City getCity() {
        return city;
    }

    public void setCity(City city) {
        this.city = city;
    }

    public Instant getStartsAt() {
        return startsAt;
    }

    public void setStartsAt(Instant startsAt) {
        this.startsAt = startsAt;
    }

    public Instant getEndsAt() {
        return endsAt;
    }

    public void setEndsAt(Instant endsAt) {
        this.endsAt = endsAt;
    }

    public Integer getRainMmMin() {
        return rainMmMin;
    }

    public void setRainMmMin(Integer rainMmMin) {
        this.rainMmMin = rainMmMin;
    }

    public Integer getRainMmMax() {
        return rainMmMax;
    }

    public void setRainMmMax(Integer rainMmMax) {
        this.rainMmMax = rainMmMax;
    }

    public String getRainSeries() {
        return rainSeries;
    }

    public void setRainSeries(String rainSeries) {
        this.rainSeries = rainSeries;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
