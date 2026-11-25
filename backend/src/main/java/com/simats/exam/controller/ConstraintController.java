package com.simats.exam.controller;

import com.simats.exam.entity.SchedulingConstraint;
import com.simats.exam.service.ConstraintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/constraints")
public class ConstraintController {

    @Autowired
    private ConstraintService constraintService;

    @GetMapping
    public ResponseEntity<?> getAllConstraints() {
        return ResponseEntity.ok(constraintService.getAllConstraints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getConstraint(@PathVariable Long id) {
        return ResponseEntity.ok(constraintService.getConstraintById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateConstraint(@PathVariable Long id, @RequestBody SchedulingConstraint constraint) {
        try {
            return ResponseEntity.ok(constraintService.updateConstraint(id, constraint));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggleConstraint(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(constraintService.toggleConstraint(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

