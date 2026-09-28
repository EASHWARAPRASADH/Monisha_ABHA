package com.project.ivr.repository;

import com.project.ivr.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    List<Hospital> findAllByIsActiveTrue();
    Optional<Hospital> findByCode(String code);
    Optional<Hospital> findByNameIgnoreCase(String name);
}
