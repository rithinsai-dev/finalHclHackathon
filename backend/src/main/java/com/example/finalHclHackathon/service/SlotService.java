package com.example.finalHclHackathon.service;

import com.example.finalHclHackathon.entity.Doctor;
import com.example.finalHclHackathon.entity.Slot;
import com.example.finalHclHackathon.enums.SlotStatus;
import com.example.finalHclHackathon.exception.InvalidOperationException;
import com.example.finalHclHackathon.exception.ResourceNotFoundException;
import com.example.finalHclHackathon.repository.DoctorRepository;
import com.example.finalHclHackathon.repository.LeaveRequestRepository;
import com.example.finalHclHackathon.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SlotService {

    private final SlotRepository slotRepository;
    private final DoctorRepository doctorRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    @Value("${slot.start-hour:9}")
    private int startHour;

    @Value("${slot.end-hour:17}")
    private int endHour;

    @Value("${slot.lunch-start-hour:12}")
    private int lunchStartHour;

    @Value("${slot.lunch-end-hour:14}")
    private int lunchEndHour;

    @Value("${slot.duration-minutes:59}")
    private int durationMinutes;

    public SlotService(SlotRepository slotRepository, DoctorRepository doctorRepository,
                       LeaveRequestRepository leaveRequestRepository) {
        this.slotRepository = slotRepository;
        this.doctorRepository = doctorRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    /**
     * Auto-generate 30-minute slots for a doctor on a given date.
     * Skips lunch break (12:00 - 14:00) and checks for approved leave.
     */
    @Transactional
    public List<Slot> generateSlotsForDoctor(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", doctorId));

        // Check if doctor is on approved leave
        if (!leaveRequestRepository.findApprovedLeavesForDoctorOnDate(doctorId, date).isEmpty()) {
            throw new InvalidOperationException("Cannot generate slots: Doctor is on approved leave on " + date);
        }

        // Check if slots already exist for this date
        if (slotRepository.existsByDoctorIdAndDate(doctorId, date)) {
            throw new InvalidOperationException("Slots already generated for doctor " + doctorId + " on " + date);
        }

        List<Slot> slots = new ArrayList<>();
        LocalTime currentTime = LocalTime.of(startHour, 0);
        LocalTime dayEnd = LocalTime.of(endHour, 0);
        LocalTime lunchStart = LocalTime.of(lunchStartHour, 0);
        LocalTime lunchEnd = LocalTime.of(lunchEndHour, 0);

        while (currentTime.isBefore(dayEnd)) {
            LocalTime slotEnd = currentTime.plusMinutes(durationMinutes);

            // Skip lunch break
            if (currentTime.isBefore(lunchEnd) && slotEnd.isAfter(lunchStart)) {
                currentTime = lunchEnd;
                continue;
            }

            Slot slot = new Slot(doctor, date, currentTime, slotEnd);
            slots.add(slot);
            currentTime = slotEnd;
        }

        return slotRepository.saveAll(slots);
    }

    /**
     * Get all slots for a doctor on a given date.
     */
    public List<Slot> getSlotsByDoctorAndDate(Long doctorId, LocalDate date) {
        return slotRepository.findByDoctorIdAndDate(doctorId, date);
    }

    /**
     * Get only available slots for a doctor on a given date.
     */
    public List<Slot> getAvailableSlots(Long doctorId, LocalDate date) {
        return slotRepository.findByDoctorIdAndDateAndStatus(doctorId, date, SlotStatus.AVAILABLE);
    }

    /**
     * Get a slot by ID.
     */
    public Slot getSlotById(Long slotId) {
        return slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot", slotId));
    }

    /**
     * Mark a slot as booked (called internally by AppointmentService).
     */
    @Transactional
    public void markSlotBooked(Slot slot) {
        slot.setStatus(SlotStatus.BOOKED);
        slotRepository.save(slot);
    }

    /**
     * Release a slot back to available (called when appointment is cancelled).
     */
    @Transactional
    public void releaseSlot(Slot slot) {
        slot.setStatus(SlotStatus.AVAILABLE);
        slotRepository.save(slot);
    }

    /**
     * Delete all slots for a doctor within a date range (used when leave is approved).
     * Only deletes AVAILABLE slots; BOOKED slots trigger an error.
     */
    @Transactional
    public void deleteAvailableSlotsInRange(Long doctorId, LocalDate startDate, LocalDate endDate) {
        List<Slot> slots = slotRepository.findByDoctorIdAndDateBetween(doctorId, startDate, endDate);
        for (Slot slot : slots) {
            if (slot.getStatus() == SlotStatus.BOOKED) {
                throw new InvalidOperationException(
                    "Cannot approve leave: Doctor has booked appointments on " + slot.getDate() +
                    " at " + slot.getStartTime() + ". Please cancel those appointments first.");
            }
        }
        slotRepository.deleteByDoctorIdAndDateBetween(doctorId, startDate, endDate);
    }
}
