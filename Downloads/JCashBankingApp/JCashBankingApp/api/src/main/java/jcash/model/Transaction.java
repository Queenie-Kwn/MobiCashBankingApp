package jcash.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Transaction {
    private TransactionType type;
    private BigDecimal amount;
    private String details;
    private LocalDateTime dateTime;

    public Transaction() { }

    public Transaction(TransactionType type, BigDecimal amount, String details) {
        this(type, amount, details, LocalDateTime.now());
    }

    public Transaction(TransactionType type, BigDecimal amount, String details, LocalDateTime dateTime) {
        this.type = type;
        this.amount = amount;
        this.details = details;
        this.dateTime = dateTime;
    }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(LocalDateTime dateTime) { this.dateTime = dateTime; }
}
