package com.simats.exam.controller;

import com.simats.exam.entity.TimeSlot;
import com.simats.exam.service.TimeSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/timeslots")
public class TimeSlotController {

    @Autowired
    private TimeSlotService timeSlotService;

    @GetMapping
    public ResponseEntity<?> getAllTimeSlots(@RequestParam(required = false) String date) {
        if (date != null && !date.isBlank()) {
            return ResponseEntity.ok(timeSlotService.getTimeSlotsByDate(LocalDate.parse(date)));
        }
        return ResponseEntity.ok(timeSlotService.getAllTimeSlots());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTimeSlot(@PathVariable Long id) {
        return ResponseEntity.ok(timeSlotService.getTimeSlotById(id));
    }

    @PostMapping
    public ResponseEntity<?> createTimeSlot(@RequestBody TimeSlot slot) {
        try {
            return ResponseEntity.ok(timeSlotService.createTimeSlot(slot));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTimeSlot(@PathVariable Long id, @RequestBody TimeSlot slot) {
        try {
            return ResponseEntity.ok(timeSlotService.updateTimeSlot(id, slot));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTimeSlot(@PathVariable Long id) {
        timeSlotService.deleteTimeSlot(id);
        return ResponseEntity.ok(Map.of("message", "TimeSlot deleted"));
    }
}

