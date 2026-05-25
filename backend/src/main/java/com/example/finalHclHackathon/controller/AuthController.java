package com.example.finalHclHackathon.controller;

import com.example.finalHclHackathon.dto.ApiResponse;
import com.example.finalHclHackathon.dto.AuthResponse;
import com.example.finalHclHackathon.dto.LoginRequest;
import com.example.finalHclHackathon.dto.RegisterRequest;
import com.example.finalHclHackathon.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Register a new patient account.
     * Doctors cannot self-register — admin creates their accounts.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", authResponse));
    }

    /**
     * Login for all roles (ADMIN, DOCTOR, PATIENT).
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }
}
