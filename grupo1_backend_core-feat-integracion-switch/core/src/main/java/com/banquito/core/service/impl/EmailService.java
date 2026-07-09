package com.banquito.core.service.impl;

import com.banquito.core.service.IEmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService implements IEmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String mailFrom;

    @Value("${app.mail.from-name}")
    private String mailFromName;

    @Async("emailTaskExecutor")
    @Override
    public void sendTransactionNotificationEmail(String to, String accountNumber, String movementType,
                                                  java.math.BigDecimal amount, java.math.BigDecimal balance,
                                                  String description) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailFrom, mailFromName);
            helper.setTo(to);

            boolean isDebit = "DEBITO".equalsIgnoreCase(movementType);
            String subject = isDebit
                    ? "BanQuito: Débito registrado en su cuenta"
                    : "BanQuito: Crédito registrado en su cuenta";

            String maskedAccount = "***" + accountNumber.substring(Math.max(0, accountNumber.length() - 4));
            String tipoMovimiento = isDebit ? "débito" : "crédito";
            String signo = isDebit ? "-" : "+";

            String text = "Estimado cliente,\n\n" +
                    "Se ha registrado un " + tipoMovimiento + " en su cuenta terminada en " + maskedAccount + ":\n\n" +
                    "  Monto: " + signo + " $" + amount.setScale(2, java.math.RoundingMode.HALF_UP) + "\n" +
                    "  Saldo disponible: $" + balance.setScale(2, java.math.RoundingMode.HALF_UP) + "\n" +
                    (description != null && !description.isBlank() ? "  Descripcion: " + description + "\n" : "") +
                    "\nSi usted no reconoce esta transaccion, comuniquese de inmediato con soporte.\n\n" +
                    "Atentamente,\nBanco BanQuito S.A.";

            helper.setText(text, false);
            helper.setSubject(subject);
            mailSender.send(message);
            log.info("Notificacion de {} enviada a {}", tipoMovimiento, to);
        } catch (Exception e) {
            log.error("Error al enviar notificacion de transaccion a {}: {}", to, e.getMessage());
        }
    }

    @Async("emailTaskExecutor")
    @Override
    public void sendStatusChangeEmail(String to, String accountNumber, String newStatus) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailFrom, mailFromName);
            helper.setTo(to);
            helper.setSubject("Aviso de Seguridad: Cambio de Estado en su Cuenta BanQuito");

            String maskedAccount = "***" + accountNumber.substring(Math.max(0, accountNumber.length() - 4));

            String text = "Estimado cliente,\n\n" +
                    "Le informamos que por motivos de seguridad, su cuenta terminada en " + maskedAccount +
                    " ha cambiado al estado: " + newStatus + ".\n\n" +
                    "Si usted no solicitó ni reconoce esta acción, por favor comuníquese de inmediato con nuestro soporte telefónico.\n\n" +
                    "Atentamente,\nBanco BanQuito S.A.";

            helper.setText(text, false);

            mailSender.send(message);
            log.info("Correo de notificación de estado ({}) enviado exitosamente a {} vía Brevo", newStatus, to);

        } catch (Exception e) {
            log.error("Error al intentar enviar el correo vía Brevo a {}: {}", to, e.getMessage());
        }
    }
}
