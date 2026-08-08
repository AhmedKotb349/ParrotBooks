package com.parrotbooks.desktop.model;

public class OrderLine {
    private final Book book;
    private final int quantity;
    private final double extendedPrice;
    private final boolean inStock; // false => shortfall line

    public OrderLine(Book book, int quantity, boolean inStock) {
        this.book = book;
        this.quantity = quantity;
        this.extendedPrice = book.getPrice() * quantity;
        this.inStock = inStock;
    }

    public Book getBook() { return book; }
    public int getQuantity() { return quantity; }
    public double getExtendedPrice() { return extendedPrice; }
    public boolean isInStock() { return inStock; }
}
