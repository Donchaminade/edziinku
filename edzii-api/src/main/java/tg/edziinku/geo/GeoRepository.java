package tg.edziinku.geo;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class GeoRepository {

    private final JdbcTemplate jdbc;

    public GeoRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<UUID> neighborhoodContaining(double latitude, double longitude) {
        List<UUID> ids = jdbc.query(
                """
                SELECT id FROM neighborhoods
                WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(?, ?), 4326))
                ORDER BY ST_Area(geom::geography) ASC
                LIMIT 1
                """,
                (rs, row) -> rs.getObject("id", UUID.class),
                longitude,
                latitude
        );
        return ids.stream().findFirst();
    }

    public List<UUID> validatedReportsNear(double latitude, double longitude, double radiusMeters) {
        return jdbc.query(
                """
                SELECT id FROM reports
                WHERE status = 'VALIDE'
                  AND ST_DWithin(
                        geom::geography,
                        ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
                        ?
                  )
                ORDER BY created_at DESC
                LIMIT 100
                """,
                (rs, row) -> rs.getObject("id", UUID.class),
                longitude,
                latitude,
                radiusMeters
        );
    }
}
