package tg.edziinku.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.edziinku.domain.NotificationPreference;

import java.util.UUID;

public interface PreferenceRepository extends JpaRepository<NotificationPreference, UUID> {
}
