package com.parrotbooks.desktop.model;

import java.util.List;

public class Order {
    private final String id;
    private final Customer customer;
    private final List<OrderLine> lines;
    private final double total;
    private final String status; // "Acknowledged" or "Awaiting Stock"
    private final List<Requisition> requisitions;

    public Order(String id, Customer customer, List<OrderLine> lines, double total,
                 String status, List<Requisition> requisitions) {
        this.id = id;
        this.customer = customer;
        this.lines = lines;
        this.total = total;
        this.status = status;
        this.requisitions = requisitions;
    }

    public String getId() { return id; }
    public Customer getCustomer() { return customer; }
    public List<OrderLine> getLines() { return lines; }
    public double getTotal() { return total; }
    public String getStatus() { return status; }
    public List<Requisition> getRequisitions() { return requisitions; }
}
