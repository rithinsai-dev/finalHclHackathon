package com.example.finalHclHackathon.dto;

import com.example.finalHclHackathon.enums.AppointmentStatus;

import java.time.LocalTime;

public class DoctorScheduleResponse {

    private Long slotId;
    private LocalTime startTime;
    private LocalTime endTime;
    private String slotStatus;

    // Appointment details (null if slot is not booked)
    private Long appointmentId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String description; // patient's problem description
    private AppointmentStatus appointmentStatus;

    public DoctorScheduleResponse() {}

    // Getters and Setters
    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getSlotStatus() { return slotStatus; }
    public void setSlotStatus(String slotStatus) { this.slotStatus = slotStatus; }

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public AppointmentStatus getAppointmentStatus() { return appointmentStatus; }
    public void setAppointmentStatus(AppointmentStatus appointmentStatus) { this.appointmentStatus = appointmentStatus; }
}
