package com.project.ivr.repository;

import com.project.ivr.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Optional<Appointment> findByTokenId(Long tokenId);
    List<Appointment> findByAppointmentDate(LocalDate date);
    List<Appointment> findByHospitalIdAndAppointmentDate(Long hospitalId, LocalDate date);
    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(Long patientId);
}
