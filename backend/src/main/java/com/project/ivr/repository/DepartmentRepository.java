package com.project.ivr.repository;

import com.project.ivr.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findAllByIsActiveTrue();
    Optional<Department> findByCode(String code);
}
