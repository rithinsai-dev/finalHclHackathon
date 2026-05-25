package com.example.finalHclHackathon.service;

import com.example.finalHclHackathon.config.JwtUtil;
import com.example.finalHclHackathon.dto.AuthResponse;
import com.example.finalHclHackathon.dto.LoginRequest;
import com.example.finalHclHackathon.dto.RegisterRequest;
import com.example.finalHclHackathon.entity.Patient;
import com.example.finalHclHackathon.entity.User;
import com.example.finalHclHackathon.enums.Role;
import com.example.finalHclHackathon.exception.InvalidOperationException;
import com.example.finalHclHackathon.repository.DoctorRepository;
import com.example.finalHclHackathon.repository.PatientRepository;
import com.example.finalHclHackathon.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PatientRepository patientRepository,
                       DoctorRepository doctorRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Register a new PATIENT user.
     * Only patients can self-register. Doctors are created by admin.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new InvalidOperationException("Email is already registered");
        }

        // Create User entity
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.PATIENT);
        userRepository.save(user);

        // Create Patient entity
        Patient patient = new Patient();
        patient.setName(request.getName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
            patient.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
        }
        patientRepository.save(patient);

        // Generate token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(token, user.getRole(), user.getName(), user.getEmail(), patient.getId());
    }

    /**
     * Login for any role (ADMIN, DOCTOR, PATIENT).
     */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidOperationException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidOperationException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        // Resolve entity ID based on role
        Long entityId = null;
        if (user.getRole() == Role.DOCTOR) {
            entityId = doctorRepository.findByEmail(user.getEmail())
                    .map(d -> d.getId())
                    .orElse(null);
        } else if (user.getRole() == Role.PATIENT) {
            entityId = patientRepository.findByEmail(user.getEmail())
                    .map(p -> p.getId())
                    .orElse(null);
        }

        return new AuthResponse(token, user.getRole(), user.getName(), user.getEmail(), entityId);
    }
}
