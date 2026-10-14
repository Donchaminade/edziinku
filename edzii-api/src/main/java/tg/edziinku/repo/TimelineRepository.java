package tg.edziinku.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.edziinku.domain.TimelineEvent;

import java.util.List;
import java.util.UUID;

public interface TimelineRepository extends JpaRepository<TimelineEvent, UUID> {
    List<TimelineEvent> findAllByOrderByOccurredAtDesc();
}
