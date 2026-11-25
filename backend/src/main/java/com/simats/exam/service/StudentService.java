package com.simats.exam.service;

import com.simats.exam.entity.Course;
import com.simats.exam.entity.Student;
import com.simats.exam.entity.StudentRegistration;
import com.simats.exam.repository.CourseRepository;
import com.simats.exam.repository.ExaminationRepository;
import com.simats.exam.repository.StudentRegistrationRepository;
import com.simats.exam.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class StudentService {

    @Autowired private StudentRepository studentRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private StudentRegistrationRepository registrationRepository;
    @Autowired private ExaminationRepository examinationRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Student getStudentById(Long id) {
        return studentRepository.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Student createStudent(Student student) {
        if (studentRepository.existsByRollNumber(student.getRollNumber())) {
            throw new RuntimeException("Student with roll number " + student.getRollNumber() + " already exists");
        }
        return studentRepository.save(student);
    }

    public Student updateStudent(Long id, Student updated) {
        Student existing = getStudentById(id);
        existing.setName(updated.getName());
        existing.setEmail(updated.getEmail());
        existing.setDepartment(updated.getDepartment());
        existing.setSemester(updated.getSemester());
        existing.setAcademicYear(updated.getAcademicYear());
        return studentRepository.save(existing);
    }

    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }

    // Registrations
    public List<StudentRegistration> getRegistrationsByStudent(Long studentId) {
        return registrationRepository.findByStudentId(studentId);
    }

    public List<StudentRegistration> getRegistrationsByCourse(Long courseId) {
        return registrationRepository.findByCourseId(courseId);
    }

    @Transactional
    public StudentRegistration registerStudent(Long studentId, Long courseId, String academicYear) {
        Student st = getStudentById(studentId);
        Course c = courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found"));

        if (registrationRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new RuntimeException("Student is already registered for this course");
        }

        StudentRegistration reg = new StudentRegistration(st, c, academicYear != null ? academicYear : "2026-2027");
        StudentRegistration saved = registrationRepository.save(reg);

        // Update exam count
        updateExamStudentCount(courseId);
        return saved;
    }

    @Transactional
    public void deleteRegistration(Long registrationId) {
        StudentRegistration reg = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        Long courseId = reg.getCourse().getId();
        registrationRepository.delete(reg);
        updateExamStudentCount(courseId);
    }

    private void updateExamStudentCount(Long courseId) {
        examinationRepository.findByCourseId(courseId).forEach(exam -> {
            exam.setStudentCount((int) registrationRepository.countByCourseId(courseId));
            examinationRepository.save(exam);
        });
    }
}

