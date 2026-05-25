package com.example.finalHclHackathon.repository;

import com.example.finalHclHackathon.entity.Doctor;
import com.example.finalHclHackathon.enums.ConsultationMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findByMode(ConsultationMode mode);

    List<Doctor> findBySpecialtyId(Long specialtyId);

    List<Doctor> findBySpecialtyIdAndMode(Long specialtyId, ConsultationMode mode);

    Optional<Doctor> findByEmail(String email);
}
