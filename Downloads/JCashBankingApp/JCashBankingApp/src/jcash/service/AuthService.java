package jcash.service;

import jcash.model.User;
import jcash.util.PinUtil;

import java.util.Optional;

public class AuthService {
    public static final int MAX_ATTEMPTS = 3;

    public enum Result { SUCCESS, MOBILE_NOT_FOUND, WRONG_PIN }

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

    public User getLoggedInUser() { return loggedIn; }
    public void logout() { loggedIn = null; }
}
