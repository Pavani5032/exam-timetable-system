package com.simats.exam.service;

import com.simats.exam.entity.*;
import com.simats.exam.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
public class DemoDataService {

    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private CourseRepository courseRepository;
    @Autowired private StudentRegistrationRepository registrationRepository;
    @Autowired private ExaminationRepository examinationRepository;
    @Autowired private TimeSlotRepository timeSlotRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private FacultyRepository facultyRepository;
    @Autowired private FacultyUnavailabilityRepository unavailabilityRepository;
    @Autowired private SchedulingConstraintRepository constraintRepository;
    @Autowired private TimetableScheduleRepository scheduleRepository;
    @Autowired private ScheduleItemRepository itemRepository;
    @Autowired private ScheduleConflictRepository conflictRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Autowired @Lazy
    private ScheduleService scheduleService;

    @Transactional
    public void seedDemoData(boolean resetExisting) {
        if (resetExisting) {
            conflictRepository.deleteAll();
            itemRepository.deleteAll();
            scheduleRepository.deleteAll();
            unavailabilityRepository.deleteAll();
            registrationRepository.deleteAll();
            examinationRepository.deleteAll();
            timeSlotRepository.deleteAll();
            roomRepository.deleteAll();
            facultyRepository.deleteAll();
            courseRepository.deleteAll();
            studentRepository.deleteAll();
            constraintRepository.deleteAll();
            auditLogRepository.deleteAll();
        }

        // 1. Users
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User(
                    "admin",
                    passwordEncoder.encode("admin123"),
                    "SIMATS Exam Controller",
                    "coe@simats.edu.in",
                    "ROLE_ADMIN"
            );
            userRepository.save(admin);
        }

        // 2. Constraints
        createConstraintIfMissing("MAX_EXAMS_PER_STUDENT_PER_DAY", "Max Exams Per Student Per Day", "Limit number of exams any student can take in a single calendar day to avoid fatigue", "1", true, true);
        createConstraintIfMissing("ROOM_CAPACITY_STRICT", "Strict Room Capacity Check", "Enforce that room seating capacity must strictly equal or exceed candidate registrations", "true", true, true);
        createConstraintIfMissing("NO_FACULTY_OVERLAP", "Prevent Faculty Invigilation Overlap", "Disallow assigning the same faculty member to multiple concurrent examinations", "true", true, true);
        createConstraintIfMissing("CHECK_FACULTY_AVAILABILITY", "Respect Faculty Leave / Unavailability", "Strictly honor faculty recorded leave dates and unavailable time slots", "true", true, true);
        createConstraintIfMissing("MIN_HOURS_BETWEEN_EXAMS", "Minimum Hours Between Consecutive Exams", "Ensure adequate rest/travel gap between exam sessions", "2", false, true);
        createConstraintIfMissing("ALLOW_WEEKEND_EXAMS", "Allow Weekend Examination Slots", "Permit scheduling on Saturday and Sunday if time slots are constrained", "false", false, false);

        // 3. Courses
        Course csa1016 = getOrCreateCourse("CSA1016", "Software Engineering", "Information Technology", 5, 4);
        Course it201 = getOrCreateCourse("IT201", "Computer Networks", "Information Technology", 5, 3);
        Course it202 = getOrCreateCourse("IT202", "Web Technologies", "Information Technology", 5, 3);
        Course cs101 = getOrCreateCourse("CS101", "Data Structures & Algorithms", "Computer Science & Engineering", 3, 4);
        Course cs102 = getOrCreateCourse("CS102", "Database Management Systems", "Computer Science & Engineering", 3, 4);
        Course it301 = getOrCreateCourse("IT301", "Cloud Computing & Virtualization", "Information Technology", 7, 3);
        Course cs302 = getOrCreateCourse("CS302", "Operating Systems & Architecture", "Computer Science & Engineering", 5, 4);
        Course it401 = getOrCreateCourse("IT401", "Artificial Intelligence & Machine Learning", "Information Technology", 7, 4);

        // 4. Students
        List<Student> allStudents = new ArrayList<>();
        String[] itNames = {
                "M. Thanuja", "Dasari Sai Pavani", "P. Varshini", "Aarav Sharma", "Aditi Rao",
                "Akash Nair", "Ananya Reddy", "Bharath Kumar", "Bhavya Sri", "Chaitanya Krishna",
                "Deepika Menon", "Gautham Prakash", "Harini Venkat", "Ishan Verma", "Janani Raman",
                "Kavya Iyer", "Kiran Varma", "Lokesh Chandra", "Madhavi Latha", "Naveen Raj",
                "Pooja Hegde", "Rahul Pillai", "Rithika Sen", "Siddharth Jain", "Sneha Patel"
        };

        String[] csNames = {
                "Abhishek Bose", "Archana Murthy", "Arjun Das", "Divya Suresh", "Gokul Prasad",
                "Hemant Joshi", "Keerthi Suresh", "Manoj Tiwari", "Nandini Ghosh", "Pranav Swaminathan",
                "Praveen Teja", "Preethi Sundar", "Rohan Gupta", "Sandhya Mani", "Sanjay Dutt",
                "Sathish Anand", "Shreya Ghoshal", "Suraj Nambiar", "Swathi Mohan", "Vijay Sethupathi"
        };

