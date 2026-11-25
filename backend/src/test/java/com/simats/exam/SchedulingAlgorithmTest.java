package com.simats.exam;

import com.simats.exam.algorithm.ConflictGraph;
import com.simats.exam.algorithm.DsaturScheduler;
import com.simats.exam.algorithm.ScheduleValidator;
import com.simats.exam.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

public class SchedulingAlgorithmTest {

    private Course course1;
    private Course course2;
    private Course course3;

    private Examination exam1;
    private Examination exam2;
    private Examination exam3;

    private Student student1;
    private Student student2;
    private Student student3;
    private Student student4;

    private TimeSlot slot1;
    private TimeSlot slot2;

    private Room roomA; // Cap: 50
    private Room roomB; // Cap: 30

    private Faculty faculty1;
    private Faculty faculty2;

    private TimetableSchedule testSchedule;

    @BeforeEach
    void setUp() {
        course1 = new Course("CSA1016", "Software Engineering", "IT", 5, 4);
        course1.setId(1L);
        course2 = new Course("IT201", "Computer Networks", "IT", 5, 3);
        course2.setId(2L);
        course3 = new Course("CS101", "Data Structures", "CSE", 3, 4);
        course3.setId(3L);

        exam1 = new Examination(course1, "EXAM-1", "Software Engineering", "END_SEMESTER", 180, 2);
        exam1.setId(101L);
        exam2 = new Examination(course2, "EXAM-2", "Computer Networks", "END_SEMESTER", 180, 2);
        exam2.setId(102L);
        exam3 = new Examination(course3, "EXAM-3", "Data Structures", "END_SEMESTER", 180, 2);
        exam3.setId(103L);

        student1 = new Student("192425356", "Thanuja", "thanuja@simats.edu", "IT", 5, "2026-2027");
        student1.setId(1L);
        student2 = new Student("192520032", "Sai Pavani", "pavani@simats.edu", "IT", 5, "2026-2027");
        student2.setId(2L);
        student3 = new Student("192472372", "Varshini", "varshini@simats.edu", "IT", 5, "2026-2027");
        student3.setId(3L);
        student4 = new Student("192400004", "External Student", "ext@simats.edu", "CSE", 3, "2026-2027");
        student4.setId(4L);

        slot1 = new TimeSlot("Slot 1 (FN)", LocalDate.of(2026, 11, 25), LocalTime.of(9, 0), LocalTime.of(12, 0), "FORENOON", 1);
        slot1.setId(1L);
        slot2 = new TimeSlot("Slot 2 (Day 2 FN)", LocalDate.of(2026, 11, 26), LocalTime.of(9, 0), LocalTime.of(12, 0), "FORENOON", 2);
        slot2.setId(2L);

        roomA = new Room("HALL-A", "Main Block", 50, "EXAM_HALL", true, true);
        roomA.setId(1L);
        roomB = new Room("LAB-B", "IT Block", 30, "COMPUTER_LAB", true, true);
        roomB.setId(2L);

        faculty1 = new Faculty("FAC-01", "Dr. Charlyn Pusha Latha", "IT", "Professor", "charlyn@simats.edu", "98401", 2);
        faculty1.setId(1L);
        faculty2 = new Faculty("FAC-02", "Dr. Ramesh Kumar", "CSE", "Professor", "ramesh@simats.edu", "98402", 2);
        faculty2.setId(2L);

        testSchedule = new TimetableSchedule("Test Schedule", "2026-2027", 5, "GENERATED");
        testSchedule.setId(1L);
    }

