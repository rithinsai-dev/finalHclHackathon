package com.example.finalHclHackathon.controller;

import com.example.finalHclHackathon.dto.ApiResponse;
import com.example.finalHclHackathon.dto.PatientRequest;
import com.example.finalHclHackathon.entity.Patient;
import com.example.finalHclHackathon.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Patient>> createPatient(@Valid @RequestBody PatientRequest request) {
        Patient patient = patientService.createPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Patient registered successfully", patient));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Patient>>> getAllPatients() {
        List<Patient> patients = patientService.getAllPatients();
        return ResponseEntity.ok(ApiResponse.success("Patients retrieved successfully", patients));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Patient>> getPatientById(@PathVariable Long id) {
        Patient patient = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success("Patient retrieved successfully", patient));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Patient>> updatePatient(@PathVariable Long id,
                                                               @Valid @RequestBody PatientRequest request) {
        Patient patient = patientService.updatePatient(id, request);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", patient));
    }
}
