package com.parrotbooks.desktop.model;

public class Book {
    private final String id;
    private final String title;
    private final String author;
    private final String isbn;
    private final String category;
    private final double price;
    private int stock;
    private final String publisher;
    private final String imageUrl;

    public Book(String id, String title, String author, String isbn, String category,
                double price, int stock, String publisher, String imageUrl) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.category = category;
        this.price = price;
        this.stock = stock;
        this.publisher = publisher;
        this.imageUrl = imageUrl;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getIsbn() { return isbn; }
    public String getCategory() { return category; }
    public double getPrice() { return price; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    public String getPublisher() { return publisher; }
    public String getImageUrl() { return imageUrl; }
}
