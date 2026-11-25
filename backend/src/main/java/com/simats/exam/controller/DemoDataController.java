package com.simats.exam.controller;

import com.simats.exam.service.DemoDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/demo")
public class DemoDataController {

    @Autowired
    private DemoDataService demoDataService;

    @PostMapping("/reset")
    public ResponseEntity<?> resetDemoData() {
        try {
            demoDataService.seedDemoData(true);
            return ResponseEntity.ok(Map.of("message", "Demo dataset has been reset and reseeded successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

