package com.parrotbooks.desktop.store;

import com.parrotbooks.desktop.model.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Self-contained, in-memory "database" — no server, no network, nothing to
 * install beyond JavaFX itself. Mirrors the same business rules as the web
 * version: order validation, stock check, purchase requisitions grouped by
 * publisher, extended price / order total calculation.
 */
public class Store {

    private static final Store INSTANCE = new Store();
    public static Store get() { return INSTANCE; }

    private final List<Book> books = new ArrayList<>();
    private final List<Customer> customers = new ArrayList<>();
    private final List<User> users = new ArrayList<>();
    private final List<Order> orders = new ArrayList<>();
    private int orderCounter = 1;

    private Store() {
        seedBooks();
        seedCustomers();
        seedUsers();
    }

    private void seedBooks() {
        books.add(new Book("b1", "Clean Code", "Robert C. Martin", "9780132350884",
                "Programming", 45.0, 120, "Prentice Hall", cover("9780132350884")));
        books.add(new Book("b2", "Introduction to Algorithms", "Cormen, Leiserson, Rivest, Stein",
                "9780262033848", "Computer Science", 90.0, 80, "MIT Press", cover("9780262033848")));
        books.add(new Book("b3", "The Pragmatic Programmer", "David Thomas & Andrew Hunt",
                "9780201616224", "Programming", 50.0, 100, "Addison-Wesley", cover("9780201616224")));
        books.add(new Book("b4", "Atomic Habits", "James Clear", "9780735211292",
                "Self Development", 30.0, 200, "Penguin", cover("9780735211292")));
        books.add(new Book("b5", "Deep Work", "Cal Newport", "9781455586691",
                "Productivity", 28.0, 150, "Grand Central", cover("9781455586691")));
        books.add(new Book("b6", "Rich Dad Poor Dad", "Robert T. Kiyosaki", "9781612680194",
                "Finance", 25.0, 300, "Plata Publishing", cover("9781612680194")));
        books.add(new Book("b7", "Harry Potter and the Sorcerer's Stone", "J.K. Rowling",
                "9780590353427", "Fiction", 20.0, 500, "Scholastic", cover("9780590353427")));
        books.add(new Book("b8", "The Alchemist", "Paulo Coelho", "9780061122415",
                "Fiction", 18.0, 250, "HarperOne", cover("9780061122415")));
        books.add(new Book("b9", "Thinking, Fast and Slow", "Daniel Kahneman", "9780374533557",
                "Psychology", 35.0, 130, "Farrar, Straus and Giroux", cover("9780374533557")));
        books.add(new Book("b10", "Zero to One", "Peter Thiel", "9780804139298",
                "Startup", 27.0, 170, "Crown Business", cover("9780804139298")));
    }

    private String cover(String isbn) {
        return "https://covers.openlibrary.org/b/isbn/" + isbn + "-L.jpg";
    }

    private void seedCustomers() {
        customers.add(new Customer("c1", "Ahmed Ali", "ahmed@test.com", "Cairo, Egypt"));
        customers.add(new Customer("c2", "Sara Mohamed", "sara@test.com", "Alexandria, Egypt"));
    }

    private void seedUsers() {
        users.add(new User("admin", "password123", "Amira Admin", "admin"));
        users.add(new User("sales", "password123", "Sara Sales", "sales"));
        users.add(new User("warehouse", "password123", "Wael Warehouse", "warehouse"));
        users.add(new User("accounts", "password123", "Karim Accounts", "accounts"));
    }

    // ---- Auth ----
    public Optional<User> login(String username, String password) {
        return users.stream()
                .filter(u -> u.getUsername().equals(username) && u.getPassword().equals(password))
                .findFirst();
    }

    // ---- Catalogue ----
    public List<Book> getBooks() { return Collections.unmodifiableList(books); }

    public List<String> getCategories() {
        List<String> cats = books.stream().map(Book::getCategory).distinct().sorted().collect(Collectors.toList());
        cats.add(0, "All");
        return cats;
    }

    /** Related products: up to 4 other books in the same category. */
    public List<Book> getRelated(Book book) {
        List<Book> sameCategory = books.stream()
                .filter(b -> b.getCategory().equals(book.getCategory()) && !b.getId().equals(book.getId()))
                .collect(Collectors.toList());
        Collections.shuffle(sameCategory);
        return sameCategory.stream().limit(4).collect(Collectors.toList());
    }

    // ---- Customers ----
    public List<Customer> getCustomers() { return Collections.unmodifiableList(customers); }

    // ---- Orders ----
    public List<Order> getOrders() { return Collections.unmodifiableList(orders); }

    /**
     * Submits an order: extended price / total (FR5), stock check (FR7/FR8),
     * purchase requisition grouped by publisher for shortfall items
     * (FR9, BRULE3), stock decrement for in-stock lines, acknowledgement
     * withheld while any line is short (FR12/FR13).
     *
     * @param cart map of Book -> requested quantity
     */
    public Order submitOrder(Customer customer, Map<Book, Integer> cart) {
        List<OrderLine> lines = new ArrayList<>();
        double total = 0;
        boolean anyShortfall = false;

        for (Map.Entry<Book, Integer> entry : cart.entrySet()) {
            Book book = entry.getKey();
            int qty = entry.getValue();
            boolean inStock = book.getStock() >= qty;
            if (!inStock) anyShortfall = true;
            lines.add(new OrderLine(book, qty, inStock));
            total += book.getPrice() * qty;
        }

        // Requisitions grouped by publisher (BRULE3)
        Map<String, List<Requisition.RequisitionItem>> byPublisher = new LinkedHashMap<>();
        for (OrderLine line : lines) {
            if (!line.isInStock()) {
                int shortQty = line.getQuantity() - line.getBook().getStock();
                byPublisher
                        .computeIfAbsent(line.getBook().getPublisher(), k -> new ArrayList<>())
                        .add(new Requisition.RequisitionItem(line.getBook().getTitle(), shortQty));
            } else {
                // decrement stock only for in-stock lines
                line.getBook().setStock(line.getBook().getStock() - line.getQuantity());
            }
        }
        List<Requisition> requisitions = byPublisher.entrySet().stream()
                .map(e -> new Requisition(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        String status = anyShortfall ? "Awaiting Stock" : "Acknowledged";
        Order order = new Order("ORD-" + (orderCounter++), customer, lines, total, status, requisitions);
        orders.add(0, order);
        return order;
    }
}
