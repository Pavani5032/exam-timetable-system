package com.simats.exam.repository;

import com.simats.exam.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    Optional<Faculty> findByFacultyCode(String facultyCode);
    boolean existsByFacultyCode(String facultyCode);
    List<Faculty> findByDepartment(String department);
}

