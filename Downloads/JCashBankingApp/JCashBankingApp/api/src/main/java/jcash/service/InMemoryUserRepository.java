package jcash.service;

import jcash.model.Transaction;
import jcash.model.User;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class InMemoryUserRepository implements UserRepository {
    private final Map<String, User> users = new HashMap<>();   // O(1) lookup by mobile
    private long nextId = 1;

    @Override public Optional<User> findByMobile(String mobile) { return Optional.ofNullable(users.get(mobile)); }

    @Override public void create(User user) {
        user.setId(nextId++);
        users.put(user.getMobileNumber(), user);
    }

    // Objects live in memory and are already updated by the service, so nothing more to persist.
    @Override public void saveCashIn(User user, Transaction tx) { }
    @Override public void saveTransfer(User s, Transaction st, User r, Transaction rt) { }
}
