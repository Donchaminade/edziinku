package tg.edziinku.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.edziinku.domain.FieldTeam;

import java.util.UUID;

public interface FieldTeamRepository extends JpaRepository<FieldTeam, UUID> {
}
