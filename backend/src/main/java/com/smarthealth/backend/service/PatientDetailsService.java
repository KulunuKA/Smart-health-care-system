package com.smarthealth.backend.service;

import com.smarthealth.backend.repository.PatientRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class PatientDetailsService implements UserDetailsService {
    private final PatientRepository patientRepository;

    public PatientDetailsService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return User.builder()
                .username(patient.getEmail())
                .password(patient.getPassword())
                .roles("PATIENT")
                .build();
    }
}
