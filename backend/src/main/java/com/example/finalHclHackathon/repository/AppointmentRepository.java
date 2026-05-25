package com.example.finalHclHackathon.repository;

import com.example.finalHclHackathon.entity.Appointment;
import com.example.finalHclHackathon.enums.AppointmentStatus;
import com.example.finalHclHackathon.enums.ConsultationMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);

    List<Appointment> findByAppointmentDate(LocalDate date);

    List<Appointment> findByAppointmentDateAndMode(LocalDate date, ConsultationMode mode);

    List<Appointment> findByAppointmentDateAndStatus(LocalDate date, AppointmentStatus status);

    Optional<Appointment> findBySlotId(Long slotId);
}
