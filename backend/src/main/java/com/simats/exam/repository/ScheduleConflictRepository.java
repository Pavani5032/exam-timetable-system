package com.simats.exam.repository;

import com.simats.exam.entity.ScheduleConflict;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScheduleConflictRepository extends JpaRepository<ScheduleConflict, Long> {
    List<ScheduleConflict> findByScheduleId(Long scheduleId);
    void deleteByScheduleId(Long scheduleId);
    long countByScheduleId(Long scheduleId);
}

