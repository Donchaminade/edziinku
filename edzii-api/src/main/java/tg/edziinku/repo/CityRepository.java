package tg.edziinku.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import tg.edziinku.domain.City;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CityRepository extends JpaRepository<City, UUID> {
    List<City> findAllByActiveTrueOrderByNameAsc();

    List<City> findAllByOrderByNameAsc();

    Optional<City> findBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, UUID id);

    boolean existsBySlug(String slug);
}
