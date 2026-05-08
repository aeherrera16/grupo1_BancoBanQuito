package com.banquito.core.dto;

public class TransferResultDTO {

    private boolean success;
    private String code;
    private String message;
    private String uuid;

    public TransferResultDTO() {
    }

    public TransferResultDTO(boolean success, String code, String message, String uuid) {
        this.success = success;
        this.code = code;
        this.message = message;
        this.uuid = uuid;
    }

    public static TransferResultDTO ok(String message, String uuid) {
        return new TransferResultDTO(true, "OK", message, uuid);
    }

    public static TransferResultDTO rejected(String code, String message, String uuid) {
        return new TransferResultDTO(false, code, message, uuid);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public String getUuid() {
        return uuid;
    }
}