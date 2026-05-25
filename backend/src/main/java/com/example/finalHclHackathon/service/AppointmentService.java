package com.example.finalHclHackathon.service;

import com.example.finalHclHackathon.dto.AppointmentRequest;
import com.example.finalHclHackathon.entity.Appointment;
import com.example.finalHclHackathon.entity.Doctor;
import com.example.finalHclHackathon.entity.Patient;
import com.example.finalHclHackathon.entity.Slot;
import com.example.finalHclHackathon.enums.AppointmentStatus;
import com.example.finalHclHackathon.enums.SlotStatus;
import com.example.finalHclHackathon.exception.InvalidOperationException;
import com.example.finalHclHackathon.exception.ResourceNotFoundException;
import com.example.finalHclHackathon.exception.SlotNotAvailableException;
import com.example.finalHclHackathon.repository.AppointmentRepository;
import com.example.finalHclHackathon.repository.LeaveRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorService doctorService;
    private final PatientService patientService;
    private final SlotService slotService;
    private final LeaveRequestRepository leaveRequestRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              DoctorService doctorService,
                              PatientService patientService,
                              SlotService slotService,
                              LeaveRequestRepository leaveRequestRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorService = doctorService;
        this.patientService = patientService;
        this.slotService = slotService;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    /**
     * Book an appointment.
     * Validates: slot is available, doctor is not on leave, slot belongs to the correct doctor.
     */
    @Transactional
    public Appointment bookAppointment(AppointmentRequest request) {
        Patient patient = patientService.getPatientById(request.getPatientId());
        Doctor doctor = doctorService.getDoctorById(request.getDoctorId());
        Slot slot = slotService.getSlotById(request.getSlotId());

        // Validate slot belongs to the specified doctor
        if (!slot.getDoctor().getId().equals(doctor.getId())) {
            throw new InvalidOperationException("Slot does not belong to the specified doctor");
        }

        // Check slot is available
        if (slot.getStatus() != SlotStatus.AVAILABLE) {
            throw new SlotNotAvailableException("This slot is already booked");
        }

        // Check doctor is not on leave
        if (!leaveRequestRepository.findApprovedLeavesForDoctorOnDate(doctor.getId(), slot.getDate()).isEmpty()) {
            throw new InvalidOperationException("Doctor is on leave on " + slot.getDate());
        }

        // Create the appointment
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setSlot(slot);
        appointment.setAppointmentDate(slot.getDate());
        appointment.setStartTime(slot.getStartTime());
        appointment.setMode(doctor.getMode());
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setFee(doctor.getConsultationFee());
        appointment.setDescription(request.getDescription()); // optional patient problem description

        // Set meeting link for online appointments
        if (doctor.getMode() == com.example.finalHclHackathon.enums.ConsultationMode.ONLINE) {
            appointment.setMeetingLink(doctor.getMeetingLink());
        }

        // Mark the slot as booked
        slotService.markSlotBooked(slot);

        return appointmentRepository.save(appointment);
    }

    /**
     * Get appointment by ID.
     */
    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
    }

    /**
     * Get all appointments for a patient.
     */
    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        // Validate patient exists
        patientService.getPatientById(patientId);
        return appointmentRepository.findByPatientId(patientId);
    }

    /**
     * Cancel an appointment and release the slot.
     */
    @Transactional
    public Appointment cancelAppointment(Long id) {
        Appointment appointment = getAppointmentById(id);

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new InvalidOperationException("Cannot cancel a completed appointment");
        }
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new InvalidOperationException("Appointment is already cancelled");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);

        // Release the slot back to available
        slotService.releaseSlot(appointment.getSlot());

        return appointmentRepository.save(appointment);
    }

    /**
     * Mark appointment as completed.
     */
    @Transactional
    public Appointment completeAppointment(Long id) {
        Appointment appointment = getAppointmentById(id);

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new InvalidOperationException("Only confirmed appointments can be marked as completed");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        return appointmentRepository.save(appointment);
    }

    /**
     * Mark appointment as no-show.
     */
    @Transactional
    public Appointment markNoShow(Long id) {
        Appointment appointment = getAppointmentById(id);

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new InvalidOperationException("Only confirmed appointments can be marked as no-show");
        }

        appointment.setStatus(AppointmentStatus.NO_SHOW);
        return appointmentRepository.save(appointment);
    }

    /**
     * Get doctor's appointments for a specific date (used by dashboard).
     */
    public List<Appointment> getDoctorAppointmentsForDate(Long doctorId, java.time.LocalDate date) {
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date);
    }
}
