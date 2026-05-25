package com.example.finalHclHackathon.controller;

import com.example.finalHclHackathon.dto.ApiResponse;
import com.example.finalHclHackathon.dto.SpecialtyRequest;
import com.example.finalHclHackathon.entity.Specialty;
import com.example.finalHclHackathon.service.SpecialtyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specialties")
public class SpecialtyController {

    private final SpecialtyService specialtyService;

    public SpecialtyController(SpecialtyService specialtyService) {
        this.specialtyService = specialtyService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Specialty>> createSpecialty(@Valid @RequestBody SpecialtyRequest request) {
        Specialty specialty = specialtyService.createSpecialty(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Specialty created successfully", specialty));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Specialty>>> getAllSpecialties() {
        List<Specialty> specialties = specialtyService.getAllSpecialties();
        return ResponseEntity.ok(ApiResponse.success("Specialties retrieved successfully", specialties));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Specialty>> getSpecialtyById(@PathVariable Long id) {
        Specialty specialty = specialtyService.getSpecialtyById(id);
        return ResponseEntity.ok(ApiResponse.success("Specialty retrieved successfully", specialty));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Specialty>> updateSpecialty(@PathVariable Long id,
                                                                   @Valid @RequestBody SpecialtyRequest request) {
        Specialty specialty = specialtyService.updateSpecialty(id, request);
        return ResponseEntity.ok(ApiResponse.success("Specialty updated successfully", specialty));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSpecialty(@PathVariable Long id) {
        specialtyService.deleteSpecialty(id);
        return ResponseEntity.ok(ApiResponse.success("Specialty deleted successfully"));
    }
}
