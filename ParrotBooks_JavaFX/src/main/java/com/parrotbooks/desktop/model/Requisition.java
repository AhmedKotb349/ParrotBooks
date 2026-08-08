package com.parrotbooks.desktop.model;

import java.util.List;

public class Requisition {
    private final String publisher;
    private final List<RequisitionItem> items;

    public Requisition(String publisher, List<RequisitionItem> items) {
        this.publisher = publisher;
        this.items = items;
    }

    public String getPublisher() { return publisher; }
    public List<RequisitionItem> getItems() { return items; }

    public static class RequisitionItem {
        public final String title;
        public final int quantity;
        public RequisitionItem(String title, int quantity) {
            this.title = title;
            this.quantity = quantity;
        }
    }
}
