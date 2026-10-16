package tg.edziinku.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class Dtos {

    private Dtos() {
    }

    public record UserCard(
            UUID id,
            String displayName,
            String email,
            String phone,
            String role,
            String theme,
            String language,
            boolean verified
    ) {
    }

    public record AuthResponse(String accessToken, String refreshToken, long expiresIn, UserCard user) {
    }

    public record RegisterRequest(
            @Size(max = 180) String email,
            @Size(max = 32) String phone,
            @NotBlank @Size(min = 8, max = 80) String password,
            @NotBlank @Size(max = 80) String displayName
    ) {
    }

    public record LoginRequest(@NotBlank String identifier, @NotBlank String password) {
    }

    public record RefreshRequest(@NotBlank String refreshToken) {
    }

    public record GoogleRequest(@NotBlank String idToken) {
    }

    public record NeighborhoodCard(
            UUID id,
            String slug,
            String name,
            String commune,
            String riskLevel,
            String riskLabel,
            double latitude,
            double longitude,
            boolean approximate,
            UUID cityId,
            String cityName,
            String region,
            UUID urgencyId,
            String urgencyLabel,
            String urgencyColor,
            Integer urgencyRank,
            String aliases,
            boolean active
    ) {
    }

    public record NeighborhoodDetail(NeighborhoodCard neighborhood, List<ReportCard> recentReports) {
    }

    public record CityCard(
            UUID id,
            String slug,
            String name,
            String region,
            String commune,
            Double latitude,
            Double longitude,
            boolean active,
            long neighborhoodCount
    ) {
    }

    public record UrgencyLevelCard(
            UUID id,
            String slug,
            String label,
            String color,
            int rank,
            boolean active,
            long neighborhoodCount
    ) {
    }

    public record CityRequest(
            @NotBlank @Size(max = 120) String name,
            @Size(max = 120) String region,
            @Size(max = 120) String commune,
            Double latitude,
            Double longitude,
            Boolean active
    ) {
    }

    public record NeighborhoodRequest(
            @NotBlank @Size(max = 120) String name,
            UUID cityId,
            UUID urgencyLevelId,
            @Size(max = 120) String commune,
            @Size(max = 400) String aliases,
            Double latitude,
            Double longitude,
            Boolean approximate,
            Boolean active
    ) {
    }

    public record UrgencyLevelRequest(
            @NotBlank @Size(max = 80) String label,
            @NotBlank @Size(max = 7) String color,
            @NotNull Integer rank,
            Boolean active
    ) {
    }

    public record RainPoint(int hour, double mm) {
    }

    public record AlertCard(
            UUID id,
            String title,
            String body,
            String bodyEwe,
            boolean eweNeedsReview,
            String level,
            String kind,
            UUID neighborhoodId,
            String neighborhoodName,
            UUID cityId,
            String cityName,
            Instant startsAt,
            Instant endsAt,
            Integer rainMmMin,
            Integer rainMmMax,
            List<RainPoint> rainSeries,
            String source,
            Instant createdAt
    ) {
    }

    public record AlertCreateRequest(
            @NotBlank @Size(max = 200) String title,
            @NotBlank @Size(max = 4000) String body,
            @Size(max = 4000) String bodyEwe,
            @NotBlank String level,
            @NotBlank String kind,
            UUID neighborhoodId,
            UUID cityId,
            Instant startsAt,
            Instant endsAt,
            Integer rainMmMin,
            Integer rainMmMax,
            @Size(max = 80) String source
    ) {
    }

    public record LocalAlertCard(
            AlertCard alert,
            String scope,
            List<String> neighborNames
    ) {
    }

    public record LocalRiskResponse(
            NeighborhoodCard neighborhood,
            Double distanceM,
            boolean outOfKnownZone,
            String urgencyLabel,
            String urgencyColor,
            Integer urgencyRank,
            String riskLevel,
            List<LocalAlertCard> alerts,
            List<String> neighborNames,
            double neighborRadiusKm,
            double matchMaxKm
    ) {
    }

    public record ParseLinkRequest(@NotBlank @Size(max = 2000) String url) {
    }

    public record ParseLinkResponse(
            Double latitude,
            Double longitude,
            String source,
            boolean unresolvedShortlink,
            String hint
    ) {
    }

    public record ReportCard(
            UUID id,
            String reference,
            String placeLabel,
            UUID neighborhoodId,
            String neighborhoodName,
            String commune,
            double latitude,
            double longitude,
            Integer accuracyM,
            String waterLevel,
            String waterLevelLabel,
            String comment,
            String status,
            String statusLabel,
            String channel,
            int confirmations,
            List<String> tags,
            String photoUrl,
            Instant createdAt
    ) {
    }

    public record ReportRequest(
            UUID neighborhoodId,
            @NotBlank @Size(max = 180) String placeLabel,
            @NotNull Double latitude,
            @NotNull Double longitude,
            Integer accuracyM,
            @NotBlank String waterLevel,
            @Size(max = 2000) String comment,
            String channel,
            List<@Size(max = 40) String> tags
    ) {
    }

    public record StatusRequest(@NotBlank String status) {
    }

    public record PageResponse<T>(List<T> items, int page, int size, long total) {
    }

    public record HotspotReport(UUID id, String photoUrl, Instant createdAt, String quartier) {
    }

    public record HotspotZone(
            String id,
            String label,
            long count,
            double lat,
            double lng,
            List<HotspotReport> reports,
            UUID neighborhoodId,
            String cityName,
            String urgencyLabel,
            String urgencyColor,
            Integer urgencyRank
    ) {
    }

    public record HotspotResponse(int days, List<HotspotZone> zones) {
    }

    public record BasinCard(
            UUID id,
            String name,
            String commune,
            int obstructionPct,
            String status,
            String statusLabel,
            double latitude,
            double longitude
    ) {
    }

    public record TimelineCard(UUID id, Instant occurredAt, String title, String detail, String kind) {
    }

    public record TeamCard(UUID id, String name, String zone, String status, String assignment) {
    }

    public record PreferenceCard(
            boolean pushEnabled,
            boolean whatsappEnabled,
            boolean smsEnabled,
            boolean nightAlerts,
            String alertLanguage
    ) {
    }

    public record ProfileCard(
            UserCard user,
            PreferenceCard preferences,
            List<NeighborhoodCard> neighborhoods
    ) {
    }

    public record ProfileUpdate(@Size(max = 80) String displayName, String language) {
    }

    public record ChannelsRequest(
            boolean pushEnabled,
            boolean whatsappEnabled,
            boolean smsEnabled,
            boolean nightAlerts,
            @NotBlank String alertLanguage
    ) {
    }

    public record NeighborhoodsRequest(@NotNull List<UUID> neighborhoodIds) {
    }

    public record ThemeRequest(@NotBlank String theme) {
    }

    public record WeatherDay(String date, String label, double precipitationMm, boolean forecast) {
    }

    public record WeatherResponse(double latitude, double longitude, String source, boolean demo, List<WeatherDay> days) {
    }

    public record HourlyResponse(String source, boolean demo, List<RainPoint> hours) {
    }

    public record LocateResponse(NeighborhoodCard neighborhood) {
    }

    public record DashboardResponse(
            boolean demo,
            int alertsSentToday,
            int reports24h,
            String reportsTrend,
            int activeBlackSpots,
            int criticalBlackSpots,
            int drainsToClear,
            int plannedThisWeek,
            String vigilanceLabel,
            String vigilanceWindow,
            String vigilanceNeighborhood,
            long liveReports,
            long pendingReports
    ) {
    }

    public record OutboundCard(UUID id, String recipient, String body, String status, Instant createdAt) {
    }
}
