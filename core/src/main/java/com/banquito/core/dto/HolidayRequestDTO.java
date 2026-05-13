package com.banquito.core.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HolidayRequestDTO {

    private LocalDate holidayDate;

    private String name;

    private Boolean isWeekend;
}
