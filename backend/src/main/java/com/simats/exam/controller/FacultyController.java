package com.simats.exam.controller;

import com.simats.exam.entity.Faculty;
import com.simats.exam.service.FacultyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    @Autowired
    private FacultyService facultyService;

    @GetMapping
    public ResponseEntity<?> getAllFaculty() {
        return ResponseEntity.ok(facultyService.getAllFaculty());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFaculty(@PathVariable Long id) {
        return ResponseEntity.ok(facultyService.getFacultyById(id));
    }

    @PostMapping
    public ResponseEntity<?> createFaculty(@RequestBody Faculty faculty) {
        try {
            return ResponseEntity.ok(facultyService.createFaculty(faculty));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFaculty(@PathVariable Long id, @RequestBody Faculty faculty) {
        try {
            return ResponseEntity.ok(facultyService.updateFaculty(id, faculty));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFaculty(@PathVariable Long id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.ok(Map.of("message", "Faculty deleted"));
    }

    // Unavailability
    @GetMapping("/unavailability")
    public ResponseEntity<?> getAllUnavailabilities() {
        return ResponseEntity.ok(facultyService.getAllUnavailabilities());
    }

    @GetMapping("/{id}/unavailability")
    public ResponseEntity<?> getFacultyUnavailabilities(@PathVariable Long id) {
        return ResponseEntity.ok(facultyService.getUnavailabilityByFaculty(id));
    }

    @PostMapping("/unavailability")
    public ResponseEntity<?> addUnavailability(@RequestBody Map<String, Object> req) {
        try {
            Long facultyId = Long.valueOf(req.get("facultyId").toString());
            LocalDate date = LocalDate.parse(req.get("unavailableDate").toString());
            Long slotId = req.get("timeSlotId") != null ? Long.valueOf(req.get("timeSlotId").toString()) : null;
            String reason = (String) req.get("reason");
            return ResponseEntity.ok(facultyService.addUnavailability(facultyId, date, slotId, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/unavailability/{id}")
    public ResponseEntity<?> deleteUnavailability(@PathVariable Long id) {
        facultyService.deleteUnavailability(id);
        return ResponseEntity.ok(Map.of("message", "Unavailability record removed"));
    }
}

