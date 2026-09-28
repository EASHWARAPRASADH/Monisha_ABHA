package com.project.ivr.repository;

import com.project.ivr.entity.HospitalDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface HospitalDepartmentRepository extends JpaRepository<HospitalDepartment, Long> {
    List<HospitalDepartment> findByHospitalIdAndIsActiveTrue(Long hospitalId);
    Optional<HospitalDepartment> findByHospitalIdAndDepartmentId(Long hospitalId, Long departmentId);
    Optional<HospitalDepartment> findByHospitalIdAndDepartmentCode(Long hospitalId, String departmentCode);
}
