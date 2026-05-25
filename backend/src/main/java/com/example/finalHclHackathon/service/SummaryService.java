package com.example.finalHclHackathon.service;

import com.example.finalHclHackathon.dto.DailySummaryResponse;
import com.example.finalHclHackathon.dto.DoctorScheduleResponse;
import com.example.finalHclHackathon.entity.Appointment;
import com.example.finalHclHackathon.entity.Slot;
import com.example.finalHclHackathon.enums.AppointmentStatus;
import com.example.finalHclHackathon.enums.ConsultationMode;
import com.example.finalHclHackathon.repository.AppointmentRepository;
import com.example.finalHclHackathon.repository.SlotRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class SummaryService {

    private final AppointmentRepository appointmentRepository;
    private final SlotRepository slotRepository;

    public SummaryService(AppointmentRepository appointmentRepository, SlotRepository slotRepository) {
        this.appointmentRepository = appointmentRepository;
        this.slotRepository = slotRepository;
    }

    /**
     * Generate a daily summary with appointment counts, revenue by mode, and per-specialty breakdown.
     */
    public DailySummaryResponse getDailySummary(LocalDate date) {
        List<Appointment> appointments = appointmentRepository.findByAppointmentDate(date);

        DailySummaryResponse summary = new DailySummaryResponse();
        summary.setDate(date);
        summary.setTotalAppointments(appointments.size());

        int confirmed = 0, completed = 0, cancelled = 0, noShow = 0;
        double totalRevenue = 0, onlineRevenue = 0, offlineRevenue = 0;
        Map<String, DailySummaryResponse.SpecialtySummary> bySpecialty = new HashMap<>();

        for (Appointment appt : appointments) {
            // Count by status
            switch (appt.getStatus()) {
                case CONFIRMED -> confirmed++;
                case COMPLETED -> completed++;
                case CANCELLED -> cancelled++;
                case NO_SHOW -> noShow++;
            }

            // Revenue calculation (only from completed and confirmed appointments)
            if (appt.getStatus() == AppointmentStatus.COMPLETED ||
                appt.getStatus() == AppointmentStatus.CONFIRMED) {
                double fee = appt.getFee() != null ? appt.getFee() : 0;
                totalRevenue += fee;

                if (appt.getMode() == ConsultationMode.ONLINE) {
                    onlineRevenue += fee;
                } else {
                    offlineRevenue += fee;
                }

                // Per-specialty breakdown
                String specialtyName = appt.getDoctor().getSpecialty().getName();
                DailySummaryResponse.SpecialtySummary specSummary =
                        bySpecialty.computeIfAbsent(specialtyName, k -> new DailySummaryResponse.SpecialtySummary());
                specSummary.setAppointmentCount(specSummary.getAppointmentCount() + 1);
                specSummary.setRevenue(specSummary.getRevenue() + fee);
                if (appt.getMode() == ConsultationMode.ONLINE) {
                    specSummary.setOnlineCount(specSummary.getOnlineCount() + 1);
                } else {
                    specSummary.setOfflineCount(specSummary.getOfflineCount() + 1);
                }
            }
        }

        summary.setConfirmed(confirmed);
        summary.setCompleted(completed);
        summary.setCancelled(cancelled);
        summary.setNoShow(noShow);
        summary.setTotalRevenue(totalRevenue);
        summary.setOnlineRevenue(onlineRevenue);
        summary.setOfflineRevenue(offlineRevenue);
        summary.setBySpecialty(bySpecialty);

        return summary;
    }

    /**
     * Get doctor's schedule for a specific date: all slots with patient details.
     */
    public List<DoctorScheduleResponse> getDoctorSchedule(Long doctorId, LocalDate date) {
        List<Slot> slots = slotRepository.findByDoctorIdAndDate(doctorId, date);
        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date);

        // Map slot ID -> appointment for quick lookup
        Map<Long, Appointment> slotAppointmentMap = new HashMap<>();
        for (Appointment appt : appointments) {
            slotAppointmentMap.put(appt.getSlot().getId(), appt);
        }

        List<DoctorScheduleResponse> schedule = new ArrayList<>();
        for (Slot slot : slots) {
            DoctorScheduleResponse entry = new DoctorScheduleResponse();
            entry.setSlotId(slot.getId());
            entry.setStartTime(slot.getStartTime());
            entry.setEndTime(slot.getEndTime());
            entry.setSlotStatus(slot.getStatus().name());

            Appointment appt = slotAppointmentMap.get(slot.getId());
            if (appt != null) {
                entry.setAppointmentId(appt.getId());
                entry.setPatientName(appt.getPatient().getName());
                entry.setPatientEmail(appt.getPatient().getEmail());
                entry.setPatientPhone(appt.getPatient().getPhone());
                entry.setDescription(appt.getDescription());
                entry.setAppointmentStatus(appt.getStatus());
            }

            schedule.add(entry);
        }

        return schedule;
    }
}
