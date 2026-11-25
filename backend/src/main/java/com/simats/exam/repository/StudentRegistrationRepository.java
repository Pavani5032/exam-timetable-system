package com.simats.exam.repository;

import com.simats.exam.entity.StudentRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentRegistrationRepository extends JpaRepository<StudentRegistration, Long> {
    List<StudentRegistration> findByCourseId(Long courseId);
    List<StudentRegistration> findByStudentId(Long studentId);
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
    long countByCourseId(Long courseId);

    @Query("SELECT r.student.id FROM StudentRegistration r WHERE r.course.id = :courseId")
    List<Long> findStudentIdsByCourseId(@Param("courseId") Long courseId);
}

