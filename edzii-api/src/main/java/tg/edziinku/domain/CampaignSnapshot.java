package tg.edziinku.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "campaign_snapshot")
public class CampaignSnapshot {

    @Id
    private Integer id;

    @Column(name = "alerts_sent_today", nullable = false)
    private int alertsSentToday;

    @Column(name = "reports_24h", nullable = false)
    private int reports24h;

    @Column(name = "reports_trend", length = 80)
    private String reportsTrend;

    @Column(name = "active_black_spots", nullable = false)
    private int activeBlackSpots;

    @Column(name = "critical_black_spots", nullable = false)
    private int criticalBlackSpots;

    @Column(name = "drains_to_clear", nullable = false)
    private int drainsToClear;

    @Column(name = "planned_this_week", nullable = false)
    private int plannedThisWeek;

    @Column(name = "vigilance_label", length = 160)
    private String vigilanceLabel;

    @Column(name = "vigilance_window", length = 80)
    private String vigilanceWindow;

    @Column(name = "vigilance_neighborhood", length = 80)
    private String vigilanceNeighborhood;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(nullable = false)
    private boolean demo;

    public Integer getId() {
        return id;
    }

    public int getAlertsSentToday() {
        return alertsSentToday;
    }

    public int getReports24h() {
        return reports24h;
    }

    public String getReportsTrend() {
        return reportsTrend;
    }

    public int getActiveBlackSpots() {
        return activeBlackSpots;
    }

    public int getCriticalBlackSpots() {
        return criticalBlackSpots;
    }

    public int getDrainsToClear() {
        return drainsToClear;
    }

    public int getPlannedThisWeek() {
        return plannedThisWeek;
    }

    public String getVigilanceLabel() {
        return vigilanceLabel;
    }

    public String getVigilanceWindow() {
        return vigilanceWindow;
    }

    public String getVigilanceNeighborhood() {
        return vigilanceNeighborhood;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public boolean isDemo() {
        return demo;
    }
}
