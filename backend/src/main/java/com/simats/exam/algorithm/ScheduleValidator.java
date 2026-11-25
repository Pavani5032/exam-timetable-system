package com.simats.exam.algorithm;

import com.simats.exam.entity.*;

import java.time.LocalDate;
import java.util.*;

public class ScheduleValidator {

    public static class ValidationReport {
        private boolean isValid = true;
        private int hardConflictCount = 0;
        private int softConflictCount = 0;
        private List<ScheduleConflict> conflicts = new ArrayList<>();
        private Map<String, Object> details = new HashMap<>();

        public boolean isValid() { return isValid; }
        public void setValid(boolean valid) { isValid = valid; }

        public int getHardConflictCount() { return hardConflictCount; }
        public void setHardConflictCount(int hardConflictCount) { this.hardConflictCount = hardConflictCount; }

        public int getSoftConflictCount() { return softConflictCount; }
        public void setSoftConflictCount(int softConflictCount) { this.softConflictCount = softConflictCount; }

        public List<ScheduleConflict> getConflicts() { return conflicts; }
        public void setConflicts(List<ScheduleConflict> conflicts) { this.conflicts = conflicts; }

        public Map<String, Object> getDetails() { return details; }
        public void setDetails(Map<String, Object> details) { this.details = details; }
    }

