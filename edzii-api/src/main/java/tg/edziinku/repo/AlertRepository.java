package tg.edziinku.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.edziinku.domain.Alert;

import java.util.List;
import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findAllByOrderByCreatedAtDesc();

    long countByNeighborhood_Id(UUID neighborhoodId);
}
