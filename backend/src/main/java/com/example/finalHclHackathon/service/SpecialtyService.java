package com.example.finalHclHackathon.service;

import com.example.finalHclHackathon.dto.SpecialtyRequest;
import com.example.finalHclHackathon.entity.Specialty;
import com.example.finalHclHackathon.exception.ResourceNotFoundException;
import com.example.finalHclHackathon.repository.SpecialtyRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpecialtyService {

    private final SpecialtyRepository specialtyRepository;

    public SpecialtyService(SpecialtyRepository specialtyRepository) {
        this.specialtyRepository = specialtyRepository;
    }

    public Specialty createSpecialty(SpecialtyRequest request) {
        Specialty specialty = new Specialty();
        specialty.setName(request.getName());
        specialty.setDescription(request.getDescription());
        return specialtyRepository.save(specialty);
    }

    public List<Specialty> getAllSpecialties() {
        return specialtyRepository.findAll();
    }

    public Specialty getSpecialtyById(Long id) {
        return specialtyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialty", id));
    }

    public Specialty updateSpecialty(Long id, SpecialtyRequest request) {
        Specialty specialty = getSpecialtyById(id);
        specialty.setName(request.getName());
        specialty.setDescription(request.getDescription());
        return specialtyRepository.save(specialty);
    }

    public void deleteSpecialty(Long id) {
        Specialty specialty = getSpecialtyById(id);
        specialtyRepository.delete(specialty);
    }
}
