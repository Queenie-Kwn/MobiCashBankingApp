package jcash.service;

import jcash.model.Transaction;
import jcash.model.TransactionType;
import jcash.model.User;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

public class BankingService {
    private final UserRepository repo;

    public BankingService(UserRepository repo) { this.repo = repo; }

    public BigDecimal getBalance(User user) { return user.getBalance(); }

    public void cashIn(User user, BigDecimal amount) throws BankingException {
        requirePositive(amount);
        BigDecimal oldBalance = user.getBalance();
        Transaction tx = new Transaction(TransactionType.CASH_IN, amount, "Cash-in to wallet");
        user.setBalance(oldBalance.add(amount));
        user.addTransaction(tx);
        try {
            repo.saveCashIn(user, tx);
        } catch (BankingException e) {                       // roll back in-memory state
            user.setBalance(oldBalance);
            user.getTransactions().remove(tx);
            throw e;
        }
    }

    public void transfer(User sender, String receiverMobile, BigDecimal amount) throws BankingException {
        requirePositive(amount);
        if (receiverMobile == null || receiverMobile.isBlank())
            throw new BankingException("Receiver mobile number is required.");
        if (receiverMobile.equals(sender.getMobileNumber()))
            throw new BankingException("You cannot transfer money to yourself.");

        User receiver = repo.findByMobile(receiverMobile)
                .orElseThrow(() -> new BankingException("Receiver not found."));
        if (sender.getBalance().compareTo(amount) < 0)
            throw new BankingException("Insufficient balance.");

        BigDecimal senderOld = sender.getBalance();
        BigDecimal receiverOld = receiver.getBalance();
        Transaction out = new Transaction(TransactionType.TRANSFER_OUT, amount,
                "Sent to " + receiver.getFullName() + " (" + receiver.getMobileNumber() + ")");
        Transaction in = new Transaction(TransactionType.TRANSFER_IN, amount,
                "Received from " + sender.getFullName() + " (" + sender.getMobileNumber() + ")");

        sender.setBalance(senderOld.subtract(amount));
        receiver.setBalance(receiverOld.add(amount));
        sender.addTransaction(out);
        receiver.addTransaction(in);
        try {
            repo.saveTransfer(sender, out, receiver, in);
        } catch (BankingException e) {
            sender.setBalance(senderOld);
            receiver.setBalance(receiverOld);
            sender.getTransactions().remove(out);
            receiver.getTransactions().remove(in);
            throw e;
        }
    }

    public List<Transaction> getTransactionLogs(User user) {
        return Collections.unmodifiableList(user.getTransactions());
    }

    private void requirePositive(BigDecimal amount) throws BankingException {
        if (amount == null || amount.signum() <= 0)
            throw new BankingException("Amount must be a positive number.");
    }
}
