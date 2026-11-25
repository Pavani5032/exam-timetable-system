package com.simats.exam.repository;

import com.simats.exam.entity.TimetableSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimetableScheduleRepository extends JpaRepository<TimetableSchedule, Long> {
    List<TimetableSchedule> findAllByOrderByCreatedAtDesc();
}

