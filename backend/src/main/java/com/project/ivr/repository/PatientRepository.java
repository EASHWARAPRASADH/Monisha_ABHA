package com.project.ivr.repository;

import com.project.ivr.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByMobileNumber(String mobileNumber);
    Optional<Patient> findByAbhaId(String abhaId);
    Boolean existsByMobileNumber(String mobileNumber);
}
