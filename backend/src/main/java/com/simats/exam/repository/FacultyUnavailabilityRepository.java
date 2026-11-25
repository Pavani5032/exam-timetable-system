package com.simats.exam.repository;

import com.simats.exam.entity.FacultyUnavailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FacultyUnavailabilityRepository extends JpaRepository<FacultyUnavailability, Long> {
    List<FacultyUnavailability> findByFacultyId(Long facultyId);
    List<FacultyUnavailability> findByUnavailableDate(LocalDate unavailableDate);
    boolean existsByFacultyIdAndUnavailableDateAndTimeSlotId(Long facultyId, LocalDate date, Long timeSlotId);
    boolean existsByFacultyIdAndUnavailableDateAndTimeSlotIsNull(Long facultyId, LocalDate date);
}

