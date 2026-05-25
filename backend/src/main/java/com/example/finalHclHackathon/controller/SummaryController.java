package com.example.finalHclHackathon.controller;

import com.example.finalHclHackathon.dto.ApiResponse;
import com.example.finalHclHackathon.dto.DailySummaryResponse;
import com.example.finalHclHackathon.service.SummaryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/summary")
public class SummaryController {

    private final SummaryService summaryService;

    public SummaryController(SummaryService summaryService) {
        this.summaryService = summaryService;
    }

    /**
     * Get daily summary: appointment counts, revenue by mode, and per-specialty breakdown.
     * Defaults to today if no date is provided.
     */
    @GetMapping("/daily")
    public ResponseEntity<ApiResponse<DailySummaryResponse>> getDailySummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }
        DailySummaryResponse summary = summaryService.getDailySummary(date);
        return ResponseEntity.ok(ApiResponse.success("Daily summary for " + date, summary));
    }
}
