package com.simats.exam.service;

import com.simats.exam.entity.TimeSlot;
import com.simats.exam.repository.TimeSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TimeSlotService {

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    public List<TimeSlot> getAllTimeSlots() {
        return timeSlotRepository.findAllByOrderByExamDateAscStartTimeAsc();
    }

    public TimeSlot getTimeSlotById(Long id) {
        return timeSlotRepository.findById(id).orElseThrow(() -> new RuntimeException("TimeSlot not found: " + id));
    }

    public List<TimeSlot> getTimeSlotsByDate(LocalDate date) {
        return timeSlotRepository.findByExamDate(date);
    }

    public TimeSlot createTimeSlot(TimeSlot slot) {
        return timeSlotRepository.save(slot);
    }

    public TimeSlot updateTimeSlot(Long id, TimeSlot updated) {
        TimeSlot existing = getTimeSlotById(id);
        existing.setSlotName(updated.getSlotName());
        existing.setExamDate(updated.getExamDate());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setSessionType(updated.getSessionType());
        existing.setSlotOrder(updated.getSlotOrder());
        return timeSlotRepository.save(existing);
    }

    public void deleteTimeSlot(Long id) {
        timeSlotRepository.deleteById(id);
    }
}

