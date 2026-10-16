package tg.edziinku.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tg.edziinku.dto.Dtos;
import tg.edziinku.service.CatalogService;
import tg.edziinku.service.TerritoryService;
import tg.edziinku.service.WeatherService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class CatalogController {

    private final CatalogService catalog;
    private final WeatherService weather;
    private final TerritoryService territory;

    public CatalogController(CatalogService catalog, WeatherService weather, TerritoryService territory) {
        this.catalog = catalog;
        this.weather = weather;
        this.territory = territory;
    }

    @GetMapping("/neighborhoods")
    List<Dtos.NeighborhoodCard> neighborhoods() {
        return catalog.neighborhoods();
    }

    @GetMapping("/neighborhoods/{id}")
    Dtos.NeighborhoodDetail neighborhood(@PathVariable UUID id) {
        return territory.neighborhoodDetail(id);
    }

    @GetMapping("/cities")
    List<Dtos.CityCard> cities() {
        return territory.publicCities();
    }

    @GetMapping("/urgency-levels")
    List<Dtos.UrgencyLevelCard> urgencyLevels() {
        return territory.publicUrgencies();
    }

    @GetMapping("/alerts")
    List<Dtos.AlertCard> alerts() {
        return catalog.alerts();
    }

    @GetMapping("/alerts/{id}")
    Dtos.AlertCard alert(@PathVariable UUID id) {
        return catalog.alert(id);
    }

    @GetMapping("/basins")
    List<Dtos.BasinCard> basins() {
        return catalog.basins();
    }

    @GetMapping("/geo/locate")
    Dtos.LocateResponse locate(@RequestParam double lat, @RequestParam double lng) {
        return catalog.locate(lat, lng);
    }

    @GetMapping("/weather/daily")
    Dtos.WeatherResponse daily(@RequestParam(required = false) Double lat, @RequestParam(required = false) Double lng) {
        return weather.daily(lat, lng);
    }

    @GetMapping("/weather/hourly")
    Dtos.HourlyResponse hourly(@RequestParam(required = false) Double lat, @RequestParam(required = false) Double lng) {
        return weather.hourly(lat, lng);
    }
}
