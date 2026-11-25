package com.simats.exam.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaForwardController {

    @RequestMapping(value = {
            "/login",
            "/dashboard",
            "/timetable",
            "/conflicts",
            "/publish",
            "/students",
            "/courses",
            "/examinations",
            "/rooms",
            "/faculty",
            "/constraints",
            "/generator"
    })
    public String forwardToSpa() {
        return "forward:/index.html";
    }
}

