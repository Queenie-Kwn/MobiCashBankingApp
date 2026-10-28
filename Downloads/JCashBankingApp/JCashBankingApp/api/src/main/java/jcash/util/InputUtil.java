package jcash.util;

import java.math.BigDecimal;
import java.util.Scanner;

public final class InputUtil {
    private static final Scanner SC = new Scanner(System.in);
    private InputUtil() { }

    public static String readLine(String prompt) {
        System.out.print(prompt);
        return SC.hasNextLine() ? SC.nextLine().trim() : "";
    }

    /** Returns a positive amount with at most 2 decimals, or null if invalid. */
    public static BigDecimal readAmount(String prompt) {
        String s = readLine(prompt).replace(",", "");
        try {
            BigDecimal amt = new BigDecimal(s);
            if (amt.signum() <= 0 || amt.scale() > 2) return null;
            return amt;
        } catch (NumberFormatException e) {
            System.out.println("Invalid number format: " + e.getMessage());
            return null;
        }
    }

    public static boolean hasMoreInput() { return SC.hasNextLine(); }
}
