package com.example.finalHclHackathon.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class DailySummaryResponse {

    private LocalDate date;
    private int totalAppointments;
    private int confirmed;
    private int completed;
    private int cancelled;
    private int noShow;

    private double totalRevenue;
    private double onlineRevenue;
    private double offlineRevenue;

    private Map<String, SpecialtySummary> bySpecialty;

    public DailySummaryResponse() {}

    // Getters and Setters
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public int getTotalAppointments() { return totalAppointments; }
    public void setTotalAppointments(int totalAppointments) { this.totalAppointments = totalAppointments; }

    public int getConfirmed() { return confirmed; }
    public void setConfirmed(int confirmed) { this.confirmed = confirmed; }

    public int getCompleted() { return completed; }
    public void setCompleted(int completed) { this.completed = completed; }

    public int getCancelled() { return cancelled; }
    public void setCancelled(int cancelled) { this.cancelled = cancelled; }

    public int getNoShow() { return noShow; }
    public void setNoShow(int noShow) { this.noShow = noShow; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public double getOnlineRevenue() { return onlineRevenue; }
    public void setOnlineRevenue(double onlineRevenue) { this.onlineRevenue = onlineRevenue; }

    public double getOfflineRevenue() { return offlineRevenue; }
    public void setOfflineRevenue(double offlineRevenue) { this.offlineRevenue = offlineRevenue; }

    public Map<String, SpecialtySummary> getBySpecialty() { return bySpecialty; }
    public void setBySpecialty(Map<String, SpecialtySummary> bySpecialty) { this.bySpecialty = bySpecialty; }

    // Inner class for per-specialty breakdown
    public static class SpecialtySummary {
        private int appointmentCount;
        private double revenue;
        private int onlineCount;
        private int offlineCount;

        public SpecialtySummary() {}

        // Getters and Setters
        public int getAppointmentCount() { return appointmentCount; }
        public void setAppointmentCount(int appointmentCount) { this.appointmentCount = appointmentCount; }

        public double getRevenue() { return revenue; }
        public void setRevenue(double revenue) { this.revenue = revenue; }

        public int getOnlineCount() { return onlineCount; }
        public void setOnlineCount(int onlineCount) { this.onlineCount = onlineCount; }

        public int getOfflineCount() { return offlineCount; }
        public void setOfflineCount(int offlineCount) { this.offlineCount = offlineCount; }
    }
}
