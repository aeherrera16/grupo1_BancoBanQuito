package com.banquito.core.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePasswordRequestDTO {
    private String username;
    private String currentPassword;
    private String newPassword;

    public ChangePasswordRequestDTO() {
    }
}
