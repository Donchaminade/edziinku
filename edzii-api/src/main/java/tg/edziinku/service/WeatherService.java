package tg.edziinku.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;
import tg.edziinku.config.AppProperties;
import tg.edziinku.dto.Dtos;

import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class WeatherService {

    private static final ZoneId LOME = ZoneId.of("Africa/Lome");

    private final AppProperties properties;
    private final RestClient http;

    public WeatherService(AppProperties properties) {
        this.properties = properties;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(5));
        this.http = RestClient.builder().requestFactory(factory).build();
    }

    public Dtos.WeatherResponse daily(Double latitude, Double longitude) {
        double lat = latitude == null ? properties.getWeather().getLatitude() : latitude;
        double lng = longitude == null ? properties.getWeather().getLongitude() : longitude;
        try {
            JsonNode body = http.get().uri(dailyUrl(lat, lng)).retrieve().body(JsonNode.class);
            JsonNode daily = body == null ? null : body.path("daily");
            if (daily == null || !daily.has("time")) {
                return demoDaily(lat, lng);
            }
            LocalDate today = LocalDate.now(LOME);
            List<Dtos.WeatherDay> days = new ArrayList<>();
            JsonNode times = daily.path("time");
            JsonNode sums = daily.path("precipitation_sum");
            for (int i = 0; i < times.size(); i++) {
                LocalDate date = LocalDate.parse(times.get(i).asText());
                double mm = sums.get(i).isNull() ? 0 : sums.get(i).asDouble();
                String label = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.FRENCH);
                label = label.substring(0, 1).toUpperCase(Locale.FRENCH) + label.substring(1, Math.min(3, label.length()));
                days.add(new Dtos.WeatherDay(date.toString(), label, mm, date.isAfter(today)));
            }
            return new Dtos.WeatherResponse(lat, lng, "open-meteo", false, days);
        } catch (RuntimeException ex) {
            return demoDaily(lat, lng);
        }
    }

    public Dtos.HourlyResponse hourly(Double latitude, Double longitude) {
        double lat = latitude == null ? properties.getWeather().getLatitude() : latitude;
        double lng = longitude == null ? properties.getWeather().getLongitude() : longitude;
        try {
            JsonNode body = http.get().uri(hourlyUrl(lat, lng)).retrieve().body(JsonNode.class);
            JsonNode hourly = body == null ? null : body.path("hourly");
            if (hourly == null || !hourly.has("time")) {
                return demoHourly();
            }
            List<Dtos.RainPoint> points = new ArrayList<>();
            JsonNode times = hourly.path("time");
            JsonNode rain = hourly.path("precipitation");
            int start = Math.max(0, times.size() - 12);
            for (int i = start; i < times.size() && points.size() < 8; i++) {
                String stamp = times.get(i).asText();
                int hour = Integer.parseInt(stamp.substring(11, 13));
                double mm = rain.get(i).isNull() ? 0 : rain.get(i).asDouble();
                if (mm > 0 || points.size() > 0) {
                    points.add(new Dtos.RainPoint(hour, mm));
                }
            }
            if (points.isEmpty()) {
                return demoHourly();
            }
            return new Dtos.HourlyResponse("open-meteo", false, points);
        } catch (RuntimeException ex) {
            return demoHourly();
        }
    }

    private String dailyUrl(double lat, double lng) {
        return UriComponentsBuilder.fromUriString("https://api.open-meteo.com/v1/forecast")
                .queryParam("latitude", lat)
                .queryParam("longitude", lng)
                .queryParam("daily", "precipitation_sum")
                .queryParam("timezone", "Africa/Lome")
                .queryParam("forecast_days", 7)
                .build()
                .toUriString();
    }

    private String hourlyUrl(double lat, double lng) {
        return UriComponentsBuilder.fromUriString("https://api.open-meteo.com/v1/forecast")
                .queryParam("latitude", lat)
                .queryParam("longitude", lng)
                .queryParam("hourly", "precipitation")
                .queryParam("timezone", "Africa/Lome")
                .queryParam("forecast_hours", 24)
                .build()
                .toUriString();
    }

    private Dtos.WeatherResponse demoDaily(double lat, double lng) {
        List<Dtos.WeatherDay> days = List.of(
                new Dtos.WeatherDay("2026-10-08", "Mer", 4, false),
                new Dtos.WeatherDay("2026-10-09", "Jeu", 12, false),
                new Dtos.WeatherDay("2026-10-10", "Ven", 38, false),
                new Dtos.WeatherDay("2026-10-11", "Sam", 71, false),
                new Dtos.WeatherDay("2026-10-12", "Dim", 22, true),
                new Dtos.WeatherDay("2026-10-13", "Lun", 96, true),
                new Dtos.WeatherDay("2026-10-14", "Mar", 58, true)
        );
        return new Dtos.WeatherResponse(lat, lng, "demo", true, days);
    }

    private Dtos.HourlyResponse demoHourly() {
        return new Dtos.HourlyResponse("demo", true, List.of(
                new Dtos.RainPoint(18, 4),
                new Dtos.RainPoint(19, 12),
                new Dtos.RainPoint(20, 22),
                new Dtos.RainPoint(21, 18),
                new Dtos.RainPoint(22, 9),
                new Dtos.RainPoint(23, 3)
        ));
    }
}
