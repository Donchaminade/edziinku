package tg.edziinku.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.edziinku.domain.OutboundMessage;

import java.util.List;
import java.util.UUID;

public interface OutboundMessageRepository extends JpaRepository<OutboundMessage, UUID> {
    List<OutboundMessage> findTop50ByOrderByCreatedAtDesc();
}
