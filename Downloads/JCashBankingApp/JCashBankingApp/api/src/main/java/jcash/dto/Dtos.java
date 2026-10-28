package jcash.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Dtos {

    public record LoginRequest(String mobile, String pin) {}

    public record RegisterRequest(String mobile, String pin, String fullName) {}

    public record LoginResponse(String token, String fullName, String mobile) {}

    public record BalanceResponse(BigDecimal balance) {}

    public record AmountRequest(BigDecimal amount) {}

    public record TransferRequest(String receiverMobile, BigDecimal amount) {}

    public record TransactionDto(String type, String typeLabel, BigDecimal amount,
                                 String details, LocalDateTime dateTime) {}

    public record ErrorResponse(String message) {}
}
