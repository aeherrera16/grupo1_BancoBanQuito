package com.banquito.core.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "CORE_NOTIFICATION")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID", nullable = false)
    private Integer id;

    @Column(name = "USER_ID", nullable = false, length = 50)
    private String userId; // Puede ser el ID del cliente o del usuario core

    @Column(name = "TITLE", nullable = false, length = 100)
    private String title;

    @Column(name = "MESSAGE", nullable = false, length = 500)
    private String message;

    @Column(name = "DETAIL", length = 1000)
    private String detail;

    @Column(name = "TYPE", nullable = false, length = 20)
    private String type; // CREDITO, DEBITO, INFO, SEGURIDAD

    @Column(name = "IS_UNREAD", nullable = false)
    private Boolean isUnread = true;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Version
    private Long version;
}
