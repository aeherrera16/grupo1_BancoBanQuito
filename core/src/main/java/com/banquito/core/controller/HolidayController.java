package com.banquito.core.controller;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.banquito.core.dto.HolidayRequestDTO;
import com.banquito.core.dto.HolidayResponseDTO;
import com.banquito.core.model.Holiday;
import com.banquito.core.repository.HolidayRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/core/v1/holidays")
@RequiredArgsConstructor
public class HolidayController {

    private final HolidayRepository holidayRepository;

    @GetMapping
    public ResponseEntity<List<HolidayResponseDTO>> findAll() {
        return ResponseEntity.ok(holidayRepository.findAll().stream()
                .map(this::toResponse)
                .toList());
    }

    @GetMapping("/{date}")
    public ResponseEntity<HolidayResponseDTO> findByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(holidayRepository.findByHolidayDate(date)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Holiday not found for date: " + date)));
    }

    @PostMapping
    public ResponseEntity<HolidayResponseDTO> create(@RequestBody HolidayRequestDTO request) {
        Holiday holiday = new Holiday();
        holiday.setHolidayDate(request.getHolidayDate());
        holiday.setName(request.getName());
        holiday.setIsWeekend(request.getIsWeekend() != null ? request.getIsWeekend() : false);
        holiday.setCreationDate(LocalDateTime.now());

        Holiday saved = holidayRepository.save(holiday);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    @DeleteMapping("/{date}")
    public ResponseEntity<Void> delete(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        holidayRepository.findByHolidayDate(date)
                .ifPresentOrElse(
                        h -> holidayRepository.delete(h),
                        () -> {
                            throw new IllegalArgumentException("Holiday not found for date: " + date);
                        }
                );
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/business-day")
    public ResponseEntity<Map<String, Object>> isBusinessDay(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        boolean weekend = date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;
        boolean holiday = holidayRepository.findByHolidayDate(date).isPresent();
        boolean businessDay = !(weekend || holiday);

        return ResponseEntity.ok(Map.of(
                "date", date.toString(),
                "businessDay", businessDay,
                "weekend", weekend,
                "holiday", holiday
        ));
    }

    private HolidayResponseDTO toResponse(Holiday holiday) {
        HolidayResponseDTO dto = new HolidayResponseDTO();
        dto.setHolidayDate(holiday.getHolidayDate());
        dto.setName(holiday.getName());
        dto.setIsWeekend(holiday.getIsWeekend());
        dto.setCreationDate(holiday.getCreationDate());
        return dto;
    }
}
