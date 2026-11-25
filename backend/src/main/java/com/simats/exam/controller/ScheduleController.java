package com.simats.exam.controller;

import com.simats.exam.service.ExportService;
import com.simats.exam.service.ScheduleService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    @Autowired private ScheduleService scheduleService;
    @Autowired private ExportService exportService;

    @GetMapping
    public ResponseEntity<?> getAllSchedules() {
        return ResponseEntity.ok(scheduleService.getAllSchedules());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSchedule(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getScheduleById(id));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<?> getScheduleItems(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getScheduleItems(id));
    }

    @GetMapping("/{id}/conflicts")
    public ResponseEntity<?> getScheduleConflicts(@PathVariable Long id) {
        return ResponseEntity.ok(scheduleService.getScheduleConflicts(id));
    }

    @GetMapping("/graph")
    public ResponseEntity<?> getConflictGraph() {
        return ResponseEntity.ok(scheduleService.getConflictGraphData());
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateSchedule(@RequestBody(required = false) Map<String, Object> req, Authentication auth) {
        try {
            String title = req != null && req.get("title") != null ? req.get("title").toString() : null;
            String academicYear = req != null && req.get("academicYear") != null ? req.get("academicYear").toString() : "2026-2027";
            Integer semester = req != null && req.get("semester") != null ? Integer.valueOf(req.get("semester").toString()) : 5;
            String user = auth != null ? auth.getName() : "ADMIN";

            return ResponseEntity.ok(scheduleService.generateSchedule(title, academicYear, semester, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/items/{itemId}")
    public ResponseEntity<?> editScheduleItem(
            @PathVariable Long id,
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> req,
            Authentication auth
    ) {
        try {
            Long newSlotId = req.get("timeSlotId") != null ? Long.valueOf(req.get("timeSlotId").toString()) : null;
            Long newRoomId = req.get("roomId") != null ? Long.valueOf(req.get("roomId").toString()) : null;
            Long newFacultyId = req.get("facultyId") != null ? Long.valueOf(req.get("facultyId").toString()) : null;
            String user = auth != null ? auth.getName() : "ADMIN";

            return ResponseEntity.ok(scheduleService.editScheduleItem(id, itemId, newSlotId, newRoomId, newFacultyId, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/revalidate")
    public ResponseEntity<?> revalidateSchedule(@PathVariable Long id, Authentication auth) {
        try {
            String user = auth != null ? auth.getName() : "ADMIN";
            return ResponseEntity.ok(scheduleService.revalidateSchedule(id, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publishSchedule(@PathVariable Long id, Authentication auth) {
        try {
            String user = auth != null ? auth.getName() : "ADMIN";
            return ResponseEntity.ok(scheduleService.publishSchedule(id, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/unpublish")
    public ResponseEntity<?> unpublishSchedule(@PathVariable Long id, Authentication auth) {
        try {
            String user = auth != null ? auth.getName() : "ADMIN";
            return ResponseEntity.ok(scheduleService.unpublishSchedule(id, user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok(Map.of("message", "Schedule deleted"));
    }

    @GetMapping("/export/{id}/csv")
    public void exportScheduleCsv(@PathVariable Long id, HttpServletResponse response) {
        try {
            response.setContentType("text/csv");
            response.setHeader("Content-Disposition", "attachment; filename=\"examination_timetable_" + id + ".csv\"");
            exportService.exportScheduleCsv(id, response.getOutputStream());
        } catch (Exception e) {
            response.setStatus(500);
        }
    }

    @GetMapping("/export/{id}/conflicts-csv")
    public void exportConflictsCsv(@PathVariable Long id, HttpServletResponse response) {
        try {
            response.setContentType("text/csv");
            response.setHeader("Content-Disposition", "attachment; filename=\"conflict_report_" + id + ".csv\"");
            exportService.exportConflictsCsv(id, response.getOutputStream());
        } catch (Exception e) {
            response.setStatus(500);
        }
    }

    @GetMapping("/export/{id}/pdf")
    public void exportSchedulePdf(@PathVariable Long id, HttpServletResponse response) {
        try {
            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "inline; filename=\"examination_timetable_" + id + ".pdf\"");
            exportService.exportSchedulePdf(id, response.getOutputStream());
        } catch (Exception e) {
            response.setStatus(500);
        }
    }
}

