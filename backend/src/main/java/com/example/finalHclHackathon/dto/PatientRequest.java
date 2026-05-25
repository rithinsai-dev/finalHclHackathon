package com.example.finalHclHackathon.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class PatientRequest {

    @NotBlank(message = "Patient name is required")
    private String name;

    @NotBlank(message = "Email is required")
    private String email;

    private String phone;

    private LocalDate dateOfBirth;

    public PatientRequest() {}

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
}
