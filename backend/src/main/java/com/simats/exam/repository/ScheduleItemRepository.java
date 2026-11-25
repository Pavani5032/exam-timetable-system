package com.simats.exam.repository;

import com.simats.exam.entity.ScheduleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScheduleItemRepository extends JpaRepository<ScheduleItem, Long> {
    List<ScheduleItem> findByScheduleId(Long scheduleId);
    List<ScheduleItem> findByScheduleIdAndTimeSlotId(Long scheduleId, Long timeSlotId);
    List<ScheduleItem> findByScheduleIdAndRoomId(Long scheduleId, Long roomId);
    List<ScheduleItem> findByScheduleIdAndFacultyId(Long scheduleId, Long facultyId);
    void deleteByScheduleId(Long scheduleId);
}

