package com.example.finalHclHackathon.service;

import com.example.finalHclHackathon.dto.DoctorRequest;
import com.example.finalHclHackathon.entity.Doctor;
import com.example.finalHclHackathon.entity.Specialty;
import com.example.finalHclHackathon.enums.ConsultationMode;
import com.example.finalHclHackathon.exception.ResourceNotFoundException;
import com.example.finalHclHackathon.repository.DoctorRepository;
import com.example.finalHclHackathon.repository.SpecialtyRepository;
import com.example.finalHclHackathon.repository.UserRepository;
import com.example.finalHclHackathon.entity.User;
import com.example.finalHclHackathon.enums.Role;
import com.example.finalHclHackathon.exception.InvalidOperationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(DoctorRepository doctorRepository, 
                         SpecialtyRepository specialtyRepository,
                         UserRepository userRepository,
                         PasswordEncoder passwordEncoder) {
        this.doctorRepository = doctorRepository;
        this.specialtyRepository = specialtyRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Doctor createDoctor(DoctorRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidOperationException("Email is already registered");
        }
        
        Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new ResourceNotFoundException("Specialty", request.getSpecialtyId()));

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new InvalidOperationException("Password is required for doctor creation");
        }
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.DOCTOR);
        userRepository.save(user);

        Doctor doctor = new Doctor();
        doctor.setName(request.getName());
        doctor.setEmail(request.getEmail());
        doctor.setPhone(request.getPhone());
        doctor.setQualification(request.getQualification());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setMode(request.getMode());
        doctor.setMeetingLink(request.getMeetingLink());
        doctor.setSpecialty(specialty);

        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", id));
    }

    public List<Doctor> getDoctorsByMode(ConsultationMode mode) {
        return doctorRepository.findByMode(mode);
    }

    public List<Doctor> getDoctorsBySpecialty(Long specialtyId) {
        return doctorRepository.findBySpecialtyId(specialtyId);
    }

    public List<Doctor> getDoctorsBySpecialtyAndMode(Long specialtyId, ConsultationMode mode) {
        return doctorRepository.findBySpecialtyIdAndMode(specialtyId, mode);
    }

    /**
     * Flexible doctor filtering: by specialty, by mode, by both, or all.
     */
    public List<Doctor> getDoctorsFiltered(Long specialtyId, ConsultationMode mode) {
        if (specialtyId != null && mode != null) {
            return doctorRepository.findBySpecialtyIdAndMode(specialtyId, mode);
        } else if (specialtyId != null) {
            return doctorRepository.findBySpecialtyId(specialtyId);
        } else if (mode != null) {
            return doctorRepository.findByMode(mode);
        } else {
            return doctorRepository.findAll();
        }
    }

    public Doctor updateDoctor(Long id, DoctorRequest request) {
        Doctor doctor = getDoctorById(id);
        Specialty specialty = specialtyRepository.findById(request.getSpecialtyId())
                .orElseThrow(() -> new ResourceNotFoundException("Specialty", request.getSpecialtyId()));

        doctor.setName(request.getName());
        doctor.setEmail(request.getEmail());
        doctor.setPhone(request.getPhone());
        doctor.setQualification(request.getQualification());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setMode(request.getMode());
        doctor.setMeetingLink(request.getMeetingLink());
        doctor.setSpecialty(specialty);

        return doctorRepository.save(doctor);
    }

    public void deleteDoctor(Long id) {
        Doctor doctor = getDoctorById(id);
        doctorRepository.delete(doctor);
    }
}
