package ec.edu.espe.banquito.switchpagos.util;

import ec.edu.espe.banquito.switchpagos.enums.BatchStatusEnum;
import ec.edu.espe.banquito.switchpagos.enums.ChannelEnum;
import ec.edu.espe.banquito.switchpagos.enums.ChargeStatusEnum;
import ec.edu.espe.banquito.switchpagos.enums.PaymentDetailStatusEnum;
import ec.edu.espe.banquito.switchpagos.enums.ServiceTypeEnum;

/**
 * Utility class for enum conversions and common operations.
 */
public class EnumUtils {

    /**
     * Safely converts a string to ChannelEnum, returns null if invalid.
     */
    public static ChannelEnum safeChannelEnumFromString(String value) {
        try {
            if (value == null) return null;
            return ChannelEnum.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            try {
                return ChannelEnum.fromDisplayName(value);
            } catch (IllegalArgumentException ex) {
                return null;
            }
        }
    }

    /**
     * Safely converts a string to ServiceTypeEnum, returns null if invalid.
     */
    public static ServiceTypeEnum safeServiceTypeEnumFromString(String value) {
        try {
            if (value == null) return null;
            return ServiceTypeEnum.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            try {
                return ServiceTypeEnum.fromDisplayName(value);
            } catch (IllegalArgumentException ex) {
                return null;
            }
        }
    }

    /**
     * Safely converts a string to BatchStatusEnum, returns null if invalid.
     */
    public static BatchStatusEnum safeBatchStatusEnumFromString(String value) {
        try {
            if (value == null) return null;
            return BatchStatusEnum.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            try {
                return BatchStatusEnum.fromDisplayName(value);
            } catch (IllegalArgumentException ex) {
                return null;
            }
        }
    }

    /**
     * Safely converts a string to PaymentDetailStatusEnum, returns null if invalid.
     */
    public static PaymentDetailStatusEnum safePaymentDetailStatusEnumFromString(String value) {
        try {
            if (value == null) return null;
            return PaymentDetailStatusEnum.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            try {
                return PaymentDetailStatusEnum.fromDisplayName(value);
            } catch (IllegalArgumentException ex) {
                return null;
            }
        }
    }

    /**
     * Safely converts a string to ChargeStatusEnum, returns null if invalid.
     */
    public static ChargeStatusEnum safeChargeStatusEnumFromString(String value) {
        try {
            if (value == null) return null;
            return ChargeStatusEnum.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            try {
                return ChargeStatusEnum.fromDisplayName(value);
            } catch (IllegalArgumentException ex) {
                return null;
            }
        }
    }

    /**
     * Checks if a validation result represents success.
     */
    public static boolean isValidationSuccess(String validationResult) {
        return "SUCCESS".equalsIgnoreCase(validationResult) || "VALID".equalsIgnoreCase(validationResult);
    }

    /**
     * Checks if a validation result represents rejection.
     */
    public static boolean isValidationRejected(String validationResult) {
        return "REJECTED".equalsIgnoreCase(validationResult);
    }
}
