package tg.edziinku.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.edziinku.domain.UrgencyLevel;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UrgencyLevelRepository extends JpaRepository<UrgencyLevel, UUID> {
    List<UrgencyLevel> findAllByActiveTrueOrderByRankAsc();

    List<UrgencyLevel> findAllByOrderByRankAsc();

    Optional<UrgencyLevel> findBySlug(String slug);

    Optional<UrgencyLevel> findByRank(int rank);

    boolean existsByRankAndIdNot(int rank, UUID id);

    boolean existsBySlugAndIdNot(String slug, UUID id);

    boolean existsBySlug(String slug);

    boolean existsByRank(int rank);
}
