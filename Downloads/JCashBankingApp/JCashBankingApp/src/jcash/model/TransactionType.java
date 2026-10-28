package jcash.model;

public enum TransactionType {
    CASH_IN("Cash-In"),
    TRANSFER_OUT("Transfer Sent"),
    TRANSFER_IN("Transfer Received");

    private final String label;

    TransactionType(String label) { this.label = label; }

    public String getLabel() { return label; }
}
