package com.project.ivr.repository;

import com.project.ivr.entity.Token;
import com.project.ivr.entity.TokenStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {

    List<Token> findByBookingDate(LocalDate bookingDate);

    List<Token> findByHospitalIdAndBookingDate(Long hospitalId, LocalDate bookingDate);

    List<Token> findByHospitalIdAndDepartmentIdAndBookingDate(Long hospitalId, Long departmentId, LocalDate bookingDate);

    List<Token> findByPatientIdAndBookingDateAndStatusIn(Long patientId, LocalDate bookingDate, Collection<TokenStatus> statuses);

    List<Token> findByPatientIdOrderByBookingDateDesc(Long patientId);

    Optional<Token> findByTokenNumberAndBookingDate(String tokenNumber, LocalDate bookingDate);

    Optional<Token> findByHospitalIdAndDepartmentIdAndBookingDateAndTokenNumber(Long hospitalId, Long departmentId, LocalDate bookingDate, String tokenNumber);

    @Query("SELECT t FROM Token t WHERE t.patient.mobileNumber = :mobileNumber AND t.status IN :statuses ORDER BY t.bookingDate DESC, t.bookingTime DESC")
    List<Token> findActiveTokensByMobile(@Param("mobileNumber") String mobileNumber, @Param("statuses") Collection<TokenStatus> statuses);

    @Query("SELECT t FROM Token t WHERE t.patient.mobileNumber = :mobileNumber AND (t.tokenNumber = :tokenNumber OR t.tokenNumber LIKE CONCAT('%', :tokenNumber)) AND t.status IN :statuses")
    List<Token> findActiveByMobileAndTokenSuffix(@Param("mobileNumber") String mobileNumber, @Param("tokenNumber") String tokenNumber, @Param("statuses") Collection<TokenStatus> statuses);

    long countByBookingDate(LocalDate bookingDate);

    long countByBookingDateAndStatus(LocalDate bookingDate, TokenStatus status);

    long countByHospitalIdAndBookingDate(Long hospitalId, LocalDate bookingDate);

    long countByHospitalIdAndBookingDateAndStatus(Long hospitalId, LocalDate bookingDate, TokenStatus status);

    Page<Token> findAllByOrderByBookingDateDescBookingTimeDesc(Pageable pageable);

    @Query("SELECT t.department.name, COUNT(t) FROM Token t WHERE t.bookingDate = :date GROUP BY t.department.name")
    List<Object[]> countTokensByDepartmentForDate(@Param("date") LocalDate date);

    @Query("SELECT t.hospital.name, COUNT(t) FROM Token t WHERE t.bookingDate = :date GROUP BY t.hospital.name")
    List<Object[]> countTokensByHospitalForDate(@Param("date") LocalDate date);
}
