package tg.edziinku.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.edziinku.domain.Basin;

import java.util.List;
import java.util.UUID;

public interface BasinRepository extends JpaRepository<Basin, UUID> {
    List<Basin> findAllByOrderByObstructionPctDesc();
}
