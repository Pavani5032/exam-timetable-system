package com.simats.exam.config;

import com.simats.exam.service.DemoDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private DemoDataService demoDataService;

    @Override
    public void run(String... args) throws Exception {
        // Automatically check and seed if fresh database
        demoDataService.seedDemoData(false);
    }
}

