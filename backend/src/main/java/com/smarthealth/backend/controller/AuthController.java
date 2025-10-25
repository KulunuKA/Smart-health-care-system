package com.smarthealth.backend.controller;

import com.smarthealth.backend.model.Patient;
import com.smarthealth.backend.service.PatientService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final PatientService patientService;

    public AuthController(PatientService patientService){
        this.patientService = patientService;
    }

    @PostMapping("/register")
    public Patient register(@RequestBody Patient patient) {
        return patientService.register(patient);
    }

    @PostMapping("/login")
    public Patient login(@RequestBody Patient loginRequest) {
        return patientService.login(loginRequest.getEmail(), loginRequest.getPassword());
    }
}
