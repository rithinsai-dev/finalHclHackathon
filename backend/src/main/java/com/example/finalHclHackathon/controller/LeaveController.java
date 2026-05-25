package com.example.finalHclHackathon.controller;

import com.example.finalHclHackathon.dto.ApiResponse;
import com.example.finalHclHackathon.dto.LeaveRequestDto;
import com.example.finalHclHackathon.entity.LeaveRequest;
import com.example.finalHclHackathon.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    /**
     * Doctor submits a leave request.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<LeaveRequest>> requestLeave(@Valid @RequestBody LeaveRequestDto request) {
        LeaveRequest leave = leaveService.requestLeave(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Leave request submitted successfully", leave));
    }

    /**
     * Admin: view all pending leave requests.
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getPendingLeaves() {
        List<LeaveRequest> leaves = leaveService.getPendingLeaves();
        return ResponseEntity.ok(ApiResponse.success("Pending leave requests retrieved", leaves));
    }

    /**
     * Doctor: view own leave requests.
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getDoctorLeaves(@PathVariable Long doctorId) {
        List<LeaveRequest> leaves = leaveService.getLeavesByDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor leave requests retrieved", leaves));
    }

    /**
     * Admin: approve a leave request.
     * This also blocks/removes slots in the leave date range.
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<LeaveRequest>> approveLeave(@PathVariable Long id) {
        LeaveRequest leave = leaveService.approveLeave(id);
        return ResponseEntity.ok(ApiResponse.success("Leave request approved. Slots blocked for the leave period.", leave));
    }

    /**
     * Admin: reject a leave request.
     */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<LeaveRequest>> rejectLeave(@PathVariable Long id) {
        LeaveRequest leave = leaveService.rejectLeave(id);
        return ResponseEntity.ok(ApiResponse.success("Leave request rejected", leave));
    }
}
