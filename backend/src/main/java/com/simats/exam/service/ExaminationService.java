package com.simats.exam.service;

import com.simats.exam.entity.Course;
import com.simats.exam.entity.Examination;
import com.simats.exam.repository.CourseRepository;
import com.simats.exam.repository.ExaminationRepository;
import com.simats.exam.repository.StudentRegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExaminationService {

    @Autowired
    private ExaminationRepository examinationRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StudentRegistrationRepository registrationRepository;

    public List<Examination> getAllExaminations() {
        return examinationRepository.findAll();
    }

    public Examination getExaminationById(Long id) {
        return examinationRepository.findById(id).orElseThrow(() -> new RuntimeException("Examination not found: " + id));
    }

    public Examination createExamination(Examination examination) {
        if (examinationRepository.existsByExamCode(examination.getExamCode())) {
            throw new RuntimeException("Exam code " + examination.getExamCode() + " already exists");
        }
        Course course = courseRepository.findById(examination.getCourse().getId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        examination.setCourse(course);
        int count = (int) registrationRepository.countByCourseId(course.getId());
        examination.setStudentCount(count);
        return examinationRepository.save(examination);
    }

    public Examination updateExamination(Long id, Examination updated) {
        Examination existing = getExaminationById(id);
        existing.setTitle(updated.getTitle());
        existing.setExamType(updated.getExamType());
        existing.setDurationMinutes(updated.getDurationMinutes());
        int count = (int) registrationRepository.countByCourseId(existing.getCourse().getId());
        existing.setStudentCount(count);
        return examinationRepository.save(existing);
    }

    public void deleteExamination(Long id) {
        examinationRepository.deleteById(id);
    }
}

