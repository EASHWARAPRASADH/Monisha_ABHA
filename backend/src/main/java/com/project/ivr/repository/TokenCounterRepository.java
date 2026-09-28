package com.project.ivr.repository;

import com.project.ivr.entity.TokenCounter;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TokenCounterRepository extends JpaRepository<TokenCounter, Long> {

    Optional<TokenCounter> findByHospitalIdAndDepartmentIdAndCounterDate(Long hospitalId, Long departmentId, LocalDate counterDate);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT tc FROM TokenCounter tc WHERE tc.hospital.id = :hospitalId AND tc.department.id = :departmentId AND tc.counterDate = :counterDate")
    Optional<TokenCounter> findWithLock(@Param("hospitalId") Long hospitalId,
                                        @Param("departmentId") Long departmentId,
                                        @Param("counterDate") LocalDate counterDate);
}
