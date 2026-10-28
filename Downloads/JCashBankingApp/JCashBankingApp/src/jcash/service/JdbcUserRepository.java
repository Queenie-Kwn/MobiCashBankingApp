package jcash.service;

import jcash.model.Transaction;
import jcash.model.TransactionType;
import jcash.model.User;
import jcash.util.DatabaseUtil;

import java.sql.*;
import java.util.Optional;

public class JdbcUserRepository implements UserRepository {
    private static final String INSERT_TX =
            "INSERT INTO transactions (user_id, type, amount, details, created_at) VALUES (?,?,?,?,?)";
    private static final String UPDATE_BAL = "UPDATE users SET balance = ? WHERE id = ?";

    public JdbcUserRepository() throws BankingException {
        try { DatabaseUtil.checkConnection(); }
        catch (SQLException e) {
            throw new BankingException("Cannot connect to MySQL. Start MySQL in XAMPP and import database/schema.sql in phpMyAdmin. (" + e.getMessage() + ")", e);
        }
    }

    @Override
    public Optional<User> findByMobile(String mobile) throws BankingException {
        try (Connection c = DatabaseUtil.getConnection();
             PreparedStatement ps = c.prepareStatement(
                     "SELECT id, mobile_number, pin, full_name, balance FROM users WHERE mobile_number = ?")) {
            ps.setString(1, mobile);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return Optional.empty();
                User u = new User(rs.getLong("id"), rs.getString("mobile_number"), rs.getString("pin"),
                        rs.getString("full_name"), rs.getBigDecimal("balance"));
                loadTransactions(c, u);
                return Optional.of(u);
            }
        } catch (SQLException e) {
            throw new BankingException("Database error: " + e.getMessage(), e);
        }
    }

    private void loadTransactions(Connection c, User u) throws SQLException {
        try (PreparedStatement ps = c.prepareStatement(
                "SELECT type, amount, details, created_at FROM transactions WHERE user_id = ? ORDER BY id")) {
            ps.setLong(1, u.getId());
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    u.addTransaction(new Transaction(TransactionType.valueOf(rs.getString("type")),
                            rs.getBigDecimal("amount"), rs.getString("details"),
                            rs.getTimestamp("created_at").toLocalDateTime()));
                }
            }
        }
    }

    @Override
    public void create(User user) throws BankingException {
        try (Connection c = DatabaseUtil.getConnection();
             PreparedStatement ps = c.prepareStatement(
                     "INSERT INTO users (mobile_number, pin, full_name, balance) VALUES (?,?,?,?)",
                     Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, user.getMobileNumber());
            ps.setString(2, user.getPin());
            ps.setString(3, user.getFullName());
            ps.setBigDecimal(4, user.getBalance());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) { if (keys.next()) user.setId(keys.getLong(1)); }
        } catch (SQLException e) {
            throw new BankingException("Database error: " + e.getMessage(), e);
        }
    }

    @Override
    public void saveCashIn(User user, Transaction tx) throws BankingException {
        runInTransaction(c -> { updateBalance(c, user); insertTx(c, user, tx); });
    }

    @Override
    public void saveTransfer(User s, Transaction st, User r, Transaction rt) throws BankingException {
        runInTransaction(c -> { updateBalance(c, s); updateBalance(c, r); insertTx(c, s, st); insertTx(c, r, rt); });
    }

    private interface SqlWork { void run(Connection c) throws SQLException; }

    /** One connection, one commit: either every statement succeeds or none do. */
    private void runInTransaction(SqlWork work) throws BankingException {
        try (Connection c = DatabaseUtil.getConnection()) {
            c.setAutoCommit(false);
            try { work.run(c); c.commit(); }
            catch (SQLException e) { c.rollback(); throw e; }
        } catch (SQLException e) {
            throw new BankingException("Database error: " + e.getMessage(), e);
        }
    }

    private void updateBalance(Connection c, User u) throws SQLException {
        try (PreparedStatement ps = c.prepareStatement(UPDATE_BAL)) {
            ps.setBigDecimal(1, u.getBalance());
            ps.setLong(2, u.getId());
            ps.executeUpdate();
        }
    }

    private void insertTx(Connection c, User u, Transaction t) throws SQLException {
        try (PreparedStatement ps = c.prepareStatement(INSERT_TX)) {
            ps.setLong(1, u.getId());
            ps.setString(2, t.getType().name());
            ps.setBigDecimal(3, t.getAmount());
            ps.setString(4, t.getDetails());
            ps.setTimestamp(5, Timestamp.valueOf(t.getDateTime()));
            ps.executeUpdate();
        }
    }
}
