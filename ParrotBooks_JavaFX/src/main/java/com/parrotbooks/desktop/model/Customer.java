package com.parrotbooks.desktop.model;

public class Customer {
    private final String id;
    private final String name;
    private final String email;
    private final String address;

    public Customer(String id, String name, String email, String address) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.address = address;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getAddress() { return address; }

    @Override
    public String toString() { return name; } // shows nicely in a ComboBox
}
