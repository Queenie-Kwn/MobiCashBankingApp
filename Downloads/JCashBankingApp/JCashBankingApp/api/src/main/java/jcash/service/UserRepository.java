package jcash.service;

import jcash.model.Transaction;
import jcash.model.User;

import java.util.Optional;

/** Data-source abstraction: swap in-memory storage for JDBC without touching business logic. */
public interface UserRepository {
    Optional<User> findByMobile(String mobileNumber) throws BankingException;
    void create(User user) throws BankingException;
    /** Persist the user's new balance and one new transaction log, atomically. */
    void saveCashIn(User user, Transaction tx) throws BankingException;
    /** Persist both balances and both transaction logs, atomically. */
    void saveTransfer(User sender, Transaction senderTx, User receiver, Transaction receiverTx) throws BankingException;
}
