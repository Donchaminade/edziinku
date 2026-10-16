package tg.edziinku.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import tg.edziinku.domain.Alert;
import tg.edziinku.domain.Basin;
import tg.edziinku.domain.City;
import tg.edziinku.domain.FieldTeam;
import tg.edziinku.domain.Neighborhood;
import tg.edziinku.domain.NotificationPreference;
import tg.edziinku.domain.OutboundMessage;
import tg.edziinku.domain.Report;
import tg.edziinku.domain.TimelineEvent;
import tg.edziinku.domain.UrgencyLevel;
import tg.edziinku.domain.UserAccount;
import tg.edziinku.dto.Dtos;

import java.util.Comparator;
import java.util.List;

@Component
public class ViewMapper {

    private final ObjectMapper objectMapper;

    public ViewMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Dtos.UserCard user(UserAccount user) {
        return new Dtos.UserCard(
                user.getId(),
                user.getDisplayName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.getTheme(),
                user.getLanguage(),
                user.isVerified()
        );
    }

    public Dtos.NeighborhoodCard neighborhood(Neighborhood n) {
        City city = n.getCity();
        UrgencyLevel urgency = n.getUrgencyLevel();
        return new Dtos.NeighborhoodCard(
                n.getId(),
                n.getSlug(),
                n.getName(),
                n.getCommune(),
                n.getRiskLevel().name(),
                n.getRiskLevel().getLabel(),
                n.getLatitude(),
                n.getLongitude(),
                n.isApproximate(),
                city == null ? null : city.getId(),
                city == null ? null : city.getName(),
                city == null ? null : city.getRegion(),
                urgency == null ? null : urgency.getId(),
                urgency == null ? null : urgency.getLabel(),
                urgency == null ? null : urgency.getColor(),
                urgency == null ? null : urgency.getRank(),
                n.getAliases(),
                n.isActive()
        );
    }

    public Dtos.CityCard city(City city, long neighborhoodCount) {
        return new Dtos.CityCard(
                city.getId(),
                city.getSlug(),
                city.getName(),
                city.getRegion(),
                city.getCommune(),
                city.getLatitude(),
                city.getLongitude(),
                city.isActive(),
                neighborhoodCount
        );
    }

    public Dtos.UrgencyLevelCard urgency(UrgencyLevel level, long neighborhoodCount) {
        return new Dtos.UrgencyLevelCard(
                level.getId(),
                level.getSlug(),
                level.getLabel(),
                level.getColor(),
                level.getRank(),
                level.isActive(),
                neighborhoodCount
        );
    }

    public Dtos.AlertCard alert(Alert alert) {
        Neighborhood n = alert.getNeighborhood();
        City city = alert.getCity();
        if (city == null && n != null) {
            city = n.getCity();
        }
        return new Dtos.AlertCard(
                alert.getId(),
                alert.getTitle(),
                alert.getBody(),
                alert.getBodyEwe(),
                alert.isEweNeedsReview(),
                alert.getLevel().name(),
                alert.getKind().name(),
                n == null ? null : n.getId(),
                n == null ? null : n.getName(),
                city == null ? null : city.getId(),
                city == null ? null : city.getName(),
                alert.getStartsAt(),
                alert.getEndsAt(),
                alert.getRainMmMin(),
                alert.getRainMmMax(),
                rain(alert.getRainSeries()),
                alert.getSource(),
                alert.getCreatedAt()
        );
    }

    public Dtos.ReportCard report(Report report) {
        Neighborhood n = report.getNeighborhood();
        String photo = report.getPhotoFilename() == null ? null : "/api/media/" + report.getPhotoFilename();
        List<String> tags = report.getTags().stream().sorted(Comparator.naturalOrder()).toList();
        return new Dtos.ReportCard(
                report.getId(),
                report.getReference(),
                report.getPlaceLabel(),
                n == null ? null : n.getId(),
                n == null ? null : n.getName(),
                n == null ? null : n.getCommune(),
                report.getLatitude(),
                report.getLongitude(),
                report.getAccuracyM(),
                report.getWaterLevel().name(),
                report.getWaterLevel().getLabel(),
                report.getComment(),
                report.getStatus().name(),
                report.getStatus().getLabel(),
                report.getChannel().name(),
                report.getConfirmations(),
                tags,
                photo,
                report.getCreatedAt()
        );
    }

    public Dtos.BasinCard basin(Basin basin) {
        return new Dtos.BasinCard(
                basin.getId(),
                basin.getName(),
                basin.getCommune(),
                basin.getObstructionPct(),
                basin.getStatus().name(),
                basin.getStatus().getLabel(),
                basin.getLatitude(),
                basin.getLongitude()
        );
    }

    public Dtos.TimelineCard timeline(TimelineEvent event) {
        return new Dtos.TimelineCard(event.getId(), event.getOccurredAt(), event.getTitle(), event.getDetail(), event.getKind().name());
    }

    public Dtos.TeamCard team(FieldTeam team) {
        return new Dtos.TeamCard(team.getId(), team.getName(), team.getZone(), team.getStatus().name(), team.getAssignment());
    }

    public Dtos.PreferenceCard preferences(NotificationPreference prefs) {
        if (prefs == null) {
            return new Dtos.PreferenceCard(true, false, false, false, "fr");
        }
        return new Dtos.PreferenceCard(
                prefs.isPushEnabled(),
                prefs.isWhatsappEnabled(),
                prefs.isSmsEnabled(),
                prefs.isNightAlerts(),
                prefs.getAlertLanguage()
        );
    }

    public Dtos.OutboundCard outbound(OutboundMessage message) {
        return new Dtos.OutboundCard(message.getId(), message.getRecipient(), message.getBody(), message.getStatus().name(), message.getCreatedAt());
    }

    private List<Dtos.RainPoint> rain(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (Exception ex) {
            return List.of();
        }
    }
}
