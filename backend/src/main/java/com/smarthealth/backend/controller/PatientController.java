package com.smarthealth.backend.controller;

import com.smarthealth.backend.dto.PatientDTO;
import com.smarthealth.backend.model.Patient;
import com.smarthealth.backend.security.JwtUtils;
import com.smarthealth.backend.service.PatientService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:3000")
public class PatientController {

    private final PatientService patientService;
    private final JwtUtils jwtUtils;

    public PatientController(PatientService patientService, JwtUtils jwtUtils) {
        this.patientService = patientService;
        this.jwtUtils = jwtUtils;
    }

    @GetMapping("/me")
    public PatientDTO getCurrentPatient(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        String email = jwtUtils.extractEmail(token);

        Patient patient = patientService.getCurrentPatient(email);
        return new PatientDTO(patient);
    }
}
