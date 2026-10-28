# MobiCash Banking App (Java, OOP + JDBC)

## Project structure (Step A)
```
database/schema.sql              <- import in phpMyAdmin
lib/                            <- put MySQL Connector/J jar here
src/jcash/
  Main.java                       <- main class (menu + login flow)
  model/      User, Transaction, TransactionType
  service/    AuthService, BankingService, BankingException,
              UserRepository (interface), InMemoryUserRepository, JdbcUserRepository
  util/       PinUtil (SHA-256), InputUtil (validated console input), DatabaseUtil (JDBC)
```

## OOP concepts used
- **Encapsulation**: private fields + getters/setters in `User` and `Transaction`.
- **Polymorphism / abstraction**: `UserRepository` interface with two implementations; services don't care which.
- **Separation of concerns**: model (data), service (rules), util (helpers), Main (UI).

## Run it with phpMyAdmin (XAMPP / WAMP)
1. Open **XAMPP Control Panel** and start **Apache** and **MySQL**.
2. Go to http://localhost/phpmyadmin -> **Import** tab -> choose `database/schema.sql` -> **Go**.
   (or open the **SQL** tab and paste the file contents). This creates database `mobicash_db`,
   tables `users` and `transactions`, and two demo accounts.
3. Download **MySQL Connector/J** (`mysql-connector-j-x.x.x.jar`) from https://dev.mysql.com/downloads/connector/j/
   (choose "Platform Independent") and put the jar in the `lib/` folder.
4. Compile and run:
```bash
mkdir out
javac -d out $(find src -name '*.java')          # Windows: dir /s /b src\*.java > files.txt, then javac -d out @files.txt
java -cp "out;lib/*" jcash.Main jdbc             # Windows uses ;   Linux/Mac use :
java -cp out jcash.Main                          # optional: in-memory mode, no database
```
**IDE (NetBeans/IntelliJ/Eclipse):** add the Connector/J jar to the project libraries, set the program
argument to `jdbc`, and run `jcash.Main`.

Default connection (XAMPP): `localhost:3306`, user `root`, empty password, database `mobicash_db`.
If yours differs, set env vars `MOBICASH_DB_URL`, `MOBICASH_DB_USER`, `MOBICASH_DB_PASS`
(or edit `util/DatabaseUtil.java`).

Demo accounts: `09171234567` / PIN `1234` (PHP 1,000) and `09981234567` / PIN `4321` (PHP 500).
You can watch balances and the `transactions` table change live in phpMyAdmin while using the app.

## Feature map (Steps B–H)
| Step | Where |
|---|---|
| B User model (long id, mobile, PIN, name, balance, transactions) | `model/User` |
| C Transaction model (type, amount, details, date/time) | `model/Transaction` |
| D Login, max 3 tries, separate "not registered" / "wrong PIN" messages | `AuthService`, `Main.loginFlow` |
| E Balance | `BankingService.getBalance` |
| F Cash-in (positive amounts only, saved + logged) | `BankingService.cashIn` |
| G Transfer (validates receiver, amount, sender balance, not self) | `BankingService.transfer` |
| H Transaction logs | `BankingService.getTransactionLogs`, `Main.printLogs` |

## Step I – Performance tuning (multi-layered)
**1. Application code**
- `BigDecimal` for money (no floating-point errors).
- `HashMap` lookup by mobile number in memory mode (O(1)).
- `StringBuilder` to build the transaction log output in one print.
- Unmodifiable list returned for logs (no defensive copying).

**2. Data access (JDBC)**
- `PreparedStatement` everywhere (SQL-injection safe, statement reuse by the driver).
- Index `idx_tx_user` on `transactions(user_id)`; `UNIQUE` index on `users.mobile_number`; InnoDB for transaction support.
- Transfers use one connection and one commit (`setAutoCommit(false)`, rollback on error).
- Try-with-resources closes every Connection/Statement/ResultSet.
- For production: add a connection pool (HikariCP) instead of opening a connection per call.

**3. Container / server configuration** (if deployed in Docker/Tomcat)
- Set container memory limits and use `-XX:MaxRAMPercentage=75` so the JVM respects them.
- Size the DB connection pool to roughly the number of worker threads.
- Keep the image small and run as a non-root user.

**4. JVM runtime settings**
```bash
java -Xms256m -Xmx256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 \
     -Xlog:gc*:file=gc.log -cp out jcash.Main

```
- Equal `-Xms`/`-Xmx` avoids heap resizing; G1GC with a pause target suits interactive apps.

**Monitoring OS/JVM performance (assessment item)**
`jps` (find PID) → `jstat -gcutil <pid> 1000` (GC), `jcmd <pid> VM.flags`, `jstack <pid>` (threads),
`jconsole`/VisualVM (heap, CPU), and OS tools: `top`/`htop`, `free -m`, `vmstat 1` (Linux) or Task Manager (Windows).
