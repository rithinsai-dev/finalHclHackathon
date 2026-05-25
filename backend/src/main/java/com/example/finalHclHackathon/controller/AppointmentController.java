package com.example.finalHclHackathon.controller;

import com.example.finalHclHackathon.dto.ApiResponse;
import com.example.finalHclHackathon.dto.AppointmentRequest;
import com.example.finalHclHackathon.entity.Appointment;
import com.example.finalHclHackathon.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Appointment>> bookAppointment(@Valid @RequestBody AppointmentRequest request) {
        Appointment appointment = appointmentService.bookAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked successfully", appointment));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Appointment>> getAppointment(@PathVariable Long id) {
        Appointment appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment retrieved successfully", appointment));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<Appointment>>> getPatientAppointments(@PathVariable Long patientId) {
        List<Appointment> appointments = appointmentService.getAppointmentsByPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient appointments retrieved successfully", appointments));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<Appointment>>> getDoctorAppointments(
            @PathVariable Long doctorId,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date) {
        List<Appointment> appointments = appointmentService.getDoctorAppointmentsForDate(doctorId, date);
        return ResponseEntity.ok(ApiResponse.success("Doctor appointments retrieved successfully", appointments));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Appointment>> cancelAppointment(@PathVariable Long id) {
        Appointment appointment = appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully", appointment));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<Appointment>> completeAppointment(@PathVariable Long id) {
        Appointment appointment = appointmentService.completeAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment marked as completed", appointment));
    }

    @PatchMapping("/{id}/no-show")
    public ResponseEntity<ApiResponse<Appointment>> markNoShow(@PathVariable Long id) {
        Appointment appointment = appointmentService.markNoShow(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment marked as no-show", appointment));
    }
}
