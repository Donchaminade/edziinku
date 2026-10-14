package tg.edziinku.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.edziinku.domain.CampaignSnapshot;

public interface CampaignSnapshotRepository extends JpaRepository<CampaignSnapshot, Integer> {
}
