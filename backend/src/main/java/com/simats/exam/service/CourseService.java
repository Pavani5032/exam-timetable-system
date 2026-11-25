package com.simats.exam.service;

import com.simats.exam.entity.Course;
import com.simats.exam.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found: " + id));
    }

    public Course createCourse(Course course) {
        if (courseRepository.existsByCode(course.getCode())) {
            throw new RuntimeException("Course with code " + course.getCode() + " already exists");
        }
        return courseRepository.save(course);
    }

    public Course updateCourse(Long id, Course updated) {
        Course existing = getCourseById(id);
        existing.setTitle(updated.getTitle());
        existing.setDepartment(updated.getDepartment());
        existing.setSemester(updated.getSemester());
        existing.setCredits(updated.getCredits());
        return courseRepository.save(existing);
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}

