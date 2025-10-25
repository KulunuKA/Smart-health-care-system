package com.smarthealth.backend.service;

import com.smarthealth.backend.model.Patient;
import com.smarthealth.backend.repository.PatientRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public PatientService(PatientRepository patientRepository){
        this.patientRepository = patientRepository;
    }

    public Patient register(Patient patient){
        if (patientRepository.existsByEmail(patient.getEmail())){
            throw new RuntimeException("Email already registered");
        }

        patient.setPassword(passwordEncoder.encode(patient.getPassword()));
        return patientRepository.save(patient);
    }

    public Patient login(String email, String rawPassword) {
        Optional<Patient> userOpt = patientRepository.findByEmail(email);
        if (userOpt.isPresent() && passwordEncoder.matches(rawPassword, userOpt.get().getPassword())) {
            return userOpt.get();
        }
        throw new RuntimeException("Invalid email or password");
    }

}
