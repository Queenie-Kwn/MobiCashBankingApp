package jcash.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * JDBC helper for MySQL/MariaDB (the database managed through phpMyAdmin / XAMPP).
 * Defaults match XAMPP: localhost:3306, user "root", empty password, database "jcash_db".
 * Override with env vars JCASH_DB_URL, JCASH_DB_USER, JCASH_DB_PASS.
 */
public final class DatabaseUtil {
    private static final String URL  = System.getenv().getOrDefault("MOBICASH_DB_URL",
            "jdbc:mysql://localhost:3306/mobicash_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Manila");
    private static final String USER = System.getenv().getOrDefault("MOBICASH_DB_USER", "root");
    private static final String PASS = System.getenv().getOrDefault("MOBICASH_DB_PASS", "");

    private DatabaseUtil() { }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }

    /** Fails fast with a clear message if the DB is down or schema.sql was not imported. */
    public static void checkConnection() throws SQLException {
        try (Connection c = getConnection();
             java.sql.Statement st = c.createStatement();
             java.sql.ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM users")) {
            rs.next();
        }
    }
}