    @Test
    @DisplayName("Test 1: Conflict Graph Construction & Student Conflict Detection")
    void testStudentConflictDetection() {
        // Course 1 has Student 1, 2. Course 2 has Student 2, 3. (Student 2 is shared)
        Map<Long, Set<Long>> courseStudentMap = new HashMap<>();
        courseStudentMap.put(1L, Set.of(1L, 2L));
        courseStudentMap.put(2L, Set.of(2L, 3L));

        Map<Long, Student> studentMap = Map.of(1L, student1, 2L, student2, 3L, student3);

        ConflictGraph graph = new ConflictGraph(List.of(exam1, exam2), courseStudentMap, studentMap);

        assertTrue(graph.hasConflict(exam1.getId(), exam2.getId()), "Exam 1 and Exam 2 must have a conflict edge due to shared student");
        assertEquals(1, graph.getSharedCount(exam1.getId(), exam2.getId()), "Shared student count should be 1");
        assertTrue(graph.getSharedStudentIds(exam1.getId(), exam2.getId()).contains(2L), "Shared student should be student 2 (Sai Pavani)");

        // Run DSATUR: They must be assigned to DIFFERENT time slots
        DsaturScheduler scheduler = new DsaturScheduler();
        DsaturScheduler.SchedulingResult result = scheduler.schedule(
                testSchedule, List.of(exam1, exam2), List.of(slot1, slot2),
                List.of(roomA, roomB), List.of(faculty1, faculty2),
                Collections.emptyList(), graph, studentMap, Collections.emptyMap()
        );

        assertEquals(2, result.items.size());
        ScheduleItem item1 = result.items.stream().filter(i -> i.getExamination().getId().equals(exam1.getId())).findFirst().orElseThrow();
        ScheduleItem item2 = result.items.stream().filter(i -> i.getExamination().getId().equals(exam2.getId())).findFirst().orElseThrow();

        assertNotEquals(item1.getTimeSlot().getId(), item2.getTimeSlot().getId(),
                "Examinations sharing students MUST NOT be assigned to the same time slot!");
    }

    @Test
    @DisplayName("Test 2: Disjoint Registrations Can Share Time Slot")
    void testNoConflictDisjointRegistrations() {
        // Course 1 has Student 1. Course 3 has Student 4. No shared students.
        Map<Long, Set<Long>> courseStudentMap = new HashMap<>();
        courseStudentMap.put(1L, Set.of(1L));
        courseStudentMap.put(3L, Set.of(4L));

        Map<Long, Student> studentMap = Map.of(1L, student1, 4L, student4);

        ConflictGraph graph = new ConflictGraph(List.of(exam1, exam3), courseStudentMap, studentMap);
        assertFalse(graph.hasConflict(exam1.getId(), exam3.getId()), "Disjoint exams should not have conflict");
        assertEquals(0, graph.getDegree(exam1.getId()));
    }

    @Test
    @DisplayName("Test 3: Room Capacity Validation Rejects Undersized Room")
    void testRoomCapacityStrictEnforcement() {
        // Room B has capacity 30. Exam 1 has 45 students.
        ScheduleItem item = new ScheduleItem(testSchedule, exam1, slot1, roomB, faculty1, 45, "SCHEDULED");

        Map<Long, Set<Long>> courseStudentMap = Map.of(1L, Set.of(1L, 2L));
        Map<Long, Student> studentMap = Map.of(1L, student1, 2L, student2);

        ScheduleValidator.ValidationReport report = ScheduleValidator.validate(
                testSchedule, List.of(item), courseStudentMap, studentMap, Collections.emptyList(), Collections.emptyMap()
        );

        assertFalse(report.isValid(), "Schedule must be invalid when room capacity is exceeded");
        assertEquals(1, report.getHardConflictCount());
        assertEquals("ROOM_CAPACITY_EXCEEDED", report.getConflicts().getFirst().getConflictType());
    }

    @Test
    @DisplayName("Test 4: Room Double-Booking Rejection")
    void testDuplicateRoomBookingDetection() {
        // Assign both exam 1 and exam 3 to Room A in Slot 1
        ScheduleItem item1 = new ScheduleItem(testSchedule, exam1, slot1, roomA, faculty1, 10, "SCHEDULED");
        ScheduleItem item2 = new ScheduleItem(testSchedule, exam3, slot1, roomA, faculty2, 15, "SCHEDULED");

        Map<Long, Set<Long>> courseStudentMap = Map.of(1L, Set.of(1L), 3L, Set.of(4L));
        Map<Long, Student> studentMap = Map.of(1L, student1, 4L, student4);

        ScheduleValidator.ValidationReport report = ScheduleValidator.validate(
                testSchedule, List.of(item1, item2), courseStudentMap, studentMap, Collections.emptyList(), Collections.emptyMap()
        );

        assertFalse(report.isValid(), "Room cannot be assigned to multiple exams in same slot");
        assertTrue(report.getConflicts().stream().anyMatch(c -> "ROOM_DOUBLE_BOOKING".equals(c.getConflictType())));
    }

