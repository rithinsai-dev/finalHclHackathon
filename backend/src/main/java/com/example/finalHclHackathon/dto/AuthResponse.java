package com.example.finalHclHackathon.dto;

import com.example.finalHclHackathon.enums.Role;

public class AuthResponse {

    private String token;
    private Role role;
    private String name;
    private String email;
    private Long entityId; 

    public AuthResponse() {}

    public AuthResponse(String token, Role role, String name, String email, Long entityId) {
        this.token = token;
        this.role = role;
        this.name = name;
        this.email = email;
        this.entityId = entityId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
}
