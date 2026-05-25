package com.example.finalHclHackathon.repository;

import com.example.finalHclHackathon.entity.Slot;
import com.example.finalHclHackathon.enums.SlotStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findByDoctorIdAndDate(Long doctorId, LocalDate date);

    List<Slot> findByDoctorIdAndDateAndStatus(Long doctorId, LocalDate date, SlotStatus status);

    boolean existsByDoctorIdAndDate(Long doctorId, LocalDate date);

    List<Slot> findByDoctorIdAndDateBetween(Long doctorId, LocalDate startDate, LocalDate endDate);

    void deleteByDoctorIdAndDateBetween(Long doctorId, LocalDate startDate, LocalDate endDate);
}
