package com.example.finalHclHackathon.config;

import com.example.finalHclHackathon.entity.Doctor;
import com.example.finalHclHackathon.entity.Specialty;
import com.example.finalHclHackathon.entity.User;
import com.example.finalHclHackathon.enums.ConsultationMode;
import com.example.finalHclHackathon.enums.Role;
import com.example.finalHclHackathon.repository.DoctorRepository;
import com.example.finalHclHackathon.repository.SpecialtyRepository;
import com.example.finalHclHackathon.repository.UserRepository;
import com.example.finalHclHackathon.service.SlotService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SpecialtyRepository specialtyRepository;
    private final DoctorRepository doctorRepository;
    private final SlotService slotService;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder,
                      SpecialtyRepository specialtyRepository, DoctorRepository doctorRepository,
                      SlotService slotService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.specialtyRepository = specialtyRepository;
        this.doctorRepository = doctorRepository;
        this.slotService = slotService;
    }

    @Override
    public void run(String... args) {
        // Seed default admin if no admin exists
        if (!userRepository.existsByEmail("admin@hospital.com")) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@hospital.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("=== Default admin created: admin@hospital.com / admin123 ===");
        }

        List<String> specialtyNames = Arrays.asList(
            "General Physician", "Pediatrics", "Dermatology", "Gynecology", "Orthopedics",
            "Cardiology", "Neurology", "Ophthalmology", "ENT", "Psychiatry", "Psychology",
            "Gastroenterology", "Nephrology", "Urology", "Pulmonology", "Endocrinology",
            "Oncology", "Rheumatology", "Dentistry", "Physiotherapy", "Nutrition",
            "Homeopathy", "Ayurveda", "General Surgery", "Plastic Surgery", "Vascular Surgery",
            "Spine", "Diabetology", "Pain Management"
        );

        List<String> southIndianFirstNamesMale = Arrays.asList("Karthik", "Ramesh", "Suresh", "Venkatesh", "Balaji", "Sriram", "Prakash", "Mahesh", "Vijay", "Ajith", "Arvind", "Prasad", "Siva", "Gopi");
        List<String> southIndianFirstNamesFemale = Arrays.asList("Lakshmi", "Kavitha", "Priya", "Anitha", "Geetha", "Radhika", "Savitha", "Sujatha", "Revathi", "Vidya", "Nithya", "Ramya", "Sowmya");
        List<String> southIndianLastNames = Arrays.asList("Reddy", "Rao", "Nair", "Menon", "Iyer", "Iyengar", "Pillai", "Gowda", "Hegde", "Shetty", "Babu", "Kumar", "Raj");

        List<String> existingSpecs = specialtyRepository.findAll().stream().map(Specialty::getName).collect(Collectors.toList());

        int maleIdx = 0;
        int femaleIdx = 0;
        int lastIdx = 0;

        for (String specName : specialtyNames) {
            if (!existingSpecs.contains(specName)) {
                Specialty specialty = new Specialty();
                specialty.setName(specName);
                specialty = specialtyRepository.save(specialty);

                // Create Online Doctor (Male)
                String mFirst = southIndianFirstNamesMale.get(maleIdx % southIndianFirstNamesMale.size());
                String mLastName = southIndianLastNames.get(lastIdx % southIndianLastNames.size());
                String mName = mFirst + " " + mLastName;
                String mEmail = mFirst.toLowerCase() + "." + mLastName.toLowerCase() + "_" + specName.replaceAll("\\s+", "").toLowerCase() + "@hospital.com";

                Doctor doc1 = new Doctor();
                doc1.setName(mName);
                doc1.setEmail(mEmail);
                doc1.setPhone("9876543" + String.format("%03d", maleIdx));
                doc1.setQualification("MD " + specName);
                doc1.setConsultationFee(500.0 + (maleIdx * 10)); // variable fee
                doc1.setMode(ConsultationMode.ONLINE);
                doc1.setMeetingLink("https://zoom.us/j/9876" + maleIdx);
                doc1.setSpecialty(specialty);
                doc1 = doctorRepository.save(doc1);

                User user1 = new User();
                user1.setName(doc1.getName());
                user1.setEmail(doc1.getEmail());
                user1.setPassword(passwordEncoder.encode("doc123"));
                user1.setRole(Role.DOCTOR);
                userRepository.save(user1);

                maleIdx++;
                lastIdx++;

                // Create Offline Doctor (Female)
                String fFirst = southIndianFirstNamesFemale.get(femaleIdx % southIndianFirstNamesFemale.size());
                String fLastName = southIndianLastNames.get(lastIdx % southIndianLastNames.size());
                String fName = fFirst + " " + fLastName;
                String fEmail = fFirst.toLowerCase() + "." + fLastName.toLowerCase() + "_" + specName.replaceAll("\\s+", "").toLowerCase() + "@hospital.com";

                Doctor doc2 = new Doctor();
                doc2.setName(fName);
                doc2.setEmail(fEmail);
                doc2.setPhone("9876544" + String.format("%03d", femaleIdx));
                doc2.setQualification("MS " + specName);
                doc2.setConsultationFee(600.0 + (femaleIdx * 10)); // variable fee
                doc2.setMode(ConsultationMode.OFFLINE);
                doc2.setSpecialty(specialty);
                doc2 = doctorRepository.save(doc2);

                User user2 = new User();
                user2.setName(doc2.getName());
                user2.setEmail(doc2.getEmail());
                user2.setPassword(passwordEncoder.encode("doc123"));
                user2.setRole(Role.DOCTOR);
                userRepository.save(user2);

                femaleIdx++;
                lastIdx++;
            }
        }
        
        System.out.println("=== Missing Specialties and Doctors Seeded Successfully ===");

        // Auto-generate slots for today and tomorrow for ALL doctors if they don't have slots
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        
        doctorRepository.findAll().forEach(doctor -> {
            try {
                slotService.generateSlotsForDoctor(doctor.getId(), today);
                System.out.println("Generated slots for " + doctor.getName() + " for today.");
            } catch (Exception e) {}
            try {
                slotService.generateSlotsForDoctor(doctor.getId(), tomorrow);
                System.out.println("Generated slots for " + doctor.getName() + " for tomorrow.");
            } catch (Exception e) {}
        });
    }
}
