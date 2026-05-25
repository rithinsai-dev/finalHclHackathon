package com.example.finalHclHackathon.repository;

import com.example.finalHclHackathon.entity.LeaveRequest;
import com.example.finalHclHackathon.enums.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByDoctorId(Long doctorId);

    List<LeaveRequest> findByDoctorIdAndStatus(Long doctorId, LeaveStatus status);

    List<LeaveRequest> findByStatus(LeaveStatus status);

    /**
     * Check if a doctor has an approved leave covering a specific date.
     */
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.doctor.id = :doctorId " +
           "AND lr.status = 'APPROVED' AND :date BETWEEN lr.startDate AND lr.endDate")
    List<LeaveRequest> findApprovedLeavesForDoctorOnDate(@Param("doctorId") Long doctorId,
                                                         @Param("date") LocalDate date);
}