        for (int i = 0; i < itNames.length; i++) {
            String roll = "1924" + String.format("%05d", 25350 + i);
            String name = itNames[i];
            Student st = getOrCreateStudent(roll, name, roll.toLowerCase() + "@saveetha.ac.in", "Information Technology", 5, "2026-2027");
            allStudents.add(st);

            // Register in IT core courses: CSA1016, IT201, IT202
            registerStudent(st, csa1016);
            registerStudent(st, it201);
            registerStudent(st, it202);

            // Cross-enroll 5 students into CS102 (Elective overlap)
            if (i < 5) {
                registerStudent(st, cs102);
            }
        }

        for (int i = 0; i < csNames.length; i++) {
            String roll = "1925" + String.format("%05d", 20030 + i);
            String name = csNames[i];
            Student st = getOrCreateStudent(roll, name, roll.toLowerCase() + "@saveetha.ac.in", "Computer Science & Engineering", 3, "2026-2027");
            allStudents.add(st);

            // Register in CSE core courses: CS101, CS102, CS302
            registerStudent(st, cs101);
            registerStudent(st, cs102);
            registerStudent(st, cs302);

            // Cross-enroll 4 students into IT301
            if (i < 4) {
                registerStudent(st, it301);
            }
        }

        // 5. Examinations
        createExamIfMissing(csa1016, "EXAM-CSA1016", "Software Engineering - End Sem", "END_SEMESTER", 180);
        createExamIfMissing(it201, "EXAM-IT201", "Computer Networks - End Sem", "END_SEMESTER", 180);
        createExamIfMissing(it202, "EXAM-IT202", "Web Technologies - End Sem", "END_SEMESTER", 180);
        createExamIfMissing(cs101, "EXAM-CS101", "Data Structures & Algorithms - End Sem", "END_SEMESTER", 180);
        createExamIfMissing(cs102, "EXAM-CS102", "Database Management Systems - End Sem", "END_SEMESTER", 180);
        createExamIfMissing(it301, "EXAM-IT301", "Cloud Computing - End Sem", "END_SEMESTER", 180);
        createExamIfMissing(cs302, "EXAM-CS302", "Operating Systems - End Sem", "END_SEMESTER", 180);
        createExamIfMissing(it401, "EXAM-IT401", "Artificial Intelligence - End Sem", "END_SEMESTER", 180);

        // Update student count on examinations
        for (Examination exam : examinationRepository.findAll()) {
            long count = registrationRepository.countByCourseId(exam.getCourse().getId());
            exam.setStudentCount((int) count);
            examinationRepository.save(exam);
        }

        // 6. Time Slots (Nov 25, 26, 27, 28, 2026)
        LocalDate day1 = LocalDate.of(2026, 11, 25);
        LocalDate day2 = LocalDate.of(2026, 11, 26);
        LocalDate day3 = LocalDate.of(2026, 11, 27);
        LocalDate day4 = LocalDate.of(2026, 11, 28);

        TimeSlot ts1 = getOrCreateSlot("Slot 1 (Day 1 - Forenoon)", day1, LocalTime.of(9, 0), LocalTime.of(12, 0), "FORENOON", 1);
        TimeSlot ts2 = getOrCreateSlot("Slot 2 (Day 1 - Afternoon)", day1, LocalTime.of(13, 30), LocalTime.of(16, 30), "AFTERNOON", 2);
        TimeSlot ts3 = getOrCreateSlot("Slot 3 (Day 2 - Forenoon)", day2, LocalTime.of(9, 0), LocalTime.of(12, 0), "FORENOON", 3);
        TimeSlot ts4 = getOrCreateSlot("Slot 4 (Day 2 - Afternoon)", day2, LocalTime.of(13, 30), LocalTime.of(16, 30), "AFTERNOON", 4);
        TimeSlot ts5 = getOrCreateSlot("Slot 5 (Day 3 - Forenoon)", day3, LocalTime.of(9, 0), LocalTime.of(12, 0), "FORENOON", 5);
        TimeSlot ts6 = getOrCreateSlot("Slot 6 (Day 3 - Afternoon)", day3, LocalTime.of(13, 30), LocalTime.of(16, 30), "AFTERNOON", 6);
        TimeSlot ts7 = getOrCreateSlot("Slot 7 (Day 4 - Forenoon)", day4, LocalTime.of(9, 0), LocalTime.of(12, 0), "FORENOON", 7);
        TimeSlot ts8 = getOrCreateSlot("Slot 8 (Day 4 - Afternoon)", day4, LocalTime.of(13, 30), LocalTime.of(16, 30), "AFTERNOON", 8);

