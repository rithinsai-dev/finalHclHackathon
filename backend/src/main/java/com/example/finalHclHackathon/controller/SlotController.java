package com.example.finalHclHackathon.controller;

import com.example.finalHclHackathon.dto.ApiResponse;
import com.example.finalHclHackathon.entity.Slot;
import com.example.finalHclHackathon.enums.SlotStatus;
import com.example.finalHclHackathon.service.SlotService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/slots")
public class SlotController {

    private final SlotService slotService;

    public SlotController(SlotService slotService) {
        this.slotService = slotService;
    }

    /**
     * Auto-generate 30-minute slots for a doctor on a given date.
     */
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<List<Slot>>> generateSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Slot> slots = slotService.generateSlotsForDoctor(doctorId, date);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Slots generated successfully (" + slots.size() + " slots)", slots));
    }

    /**
     * Get slots for a doctor on a date. Optionally filter by status.
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<Slot>>> getSlots(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) SlotStatus status) {
            
        // Auto-generate slots on demand if they don't exist for this date
        List<Slot> allSlots = slotService.getSlotsByDoctorAndDate(doctorId, date);
        if (allSlots.isEmpty()) {
            try {
                slotService.generateSlotsForDoctor(doctorId, date);
            } catch (Exception e) {
                // Ignore (could be due to doctor being on leave)
            }
        }

        List<Slot> slots;
        if (status == SlotStatus.AVAILABLE) {
            slots = slotService.getAvailableSlots(doctorId, date);
            
            // Filter out past time slots if the date is today
            if (date.isEqual(LocalDate.now())) {
                java.time.LocalTime now = java.time.LocalTime.now();
                slots = slots.stream()
                    .filter(slot -> slot.getStartTime().isAfter(now))
                    .collect(java.util.stream.Collectors.toList());
            }
        } else {
            slots = slotService.getSlotsByDoctorAndDate(doctorId, date);
        }
        return ResponseEntity.ok(ApiResponse.success("Slots retrieved successfully", slots));
    }
}
