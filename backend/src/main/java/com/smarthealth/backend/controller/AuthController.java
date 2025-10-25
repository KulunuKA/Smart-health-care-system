package com.smarthealth.backend.controller;

import com.smarthealth.backend.model.Patient;
import com.smarthealth.backend.security.JwtUtils;
import com.smarthealth.backend.service.PatientService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final PatientService service;
    private final JwtUtils jwtUtils;

    public AuthController(PatientService service, JwtUtils jwtUtils) {
        this.service = service;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
    public Patient register(@RequestBody Patient patient) {
        return service.register(patient);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Patient loginRequest) {
        Patient patient = service.login(loginRequest.getEmail(), loginRequest.getPassword());
        String token = jwtUtils.generateToken(patient.getEmail());
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("patient", patient);
        return response;
    }
}