    public static ValidationReport validate(
            TimetableSchedule schedule,
            List<ScheduleItem> items,
            Map<Long, Set<Long>> courseStudentIdsMap,
            Map<Long, Student> studentMap,
            List<FacultyUnavailability> unavailabilities,
            Map<String, String> constraintMap
    ) {
        ValidationReport report = new ValidationReport();

        int maxExamsPerDay = 1;
        try {
            if (constraintMap.containsKey("MAX_EXAMS_PER_STUDENT_PER_DAY")) {
                maxExamsPerDay = Integer.parseInt(constraintMap.get("MAX_EXAMS_PER_STUDENT_PER_DAY"));
            }
        } catch (Exception ignored) {}

        // 1. Group items by time slot
        Map<Long, List<ScheduleItem>> slotItemsMap = new HashMap<>();
        // 2. Track room bookings per time slot: slotId -> roomId -> List<ScheduleItem>
        Map<Long, Map<Long, List<ScheduleItem>>> slotRoomExams = new HashMap<>();
        // 3. Track faculty bookings per time slot: slotId -> facultyId -> List<ScheduleItem>
        Map<Long, Map<Long, List<ScheduleItem>>> slotFacultyExams = new HashMap<>();
        // 4. Track student daily exam counts: studentId -> date -> List<ScheduleItem>
        Map<Long, Map<LocalDate, List<ScheduleItem>>> studentDailyExams = new HashMap<>();

        for (ScheduleItem item : items) {
            TimeSlot slot = item.getTimeSlot();
            if (slot == null) {
                // Item is not scheduled!
                ScheduleConflict conflict = new ScheduleConflict(
                        schedule, "UNASSIGNED_EXAM", "HARD",
                        "Examination " + item.getExamination().getTitle() + " has no time slot assigned.",
                        item.getExamination(), null, null, null, null, null,
                        "Assign a feasible time slot using the timetable editor."
                );
                report.getConflicts().add(conflict);
                continue;
            }

            slotItemsMap.computeIfAbsent(slot.getId(), k -> new ArrayList<>()).add(item);

            if (item.getRoom() != null) {
                slotRoomExams.computeIfAbsent(slot.getId(), k -> new HashMap<>())
                        .computeIfAbsent(item.getRoom().getId(), k -> new ArrayList<>())
                        .add(item);

                // Room capacity check
                int registered = item.getStudentCount() > 0 ? item.getStudentCount() :
                        courseStudentIdsMap.getOrDefault(item.getExamination().getCourse().getId(), Collections.emptySet()).size();
                if (registered > item.getRoom().getCapacity()) {
                    ScheduleConflict conflict = new ScheduleConflict(
                            schedule, "ROOM_CAPACITY_EXCEEDED", "HARD",
                            "Room " + item.getRoom().getRoomNumber() + " capacity (" + item.getRoom().getCapacity() +
                                    ") is insufficient for " + item.getExamination().getTitle() + " (" + registered + " candidates).",
                            item.getExamination(), null, null, item.getRoom(), null, slot,
                            "Reallocate to a larger room (e.g., Seminar Hall or Lecture Hall) or shift slot."
                    );
                    report.getConflicts().add(conflict);
                }
            } else {
                ScheduleConflict conflict = new ScheduleConflict(
                        schedule, "UNASSIGNED_ROOM", "HARD",
                        "Examination " + item.getExamination().getTitle() + " has no examination room assigned.",
                        item.getExamination(), null, null, null, null, slot,
                        "Assign an available room with capacity >= " + item.getStudentCount() + "."
                );
                report.getConflicts().add(conflict);
            }

            if (item.getFaculty() != null) {
                slotFacultyExams.computeIfAbsent(slot.getId(), k -> new HashMap<>())
                        .computeIfAbsent(item.getFaculty().getId(), k -> new ArrayList<>())
                        .add(item);

                // Faculty unavailability check
                for (FacultyUnavailability unav : unavailabilities) {
                    if (unav.getFaculty().getId().equals(item.getFaculty().getId()) &&
                            unav.getUnavailableDate().equals(slot.getExamDate())) {
                        if (unav.getTimeSlot() == null || unav.getTimeSlot().getId().equals(slot.getId())) {
                            ScheduleConflict conflict = new ScheduleConflict(
                                    schedule, "FACULTY_UNAVAILABLE", "HARD",
                                    "Faculty " + item.getFaculty().getName() + " is recorded as UNAVAILABLE on " +
                                            slot.getExamDate() + " (" + (unav.getReason() != null ? unav.getReason() : "No reason provided") + ").",
                                    item.getExamination(), null, null, null, item.getFaculty(), slot,
                                    "Replace with an available faculty member from the department."
                            );
                            report.getConflicts().add(conflict);
                            break;
                        }
                    }
                }
            }

            // Track students for daily limits
            Set<Long> sIds = courseStudentIdsMap.getOrDefault(item.getExamination().getCourse().getId(), Collections.emptySet());
            for (Long sId : sIds) {
                studentDailyExams.computeIfAbsent(sId, k -> new HashMap<>())
                        .computeIfAbsent(slot.getExamDate(), k -> new ArrayList<>())
                        .add(item);
            }
        }

        // Check 1: Student Overlaps (Pairwise exams in same time slot)
        for (Map.Entry<Long, List<ScheduleItem>> entry : slotItemsMap.entrySet()) {
            List<ScheduleItem> slotExams = entry.getValue();
            TimeSlot slot = slotExams.getFirst().getTimeSlot();

            for (int i = 0; i < slotExams.size(); i++) {
                ScheduleItem item1 = slotExams.get(i);
                Set<Long> s1 = courseStudentIdsMap.getOrDefault(item1.getExamination().getCourse().getId(), Collections.emptySet());

                for (int j = i + 1; j < slotExams.size(); j++) {
                    ScheduleItem item2 = slotExams.get(j);
                    Set<Long> s2 = courseStudentIdsMap.getOrDefault(item2.getExamination().getCourse().getId(), Collections.emptySet());

                    Set<Long> shared = new HashSet<>(s1);
                    shared.retainAll(s2);

                    if (!shared.isEmpty()) {
                        StringBuilder studentInfo = new StringBuilder();
                        int limit = Math.min(3, shared.size());
                        int c = 0;
                        for (Long sid : shared) {
                            if (c++ >= limit) break;
                            Student st = studentMap.get(sid);
                            if (st != null) {
                                if (!studentInfo.isEmpty()) studentInfo.append(", ");
                                studentInfo.append(st.getRollNumber()).append(" (").append(st.getName()).append(")");
                            }
                        }
                        if (shared.size() > limit) {
                            studentInfo.append(" and ").append(shared.size() - limit).append(" more");
                        }

                        ScheduleConflict conflict = new ScheduleConflict(
                                schedule, "STUDENT_OVERLAP", "HARD",
                                "Student examination clash in " + slot.getSlotName() + " (" + slot.getExamDate() + "): " +
                                        item1.getExamination().getTitle() + " and " + item2.getExamination().getTitle() +
                                        " share " + shared.size() + " student(s) [" + studentInfo + "].",
                                item1.getExamination(), item2.getExamination(), null, null, null, slot,
                                "Move one of these examinations to an alternative, non-conflicting time slot."
                        );
                        report.getConflicts().add(conflict);
                    }
                }
            }
        }

        // Check 2: Room Double-Booking
        for (Map.Entry<Long, Map<Long, List<ScheduleItem>>> slotEntry : slotRoomExams.entrySet()) {
            for (Map.Entry<Long, List<ScheduleItem>> roomEntry : slotEntry.getValue().entrySet()) {
                if (roomEntry.getValue().size() > 1) {
                    List<ScheduleItem> clashingItems = roomEntry.getValue();
                    Room room = clashingItems.getFirst().getRoom();
                    TimeSlot slot = clashingItems.getFirst().getTimeSlot();

                    StringBuilder examTitles = new StringBuilder();
                    for (ScheduleItem it : clashingItems) {
                        if (!examTitles.isEmpty()) examTitles.append(", ");
                        examTitles.append(it.getExamination().getTitle());
                    }

                    ScheduleConflict conflict = new ScheduleConflict(
                            schedule, "ROOM_DOUBLE_BOOKING", "HARD",
                            "Room Double-Booking: Room " + room.getRoomNumber() + " is assigned to multiple exams in " +
                                    slot.getSlotName() + " (" + slot.getExamDate() + "): " + examTitles + ".",
                            clashingItems.get(0).getExamination(), clashingItems.get(1).getExamination(), null, room, null, slot,
                            "Reassign one of the examinations to another unoccupied room in this slot."
                    );
                    report.getConflicts().add(conflict);
                }
            }
        }

        // Check 3: Faculty Double-Booking
        for (Map.Entry<Long, Map<Long, List<ScheduleItem>>> slotEntry : slotFacultyExams.entrySet()) {
            for (Map.Entry<Long, List<ScheduleItem>> facEntry : slotEntry.getValue().entrySet()) {
                if (facEntry.getValue().size() > 1) {
                    List<ScheduleItem> clashingItems = facEntry.getValue();
                    Faculty fac = clashingItems.getFirst().getFaculty();
                    TimeSlot slot = clashingItems.getFirst().getTimeSlot();

                    ScheduleConflict conflict = new ScheduleConflict(
                            schedule, "FACULTY_OVERLAP", "HARD",
                            "Faculty Invigilation Clash: " + fac.getName() + " is assigned to multiple exams simultaneously in " +
                                    slot.getSlotName() + " (" + slot.getExamDate() + ").",
                            clashingItems.get(0).getExamination(), clashingItems.get(1).getExamination(), null, null, fac, slot,
                            "Reassign an available colleague from " + fac.getDepartment() + " to one of the exams."
                    );
                    report.getConflicts().add(conflict);
                }
            }
        }

        // Check 4: Student Max Daily Exams
        for (Map.Entry<Long, Map<LocalDate, List<ScheduleItem>>> studentEntry : studentDailyExams.entrySet()) {
            Long sId = studentEntry.getKey();
            for (Map.Entry<LocalDate, List<ScheduleItem>> dateEntry : studentEntry.getValue().entrySet()) {
                if (dateEntry.getValue().size() > maxExamsPerDay) {
                    Student st = studentMap.get(sId);
                    LocalDate date = dateEntry.getKey();
                    ScheduleConflict conflict = new ScheduleConflict(
                            schedule, "MAX_DAILY_EXAMS", "SOFT",
                            "Student workload exceeded: " + (st != null ? st.getName() + " (" + st.getRollNumber() + ")" : "Student " + sId) +
                                    " is scheduled for " + dateEntry.getValue().size() + " exams on " + date + " (configured max: " + maxExamsPerDay + ").",
                            null, null, st, null, null, null,
                            "Consider rescheduling one of the examinations to another calendar date."
                    );
                    report.getConflicts().add(conflict);
                }
            }
        }

        // Compute counts and valid status
        int hardCount = 0;
        int softCount = 0;
        for (ScheduleConflict c : report.getConflicts()) {
            if ("HARD".equalsIgnoreCase(c.getSeverity())) {
                hardCount++;
            } else {
                softCount++;
            }
        }

        report.setHardConflictCount(hardCount);
        report.setSoftConflictCount(softCount);
        report.setValid(hardCount == 0);

        report.getDetails().put("totalItemsChecked", items.size());
        report.getDetails().put("totalConflicts", report.getConflicts().size());
        report.getDetails().put("hardConflicts", hardCount);
        report.getDetails().put("softConflicts", softCount);

        return report;
    }
}