    @Test
    @DisplayName("Test 5: Faculty Availability Enforcement")
    void testFacultyAvailabilityEnforcement() {
        // Faculty 1 is unavailable on 2026-11-25 during Slot 1
        FacultyUnavailability unav = new FacultyUnavailability(faculty1, slot1.getExamDate(), slot1, "Attending Conference");

        ScheduleItem item = new ScheduleItem(testSchedule, exam1, slot1, roomA, faculty1, 10, "SCHEDULED");

        ScheduleValidator.ValidationReport report = ScheduleValidator.validate(
                testSchedule, List.of(item), Map.of(1L, Set.of(1L)), Map.of(1L, student1),
                List.of(unav), Map.of("CHECK_FACULTY_AVAILABILITY", "true")
        );

        assertFalse(report.isValid(), "Faculty member is unavailable, must be flagged as conflict");
        assertTrue(report.getConflicts().stream().anyMatch(c -> "FACULTY_UNAVAILABLE".equals(c.getConflictType())));
    }

    @Test
    @DisplayName("Test 6: Faculty Overlap / Double-Booking Rejection")
    void testFacultyDoubleBookingDetection() {
        // Faculty 1 assigned to both exam 1 and exam 3 at the same time slot
        ScheduleItem item1 = new ScheduleItem(testSchedule, exam1, slot1, roomA, faculty1, 10, "SCHEDULED");
        ScheduleItem item2 = new ScheduleItem(testSchedule, exam3, slot1, roomB, faculty1, 15, "SCHEDULED");

        ScheduleValidator.ValidationReport report = ScheduleValidator.validate(
                testSchedule, List.of(item1, item2), Map.of(1L, Set.of(1L), 3L, Set.of(4L)),
                Map.of(1L, student1, 4L, student4), Collections.emptyList(), Collections.emptyMap()
        );

        assertFalse(report.isValid(), "Faculty cannot invigilate 2 rooms simultaneously");
        assertTrue(report.getConflicts().stream().anyMatch(c -> "FACULTY_OVERLAP".equals(c.getConflictType())));
    }

    @Test
    @DisplayName("Test 7: Manual Modification & Revalidation Workflow")
    void testTimetableManualModificationRevalidation() {
        // Valid baseline: Exam 1 in Slot 1 Room A; Exam 2 in Slot 2 Room B
        ScheduleItem item1 = new ScheduleItem(testSchedule, exam1, slot1, roomA, faculty1, 20, "SCHEDULED");
        ScheduleItem item2 = new ScheduleItem(testSchedule, exam2, slot2, roomB, faculty2, 20, "SCHEDULED");

        Map<Long, Set<Long>> courseStudentMap = Map.of(1L, Set.of(1L, 2L), 2L, Set.of(2L, 3L));
        Map<Long, Student> studentMap = Map.of(1L, student1, 2L, student2, 3L, student3);

        ScheduleValidator.ValidationReport reportInitial = ScheduleValidator.validate(
                testSchedule, List.of(item1, item2), courseStudentMap, studentMap, Collections.emptyList(), Collections.emptyMap()
        );
        assertTrue(reportInitial.isValid(), "Initial non-overlapping schedule must be valid");

        // Admin manually moves Exam 2 to Slot 1 (causing student overlap with Exam 1!)
        item2.setTimeSlot(slot1);

        ScheduleValidator.ValidationReport reportAfterEdit = ScheduleValidator.validate(
                testSchedule, List.of(item1, item2), courseStudentMap, studentMap, Collections.emptyList(), Collections.emptyMap()
        );
        assertFalse(reportAfterEdit.isValid(), "Revalidation must detect student overlap after manual edit");
        assertTrue(reportAfterEdit.getConflicts().stream().anyMatch(c -> "STUDENT_OVERLAP".equals(c.getConflictType())));

        // Admin moves Exam 2 back to Slot 2
        item2.setTimeSlot(slot2);
        ScheduleValidator.ValidationReport reportResolved = ScheduleValidator.validate(
                testSchedule, List.of(item1, item2), courseStudentMap, studentMap, Collections.emptyList(), Collections.emptyMap()
        );
        assertTrue(reportResolved.isValid(), "Revalidation must pass once manual clash is resolved");
    }
}
