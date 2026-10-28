package jcash.model;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class User {
    private long id;                       // primary key
    private String mobileNumber;
    private String pin;                    // stored as a SHA-256 hash, never plain text
    private String fullName;
    private BigDecimal balance;
    private List<Transaction> transactions = new ArrayList<>();

    public User() { }

    public User(long id, String mobileNumber, String pin, String fullName, BigDecimal balance) {
        this.id = id;
        this.mobileNumber = mobileNumber;
        this.pin = pin;
        this.fullName = fullName;
        this.balance = balance;
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getPin() { return pin; }
    public void setPin(String pin) { this.pin = pin; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public List<Transaction> getTransactions() { return transactions; }
    public void setTransactions(List<Transaction> transactions) { this.transactions = transactions; }

    public void addTransaction(Transaction t) { transactions.add(t); }
}
