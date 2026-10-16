package tg.edziinku.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tg.edziinku.domain.Neighborhood;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NeighborhoodRepository extends JpaRepository<Neighborhood, UUID> {
    List<Neighborhood> findAllByOrderByNameAsc();

    Optional<Neighborhood> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, UUID id);

    long countByCity_Id(UUID cityId);

    long countByUrgencyLevel_Id(UUID urgencyLevelId);

    @Query("""
            SELECT DISTINCT n FROM Neighborhood n
            LEFT JOIN FETCH n.city
            LEFT JOIN FETCH n.urgencyLevel
            WHERE n.active = true
            ORDER BY n.name ASC
            """)
    List<Neighborhood> findPublicCatalog();

    @Query("""
            SELECT DISTINCT n FROM Neighborhood n
            LEFT JOIN FETCH n.city
            LEFT JOIN FETCH n.urgencyLevel
            ORDER BY n.name ASC
            """)
    List<Neighborhood> findAdminCatalog();

    @Query("""
            SELECT DISTINCT n FROM Neighborhood n
            LEFT JOIN FETCH n.city
            LEFT JOIN FETCH n.urgencyLevel
            WHERE n.id = :id
            """)
    Optional<Neighborhood> findDetailedById(@Param("id") UUID id);
}
