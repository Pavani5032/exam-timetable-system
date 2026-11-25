package com.simats.exam.repository;

import com.simats.exam.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {
    List<TimeSlot> findByExamDate(LocalDate examDate);
    List<TimeSlot> findAllByOrderByExamDateAscStartTimeAsc();
}

