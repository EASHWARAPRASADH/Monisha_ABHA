package com.project.ivr.repository;

import com.project.ivr.entity.AbhaProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AbhaProfileRepository extends JpaRepository<AbhaProfile, Long> {
    Optional<AbhaProfile> findByAbhaId(String abhaId);
    Optional<AbhaProfile> findByMobileNumber(String mobileNumber);
}
