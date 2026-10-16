package tg.edziinku.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.edziinku.domain.WhatsAppContact;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WhatsAppContactRepository extends JpaRepository<WhatsAppContact, UUID> {
    Optional<WhatsAppContact> findByWaId(String waId);
    List<WhatsAppContact> findByActiveTrueAndNeighborhood_Id(UUID neighborhoodId);
    List<WhatsAppContact> findByActiveTrueAndNeighborhood_IdIn(Collection<UUID> neighborhoodIds);
}
