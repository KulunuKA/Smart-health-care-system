package com.smarthealth.backend.dto;


import com.smarthealth.backend.model.Patient;

import java.time.LocalDate;

public class PatientDTO {

    private Long id;
    private String fullName;
    private String email;
    private String contactNumber;
    private LocalDate dateOfBirth;
    private String healthCardNumber;
    private boolean active;

    public PatientDTO() {}

    public PatientDTO(Patient patient) {
        this.id = patient.getId();
        this.fullName = patient.getFullName();
        this.email = patient.getEmail();
        this.contactNumber = patient.getContactNumber();
        this.dateOfBirth = patient.getDateOfBirth();
        this.healthCardNumber = patient.getHealthCardNumber();
        this.active = patient.isActive();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getHealthCardNumber() { return healthCardNumber; }
    public void setHealthCardNumber(String healthCardNumber) { this.healthCardNumber = healthCardNumber; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
