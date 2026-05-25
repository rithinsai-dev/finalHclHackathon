package com.example.finalHclHackathon.dto;

import jakarta.validation.constraints.NotBlank;

public class SpecialtyRequest {

    @NotBlank(message = "Specialty name is required")
    private String name;

    private String description;

    public SpecialtyRequest() {}

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
