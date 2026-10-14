package tg.edziinku.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.edziinku.domain.UserAccount;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserAccount, UUID> {
    Optional<UserAccount> findByEmailIgnoreCase(String email);
    Optional<UserAccount> findByPhone(String phone);
    Optional<UserAccount> findByGoogleSub(String googleSub);
}
