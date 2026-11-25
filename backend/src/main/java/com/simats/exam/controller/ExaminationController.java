package com.simats.exam.controller;

import com.simats.exam.entity.Examination;
import com.simats.exam.service.ExaminationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/examinations")
public class ExaminationController {

    @Autowired
    private ExaminationService examinationService;

    @GetMapping
    public ResponseEntity<?> getAllExaminations() {
        return ResponseEntity.ok(examinationService.getAllExaminations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getExamination(@PathVariable Long id) {
        return ResponseEntity.ok(examinationService.getExaminationById(id));
    }

    @PostMapping
    public ResponseEntity<?> createExamination(@RequestBody Examination examination) {
        try {
            return ResponseEntity.ok(examinationService.createExamination(examination));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExamination(@PathVariable Long id, @RequestBody Examination examination) {
        try {
            return ResponseEntity.ok(examinationService.updateExamination(id, examination));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExamination(@PathVariable Long id) {
        examinationService.deleteExamination(id);
        return ResponseEntity.ok(Map.of("message", "Examination deleted"));
    }
}

