package jcash.controller;

import jcash.config.JwtUtil;
import jcash.dto.Dtos.*;
import jcash.service.AuthService;
import jcash.service.BankingException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) throws BankingException {
        AuthService.Result result = authService.login(req.mobile(), req.pin());
        return switch (result) {
            case SUCCESS -> {
                var user = authService.getLoggedInUser();
                yield ResponseEntity.ok(new LoginResponse(
                        jwtUtil.generate(user.getMobileNumber()),
                        user.getFullName(),
                        user.getMobileNumber()));
            }
            case MOBILE_NOT_FOUND -> ResponseEntity.status(404)
                    .body(new ErrorResponse("Mobile number not registered."));
            case WRONG_PIN -> ResponseEntity.status(401)
                    .body(new ErrorResponse("Incorrect PIN."));
            default -> ResponseEntity.status(400).body(new ErrorResponse("Unexpected error."));
        };
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) throws BankingException {
        AuthService.Result result = authService.register(req.mobile(), req.pin(), req.fullName());
        return switch (result) {
            case SUCCESS -> {
                var user = authService.getLoggedInUser();
                yield ResponseEntity.ok(new LoginResponse(
                        jwtUtil.generate(user.getMobileNumber()),
                        user.getFullName(),
                        user.getMobileNumber()));
            }
            case ALREADY_REGISTERED -> ResponseEntity.status(409)
                    .body(new ErrorResponse("Mobile number already registered."));
            default -> ResponseEntity.status(400).body(new ErrorResponse("Unexpected error."));
        };
    }
}