        // 7. Rooms
        getOrCreateRoom("LH-101", "Academic Block A", 40, "LECTURE_HALL", true);
        getOrCreateRoom("LH-102", "Academic Block A", 35, "LECTURE_HALL", true);
        getOrCreateRoom("EXAM-HALL-1", "Main Examination Center", 60, "EXAM_HALL", true);
        getOrCreateRoom("EXAM-HALL-2", "Main Examination Center", 60, "EXAM_HALL", true);
        getOrCreateRoom("SEMINAR-HALL-A", "SIMATS Central Auditorium", 120, "SEMINAR_HALL", true);
        getOrCreateRoom("COMP-LAB-3", "IT Technology Block", 30, "COMPUTER_LAB", true);

        // 8. Faculty
        Faculty f1 = getOrCreateFaculty("FAC-IT-01", "Dr. Charlyn Pusha Latha", "Information Technology", "Professor", "charlyn@saveetha.ac.in", "9840123456", 2);
        Faculty f2 = getOrCreateFaculty("FAC-CS-01", "Dr. Ramesh Kumar", "Computer Science & Engineering", "Professor", "ramesh@saveetha.ac.in", "9840234567", 2);
        Faculty f3 = getOrCreateFaculty("FAC-IT-02", "Dr. Priya Dharshini", "Information Technology", "Associate Professor", "priya@saveetha.ac.in", "9840345678", 2);
        Faculty f4 = getOrCreateFaculty("FAC-CS-02", "Dr. Anand Raj", "Computer Science & Engineering", "Associate Professor", "anand@saveetha.ac.in", "9840456789", 2);
        Faculty f5 = getOrCreateFaculty("FAC-IT-03", "Prof. Meenakshi S", "Information Technology", "Assistant Professor", "meenakshi@saveetha.ac.in", "9840567890", 2);
        Faculty f6 = getOrCreateFaculty("FAC-CS-03", "Prof. Karthik N", "Computer Science & Engineering", "Assistant Professor", "karthik@saveetha.ac.in", "9840678901", 2);
        Faculty f7 = getOrCreateFaculty("FAC-IT-04", "Prof. Divya Bharathi", "Information Technology", "Assistant Professor", "divya@saveetha.ac.in", "9840789012", 2);

        // 9. Faculty Unavailability
        if (unavailabilityRepository.count() == 0) {
            unavailabilityRepository.save(new FacultyUnavailability(f2, day1, ts1, "Attending Doctoral Committee Meeting"));
            unavailabilityRepository.save(new FacultyUnavailability(f3, day2, ts4, "University Academic Council Duty"));
        }

        // 10. Audit Log
        auditLogRepository.save(new AuditLog("DEMO_DATA_INITIALIZED", "Realistic SIMATS Engineering dataset seeded successfully with students, courses, rooms, faculty, and constraints.", "SYSTEM"));

        // 11. Generate initial schedule using real DSATUR algorithm
        try {
            scheduleService.generateSchedule(
                    "Fall 2026 End-Semester Examination Schedule",
                    "2026-2027",
                    5,
                    "SYSTEM"
            );
        } catch (Exception e) {
            System.err.println("Initial schedule generation: " + e.getMessage());
        }
    }

    private void createConstraintIfMissing(String key, String name, String desc, String val, boolean hard, boolean enabled) {
        if (!constraintRepository.existsByConstraintKey(key)) {
            constraintRepository.save(new SchedulingConstraint(key, name, desc, val, hard, enabled));
        }
    }

    private Course getOrCreateCourse(String code, String title, String dept, int sem, int credits) {
        return courseRepository.findByCode(code).orElseGet(() ->
                courseRepository.save(new Course(code, title, dept, sem, credits)));
    }

    private Student getOrCreateStudent(String roll, String name, String email, String dept, int sem, String year) {
        return studentRepository.findByRollNumber(roll).orElseGet(() ->
                studentRepository.save(new Student(roll, name, email, dept, sem, year)));
    }

    private void registerStudent(Student st, Course c) {
        if (!registrationRepository.existsByStudentIdAndCourseId(st.getId(), c.getId())) {
            registrationRepository.save(new StudentRegistration(st, c, "2026-2027"));
        }
    }

    private void createExamIfMissing(Course c, String code, String title, String type, int duration) {
        if (!examinationRepository.existsByExamCode(code)) {
            examinationRepository.save(new Examination(c, code, title, type, duration, 0));
        }
    }

    private TimeSlot getOrCreateSlot(String name, LocalDate date, LocalTime start, LocalTime end, String session, int order) {
        return timeSlotRepository.findAll().stream()
                .filter(ts -> ts.getExamDate().equals(date) && ts.getSlotOrder().equals(order))
                .findFirst()
                .orElseGet(() -> timeSlotRepository.save(new TimeSlot(name, date, start, end, session, order)));
    }

    private Room getOrCreateRoom(String roomNo, String building, int capacity, String type, boolean active) {
        return roomRepository.findByRoomNumber(roomNo).orElseGet(() ->
                roomRepository.save(new Room(roomNo, building, capacity, type, true, active)));
    }

    private Faculty getOrCreateFaculty(String code, String name, String dept, String desig, String email, String phone, int maxDaily) {
        return facultyRepository.findByFacultyCode(code).orElseGet(() ->
                facultyRepository.save(new Faculty(code, name, dept, desig, email, phone, maxDaily)));
    }
}
