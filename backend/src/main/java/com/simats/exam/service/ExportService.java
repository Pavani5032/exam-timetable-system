package com.simats.exam.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.simats.exam.entity.ScheduleConflict;
import com.simats.exam.entity.ScheduleItem;
import com.simats.exam.entity.TimetableSchedule;
import com.simats.exam.repository.ScheduleConflictRepository;
import com.simats.exam.repository.ScheduleItemRepository;
import com.simats.exam.repository.TimetableScheduleRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    @Autowired private TimetableScheduleRepository scheduleRepository;
    @Autowired private ScheduleItemRepository itemRepository;
    @Autowired private ScheduleConflictRepository conflictRepository;

    public void exportScheduleCsv(Long scheduleId, OutputStream os) throws IOException {
        TimetableSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        List<ScheduleItem> items = itemRepository.findByScheduleId(scheduleId);

        try (CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(os, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.withHeader("Exam Code", "Course Title", "Department", "Exam Date", "Time Slot", "Session", "Room Number", "Room Capacity", "Candidates", "Faculty Invigilator", "Status", "Conflict Details"))) {

            for (ScheduleItem item : items) {
                printer.printRecord(
                        item.getExamination().getExamCode(),
                        item.getExamination().getTitle(),
                        item.getExamination().getCourse().getDepartment(),
                        item.getTimeSlot() != null ? item.getTimeSlot().getExamDate().toString() : "UNASSIGNED",
                        item.getTimeSlot() != null ? item.getTimeSlot().getSlotName() : "UNASSIGNED",
                        item.getTimeSlot() != null ? item.getTimeSlot().getSessionType() : "N/A",
                        item.getRoom() != null ? item.getRoom().getRoomNumber() : "UNASSIGNED",
                        item.getRoom() != null ? item.getRoom().getCapacity() : "N/A",
                        item.getStudentCount(),
                        item.getFaculty() != null ? item.getFaculty().getName() : "UNASSIGNED",
                        item.getStatus(),
                        item.getConflictReason() != null ? item.getConflictReason() : "None"
                );
            }
        }
    }

    public void exportConflictsCsv(Long scheduleId, OutputStream os) throws IOException {
        TimetableSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        List<ScheduleConflict> conflicts = conflictRepository.findByScheduleId(scheduleId);

        try (CSVPrinter printer = new CSVPrinter(new OutputStreamWriter(os, StandardCharsets.UTF_8),
                CSVFormat.DEFAULT.withHeader("Conflict ID", "Type", "Severity", "Description", "Time Slot", "Suggested Resolution"))) {

            for (ScheduleConflict c : conflicts) {
                printer.printRecord(
                        c.getId(),
                        c.getConflictType(),
                        c.getSeverity(),
                        c.getDescription(),
                        c.getTimeSlot() != null ? c.getTimeSlot().getSlotName() + " (" + c.getTimeSlot().getExamDate() + ")" : "N/A",
                        c.getSuggestedResolution() != null ? c.getSuggestedResolution() : "None"
                );
            }
        }
    }

    public void exportSchedulePdf(Long scheduleId, OutputStream os) throws DocumentException {
        TimetableSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        List<ScheduleItem> items = itemRepository.findByScheduleId(scheduleId);

        Document document = new Document(PageSize.A4.rotate(), 20, 20, 20, 20);
        PdfWriter.getInstance(document, os);
        document.open();

        // Header Fonts
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(30, 58, 138));
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
        Font subheaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(15, 23, 42));
        Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);
        Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);

        // Title and University Banner
        Paragraph university = new Paragraph("SIMATS ENGINEERING", titleFont);
        university.setAlignment(Element.ALIGN_CENTER);
        document.add(university);

        Paragraph affiliation = new Paragraph("Saveetha Institute of Medical and Technical Sciences, Chennai", subtitleFont);
        affiliation.setAlignment(Element.ALIGN_CENTER);
        document.add(affiliation);

        Paragraph projectTitle = new Paragraph("Constraint-Based Examination Timetable & Conflict-Free Resource Allocation System", subtitleFont);
        projectTitle.setAlignment(Element.ALIGN_CENTER);
        document.add(projectTitle);

        document.add(new Paragraph(" "));

        Paragraph scheduleTitle = new Paragraph(schedule.getTitle() + " | Status: " + schedule.getStatus() + " | Academic Year: " + schedule.getAcademicYear(), subheaderFont);
        scheduleTitle.setAlignment(Element.ALIGN_CENTER);
        document.add(scheduleTitle);

        document.add(new Paragraph(" "));

        // Timetable Table
        PdfPTable table = new PdfPTable(8);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.8f, 3.5f, 1.8f, 2.5f, 1.8f, 1.2f, 2.8f, 1.4f});

        String[] headers = {"Exam Code", "Course Title", "Date", "Slot & Session", "Room", "Seats", "Invigilator", "Status"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, tableHeaderFont));
            cell.setBackgroundColor(new Color(30, 58, 138)); // SIMATS blue
            cell.setPadding(6);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(cell);
        }

        boolean alternate = false;
        for (ScheduleItem item : items) {
            Color rowBg = alternate ? new Color(241, 245, 249) : Color.WHITE;
            alternate = !alternate;

            addTableCell(table, item.getExamination().getExamCode(), cellFont, rowBg, Element.ALIGN_CENTER);
            addTableCell(table, item.getExamination().getTitle(), cellFont, rowBg, Element.ALIGN_LEFT);
            addTableCell(table, item.getTimeSlot() != null ? item.getTimeSlot().getExamDate().toString() : "-", cellFont, rowBg, Element.ALIGN_CENTER);
            addTableCell(table, item.getTimeSlot() != null ? item.getTimeSlot().getSlotName() : "-", cellFont, rowBg, Element.ALIGN_LEFT);
            addTableCell(table, item.getRoom() != null ? item.getRoom().getRoomNumber() : "-", cellFont, rowBg, Element.ALIGN_CENTER);
            addTableCell(table, String.valueOf(item.getStudentCount()), cellFont, rowBg, Element.ALIGN_CENTER);
            addTableCell(table, item.getFaculty() != null ? item.getFaculty().getName() : "-", cellFont, rowBg, Element.ALIGN_LEFT);
            addTableCell(table, item.getStatus(), cellFont, rowBg, Element.ALIGN_CENTER);
        }

        document.add(table);

        document.add(new Paragraph(" "));
        Paragraph footer = new Paragraph("Generated on " + java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + " | Algorithm: DSATUR Graph Colouring with Resource Allocation Engine.", subtitleFont);
        footer.setAlignment(Element.ALIGN_RIGHT);
        document.add(footer);

        document.close();
    }

    private void addTableCell(PdfPTable table, String text, Font font, Color bgColor, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(5);
        cell.setHorizontalAlignment(align);
        table.addCell(cell);
    }
}

