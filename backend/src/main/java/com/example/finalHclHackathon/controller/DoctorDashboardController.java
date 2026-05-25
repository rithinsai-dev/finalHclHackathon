package com.example.finalHclHackathon.controller;

import com.example.finalHclHackathon.dto.ApiResponse;
import com.example.finalHclHackathon.dto.DoctorScheduleResponse;
import com.example.finalHclHackathon.service.SummaryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard/doctor")
public class DoctorDashboardController {

    private final SummaryService summaryService;

    public DoctorDashboardController(SummaryService summaryService) {
        this.summaryService = summaryService;
    }

    /**
     * Get today's schedule for a doctor: slots, patient names, descriptions.
     */
    @GetMapping("/{doctorId}/today")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getTodaySchedule(@PathVariable Long doctorId) {
        List<DoctorScheduleResponse> schedule = summaryService.getDoctorSchedule(doctorId, LocalDate.now());
        return ResponseEntity.ok(ApiResponse.success("Today's schedule retrieved", schedule));
    }

    /**
     * Get schedule for a specific date.
     */
    @GetMapping("/{doctorId}/schedule")
    public ResponseEntity<ApiResponse<List<DoctorScheduleResponse>>> getScheduleForDate(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<DoctorScheduleResponse> schedule = summaryService.getDoctorSchedule(doctorId, date);
        return ResponseEntity.ok(ApiResponse.success("Schedule retrieved for " + date, schedule));
    }
}
