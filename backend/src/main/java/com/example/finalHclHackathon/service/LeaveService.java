package com.example.finalHclHackathon.service;

import com.example.finalHclHackathon.dto.LeaveRequestDto;
import com.example.finalHclHackathon.entity.Doctor;
import com.example.finalHclHackathon.entity.LeaveRequest;
import com.example.finalHclHackathon.enums.LeaveStatus;
import com.example.finalHclHackathon.exception.InvalidOperationException;
import com.example.finalHclHackathon.exception.ResourceNotFoundException;
import com.example.finalHclHackathon.repository.LeaveRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final DoctorService doctorService;
    private final SlotService slotService;

    public LeaveService(LeaveRequestRepository leaveRequestRepository,
                        DoctorService doctorService,
                        SlotService slotService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.doctorService = doctorService;
        this.slotService = slotService;
    }

    /**
     * Doctor submits a leave request (status: PENDING).
     */
    public LeaveRequest requestLeave(LeaveRequestDto request) {
        Doctor doctor = doctorService.getDoctorById(request.getDoctorId());

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new InvalidOperationException("End date cannot be before start date");
        }

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setDoctor(doctor);
        leaveRequest.setStartDate(request.getStartDate());
        leaveRequest.setEndDate(request.getEndDate());
        leaveRequest.setReason(request.getReason());
        leaveRequest.setStatus(LeaveStatus.PENDING);

        return leaveRequestRepository.save(leaveRequest);
    }

    /**
     * Admin approves a leave request.
     * This also deletes any existing available slots in the leave date range.
     */
    @Transactional
    public LeaveRequest approveLeave(Long leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", leaveId));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new InvalidOperationException("Only pending leave requests can be approved");
        }

        // Delete available slots in the leave date range
        // This will throw if there are booked slots (appointments exist)
        slotService.deleteAvailableSlotsInRange(
                leaveRequest.getDoctor().getId(),
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate()
        );

        leaveRequest.setStatus(LeaveStatus.APPROVED);
        return leaveRequestRepository.save(leaveRequest);
    }

    /**
     * Admin rejects a leave request.
     */
    public LeaveRequest rejectLeave(Long leaveId) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", leaveId));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new InvalidOperationException("Only pending leave requests can be rejected");
        }

        leaveRequest.setStatus(LeaveStatus.REJECTED);
        return leaveRequestRepository.save(leaveRequest);
    }

    /**
     * Get all pending leave requests (admin view).
     */
    public List<LeaveRequest> getPendingLeaves() {
        return leaveRequestRepository.findByStatus(LeaveStatus.PENDING);
    }

    /**
     * Get all leave requests for a specific doctor.
     */
    public List<LeaveRequest> getLeavesByDoctor(Long doctorId) {
        doctorService.getDoctorById(doctorId); // validate doctor exists
        return leaveRequestRepository.findByDoctorId(doctorId);
    }

    /**
     * Check if a doctor is on approved leave on a specific date.
     */
    public boolean isDoctorOnLeave(Long doctorId, java.time.LocalDate date) {
        return !leaveRequestRepository.findApprovedLeavesForDoctorOnDate(doctorId, date).isEmpty();
    }
}
