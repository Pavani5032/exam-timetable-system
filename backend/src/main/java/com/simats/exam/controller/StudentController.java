package com.simats.exam.controller;

import com.simats.exam.entity.Student;
import com.simats.exam.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping
    public ResponseEntity<?> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PostMapping
    public ResponseEntity<?> createStudent(@RequestBody Student student) {
        try {
            return ResponseEntity.ok(studentService.createStudent(student));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Student student) {
        try {
            return ResponseEntity.ok(studentService.updateStudent(id, student));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(Map.of("message", "Student deleted"));
    }

    @GetMapping("/{id}/registrations")
    public ResponseEntity<?> getRegistrations(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getRegistrationsByStudent(id));
    }

    @PostMapping("/registrations")
    public ResponseEntity<?> registerStudent(@RequestBody Map<String, Object> req) {
        try {
            Long studentId = Long.valueOf(req.get("studentId").toString());
            Long courseId = Long.valueOf(req.get("courseId").toString());
            String academicYear = (String) req.getOrDefault("academicYear", "2026-2027");
            return ResponseEntity.ok(studentService.registerStudent(studentId, courseId, academicYear));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/registrations/{id}")
    public ResponseEntity<?> deleteRegistration(@PathVariable Long id) {
        studentService.deleteRegistration(id);
        return ResponseEntity.ok(Map.of("message", "Registration deleted"));
    }
}

