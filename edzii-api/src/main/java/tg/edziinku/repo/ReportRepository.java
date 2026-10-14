package tg.edziinku.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tg.edziinku.domain.Report;
import tg.edziinku.domain.ReportStatus;
import tg.edziinku.domain.WaterLevel;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, UUID> {

    List<Report> findByAuthor_IdOrderByCreatedAtDesc(UUID authorId);

    List<Report> findByIdIn(Collection<UUID> ids);

    @Query(
            value = """
                    SELECT r FROM Report r
                    LEFT JOIN r.neighborhood n
                    WHERE (:status IS NULL OR r.status = :status)
                      AND (:level IS NULL OR r.waterLevel = :level)
                      AND (:neighborhoodId IS NULL OR n.id = :neighborhoodId)
                      AND (
                        :q IS NULL
                        OR lower(r.reference) LIKE lower(concat('%', :q, '%'))
                        OR lower(r.placeLabel) LIKE lower(concat('%', :q, '%'))
                        OR lower(coalesce(n.name, '')) LIKE lower(concat('%', :q, '%'))
                      )
                    ORDER BY r.createdAt DESC
                    """,
            countQuery = """
                    SELECT count(r) FROM Report r
                    LEFT JOIN r.neighborhood n
                    WHERE (:status IS NULL OR r.status = :status)
                      AND (:level IS NULL OR r.waterLevel = :level)
                      AND (:neighborhoodId IS NULL OR n.id = :neighborhoodId)
                      AND (
                        :q IS NULL
                        OR lower(r.reference) LIKE lower(concat('%', :q, '%'))
                        OR lower(r.placeLabel) LIKE lower(concat('%', :q, '%'))
                        OR lower(coalesce(n.name, '')) LIKE lower(concat('%', :q, '%'))
                      )
                    """
    )
    Page<Report> search(
            @Param("status") ReportStatus status,
            @Param("level") WaterLevel level,
            @Param("neighborhoodId") UUID neighborhoodId,
            @Param("q") String q,
            Pageable pageable
    );

    long countByStatus(ReportStatus status);
}
