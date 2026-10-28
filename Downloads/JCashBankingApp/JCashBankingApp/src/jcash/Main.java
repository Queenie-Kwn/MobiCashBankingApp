package jcash;

import jcash.model.Transaction;
import jcash.model.User;
import jcash.service.*;
import jcash.util.InputUtil;
import jcash.util.PinUtil;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.List;

public class Main {
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss", Locale.ROOT);

    public static void main(String[] args) {
        UserRepository repo;
        boolean useJdbc = args.length > 0 && args[0].equalsIgnoreCase("jdbc");
        try {
            repo = useJdbc ? new JdbcUserRepository() : new InMemoryUserRepository();

        } catch (BankingException e) {
            System.out.println("Startup error: " + e.getMessage());
            return;
        }
        System.out.println("=== MobiCash Banking App (" + (useJdbc ? "JDBC" : "in-memory") + " storage) ===");

        AuthService auth = new AuthService(repo);
        BankingService bank = new BankingService(repo);

        User user = startFlow(auth, repo);
        if (user == null) {
            System.out.println("Too many failed attempts. Access blocked.");
            return;
        }

        System.out.println("\nWelcome, " + user.getFullName() + "!");
        menuLoop(bank, user);
        auth.logout();
        System.out.println("Logged out. Thank you for using JCash.");
    }

    private static User startFlow(AuthService auth, UserRepository repo) {
        while (true) {
            System.out.println("\n1. Login\n2. Register");
            String choice = InputUtil.readLine("Choose: ");
            if (choice.equals("2")) { registerFlow(repo); continue; }
            User u = loginFlow(auth);
            if (u != null) return u;
            // loginFlow exhausted all attempts — exit
            return null;
        }
    }

    private static void registerFlow(UserRepository repo) {
        String mobile = InputUtil.readLine("Mobile number: ");
        try {
            if (repo.findByMobile(mobile).isPresent()) {
                System.out.println("Mobile number already registered."); return;
            }
        } catch (BankingException e) { System.out.println("Error: " + e.getMessage()); return; }
        String name = InputUtil.readLine("Full name: ");
        String pin = InputUtil.readLine("PIN (4 digits): ");
        if (!pin.matches("\\d{4}")) { System.out.println("PIN must be exactly 4 digits."); return; }
        try {
            repo.create(new User(0, mobile, PinUtil.hash(pin), name, BigDecimal.ZERO));
            System.out.println("Account created! You can now log in.");
        } catch (BankingException e) { System.out.println("Error: " + e.getMessage()); }
    }

    private static User loginFlow(AuthService auth) {
        for (int attempt = 1; attempt <= AuthService.MAX_ATTEMPTS; attempt++) {
            String mobile = InputUtil.readLine("Mobile number: ");
            String pin = InputUtil.readLine("PIN: ");
            try {
                switch (auth.login(mobile, pin)) {
                    case SUCCESS -> { return auth.getLoggedInUser(); }
                    case MOBILE_NOT_FOUND -> System.out.println("Mobile number is not registered.");
                    case WRONG_PIN -> System.out.println("Incorrect PIN.");
                }
            } catch (BankingException e) {
                System.out.println(e.getMessage());
            }
            System.out.println("Attempt " + attempt + " of " + AuthService.MAX_ATTEMPTS + " failed.\n");
        }
        return null;
    }

    private static void menuLoop(BankingService bank, User user) {
        while (true) {
            System.out.println("\n1. Check Balance\n2. Cash-In\n3. Transfer\n4. Transaction Logs\n5. Logout");
            String choice = InputUtil.readLine("Choose: ");
            try {
                switch (choice) {
                    case "1" -> System.out.printf("Current balance: PHP %,.2f%n", bank.getBalance(user));
                    case "2" -> {
                        BigDecimal amt = InputUtil.readAmount("Cash-in amount: ");
                        if (amt == null) { System.out.println("Invalid amount. Enter a positive number (max 2 decimals)."); break; }
                        bank.cashIn(user, amt);
                        System.out.printf("Cash-in successful. New balance: PHP %,.2f%n", user.getBalance());
                    }
                    case "3" -> {
                        String to = InputUtil.readLine("Receiver mobile number: ");
                        BigDecimal amt = InputUtil.readAmount("Amount to transfer: ");
                        if (amt == null) { System.out.println("Invalid amount. Enter a positive number (max 2 decimals)."); break; }
                        bank.transfer(user, to, amt);
                        System.out.printf("Transfer successful. New balance: PHP %,.2f%n", user.getBalance());
                    }
                    case "4" -> printLogs(bank.getTransactionLogs(user));
                    case "5" -> { return; }
                    default -> System.out.println("Invalid choice.");
                }
            } catch (BankingException e) {
                System.out.println("Error: " + e.getMessage());
            }
        }
    }

    private static void printLogs(List<Transaction> logs) {
        if (logs.isEmpty()) { System.out.println("No transactions yet."); return; }
        System.out.printf("%-20s %-18s %14s  %s%n", "Date/Time", "Type", "Amount", "Details");
        StringBuilder sb = new StringBuilder();   // build output once instead of many small prints
        for (Transaction t : logs) {
            sb.append(String.format("%-20s %-18s %,14.2f  %s%n",
                    t.getDateTime().format(FMT), t.getType().getLabel(), t.getAmount(), t.getDetails()));
        }
        System.out.print(sb);
    }

}
