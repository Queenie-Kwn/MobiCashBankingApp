package jcash.controller;

import jcash.dto.Dtos.*;
import jcash.model.User;
import jcash.service.BankingException;
import jcash.service.BankingService;
import jcash.service.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final BankingService bankingService;
    private final UserRepository userRepository;

    public AccountController(BankingService bankingService, UserRepository userRepository) {
        this.bankingService = bankingService;
        this.userRepository = userRepository;
    }

    @GetMapping("/balance")
    public ResponseEntity<?> balance(Principal principal) throws BankingException {
        User user = getUser(principal);
        return ResponseEntity.ok(new BalanceResponse(bankingService.getBalance(user)));
    }

    @PostMapping("/cashin")
    public ResponseEntity<?> cashIn(Principal principal,
                                    @RequestBody AmountRequest req) throws BankingException {
        User user = getUser(principal);
        bankingService.cashIn(user, req.amount());
        return ResponseEntity.ok(new BalanceResponse(user.getBalance()));
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(Principal principal,
                                      @RequestBody TransferRequest req) throws BankingException {
        User user = getUser(principal);
        bankingService.transfer(user, req.receiverMobile(), req.amount());
        return ResponseEntity.ok(new BalanceResponse(user.getBalance()));
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> transactions(Principal principal) throws BankingException {
        User user = getUser(principal);
        List<TransactionDto> list = bankingService.getTransactionLogs(user).stream()
                .map(t -> new TransactionDto(
                        t.getType().name(),
                        t.getType().getLabel(),
                        t.getAmount(),
                        t.getDetails(),
                        t.getDateTime()))
                .toList();
        return ResponseEntity.ok(list);
    }

    private User getUser(Principal principal) throws BankingException {
        return userRepository.findByMobile(principal.getName())
                .orElseThrow(() -> new BankingException("User not found."));
    }
}
