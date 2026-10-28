package jcash.service;

import jcash.model.User;
import jcash.util.PinUtil;

import java.math.BigDecimal;
import java.util.Optional;

public class AuthService {
    public static final int MAX_ATTEMPTS = 3;

    public enum Result { SUCCESS, MOBILE_NOT_FOUND, WRONG_PIN, ALREADY_REGISTERED }

    private final UserRepository repo;
    private User loggedIn;

    public AuthService(UserRepository repo) { this.repo = repo; }

    public Result login(String mobile, String pin) throws BankingException {
        Optional<User> found = repo.findByMobile(mobile);
        if (found.isEmpty()) return Result.MOBILE_NOT_FOUND;
        User user = found.get();
        if (!PinUtil.matches(pin, user.getPin())) return Result.WRONG_PIN;
        loggedIn = user;
        return Result.SUCCESS;
    }

    public Result register(String mobile, String pin, String fullName) throws BankingException {
        if (repo.findByMobile(mobile).isPresent()) return Result.ALREADY_REGISTERED;
        User user = new User(0L, mobile, PinUtil.hash(pin), fullName, BigDecimal.ZERO);
        repo.create(user);
        loggedIn = user;
        return Result.SUCCESS;
    }

    public User getLoggedInUser() { return loggedIn; }
    public void logout() { loggedIn = null; }
}
