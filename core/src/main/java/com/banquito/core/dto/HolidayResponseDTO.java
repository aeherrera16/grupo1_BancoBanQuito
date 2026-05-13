package com.banquito.core.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HolidayResponseDTO {

    private LocalDate holidayDate;

    private String name;

    private Boolean isWeekend;

    private LocalDateTime creationDate;
}
