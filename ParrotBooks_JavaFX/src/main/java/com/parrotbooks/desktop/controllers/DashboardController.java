package com.parrotbooks.desktop.controllers;

import com.parrotbooks.desktop.MainApp;
import com.parrotbooks.desktop.model.*;
import com.parrotbooks.desktop.store.Session;
import com.parrotbooks.desktop.store.Store;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class DashboardController {

    @FXML private Label whoLabel;
    @FXML private FlowPane categoryPane;
    @FXML private FlowPane bookGrid;
    @FXML private VBox orderPanel;

    private final Store store = Store.get();
    private final Map<Book, Integer> cart = new LinkedHashMap<>();
    private String activeCategory = "All";

    // order panel pieces, built programmatically
    private ComboBox<Customer> customerCombo;
    private FlowPane relatedPane;
    private Label relatedTitle;
    private VBox cartLinesBox;
    private Label totalLabel;
    private VBox resultArea;

    @FXML
    public void initialize() {
        User user = Session.getCurrentUser();
        whoLabel.setText(user.getFullName() + "  ·  " + user.getRole());

        buildCategoryChips();
        renderBookGrid();
        buildOrderPanel();
    }

    // ---------------- Categories ----------------

    private void buildCategoryChips() {
        categoryPane.getChildren().clear();
        for (String cat : store.getCategories()) {
            ToggleButton btn = new ToggleButton(cat);
            btn.getStyleClass().add("category-chip");
            if (cat.equals(activeCategory)) btn.getStyleClass().add("active");
            btn.setOnAction(e -> {
                activeCategory = cat;
                buildCategoryChips();
                renderBookGrid();
            });
            categoryPane.getChildren().add(btn);
        }
    }

    // ---------------- Catalog grid ----------------

    private void renderBookGrid() {
        bookGrid.getChildren().clear();
        List<Book> books = store.getBooks();
        for (Book book : books) {
            if (!activeCategory.equals("All") && !book.getCategory().equals(activeCategory)) continue;
            bookGrid.getChildren().add(buildBookCard(book));
        }
    }

    private VBox buildBookCard(Book book) {
        ImageView cover = new ImageView();
        cover.setFitWidth(140);
        cover.setFitHeight(190);
        cover.setPreserveRatio(false);
        try {
            cover.setImage(new Image(book.getImageUrl(), true)); // background-load
        } catch (Exception ignored) { /* leave blank if the image fails to load */ }

        Label title = new Label(book.getTitle());
        title.setWrapText(true);
        title.setFont(Font.font("System", FontWeight.BOLD, 12));
        title.setMaxWidth(140);

        Label author = new Label(book.getAuthor());
        author.getStyleClass().add("muted-text");

        Label price = new Label(String.format("EGP %.2f", book.getPrice()));
        price.getStyleClass().add("price-text");

        Label stockBadge = new Label(stockLabel(book.getStock()));
        stockBadge.getStyleClass().add(stockStyle(book.getStock()));

        Button addBtn = new Button("+ Add to order");
        addBtn.getStyleClass().add("add-button");
        addBtn.setMaxWidth(Double.MAX_VALUE);
        addBtn.setOnAction(e -> addToCart(book));

        VBox card = new VBox(4, cover, title, author, price, stockBadge, addBtn);
        card.getStyleClass().add("book-card");
        card.setPrefWidth(148);
        return card;
    }

    private String stockLabel(int stock) {
        if (stock == 0) return "Out of stock";
        if (stock < 10) return stock + " left";
        return "In stock";
    }

    private String stockStyle(int stock) {
        if (stock == 0) return "stock-out";
        if (stock < 10) return "stock-low";
        return "stock-ok";
    }

    // ---------------- Order panel ----------------

    private void buildOrderPanel() {
        orderPanel.getChildren().clear();

        Label heading = new Label("Order Details");
        heading.getStyleClass().add("panel-heading");

        Label customerLabel = new Label("Customer");
        customerLabel.getStyleClass().add("field-label");
        customerCombo = new ComboBox<>();
        customerCombo.getItems().addAll(store.getCustomers());
        if (!customerCombo.getItems().isEmpty()) customerCombo.getSelectionModel().selectFirst();
        customerCombo.setMaxWidth(Double.MAX_VALUE);

        relatedTitle = new Label();
        relatedTitle.getStyleClass().add("related-title");
        relatedTitle.setVisible(false);
        relatedTitle.setManaged(false);
        relatedPane = new FlowPane(6, 6);

        cartLinesBox = new VBox(6);
        totalLabel = new Label("Order Total: EGP 0.00");
        totalLabel.getStyleClass().add("total-label");

        Button submitBtn = new Button("Submit Order");
        submitBtn.getStyleClass().add("primary-button");
        submitBtn.setMaxWidth(Double.MAX_VALUE);
        submitBtn.setOnAction(e -> submitOrder());

        resultArea = new VBox(8);

        orderPanel.getChildren().addAll(
                heading, customerLabel, customerCombo,
                relatedTitle, relatedPane,
                new Separator(),
                cartLinesBox, totalLabel, submitBtn,
                resultArea
        );
        renderCartLines();
    }

    private void addToCart(Book book) {
        cart.merge(book, 1, Integer::sum);
        renderCartLines();
        showRelated(book);
    }

    private void showRelated(Book book) {
        List<Book> related = store.getRelated(book);
        relatedPane.getChildren().clear();
        if (related.isEmpty()) {
            relatedTitle.setVisible(false);
            relatedTitle.setManaged(false);
            return;
        }
        relatedTitle.setText("Related to \"" + book.getTitle() + "\"");
        relatedTitle.setVisible(true);
        relatedTitle.setManaged(true);
        for (Book b : related) {
            Button chip = new Button(b.getTitle());
            chip.getStyleClass().add("related-chip");
            chip.setWrapText(true);
            chip.setMaxWidth(140);
            chip.setOnAction(e -> addToCart(b));
            relatedPane.getChildren().add(chip);
        }
    }

    private void renderCartLines() {
        cartLinesBox.getChildren().clear();
        double total = 0;
        for (Map.Entry<Book, Integer> entry : cart.entrySet()) {
            Book book = entry.getKey();
            int qty = entry.getValue();
            total += book.getPrice() * qty;

            Label name = new Label(book.getTitle());
            name.setWrapText(true);
            name.setMaxWidth(150);
            name.getStyleClass().add("cart-line-name");

            Spinner<Integer> qtySpinner = new Spinner<>(1, 999, qty);
            qtySpinner.setPrefWidth(70);
            qtySpinner.valueProperty().addListener((obs, oldV, newV) -> {
                cart.put(book, newV);
                renderCartLines();
            });

            Button remove = new Button("✕");
            remove.getStyleClass().add("remove-button");
            remove.setOnAction(e -> {
                cart.remove(book);
                renderCartLines();
            });

            HBox row = new HBox(8, name, qtySpinner, remove);
            row.setAlignment(Pos.CENTER_LEFT);
            cartLinesBox.getChildren().add(row);
        }
        if (cart.isEmpty()) {
            Label empty = new Label("No items yet — add books from the catalogue.");
            empty.getStyleClass().add("muted-text");
            cartLinesBox.getChildren().add(empty);
        }
        totalLabel.setText(String.format("Order Total: EGP %.2f", total));
    }

    private void submitOrder() {
        resultArea.getChildren().clear();
        if (cart.isEmpty()) {
            resultArea.getChildren().add(errorBanner("Add at least one book to the order first."));
            return;
        }
        Customer customer = customerCombo.getValue();
        if (customer == null) {
            resultArea.getChildren().add(errorBanner("Select a customer first."));
            return;
        }

        Order order = store.submitOrder(customer, new LinkedHashMap<>(cart));
        cart.clear();
        renderCartLines();
        relatedPane.getChildren().clear();
        relatedTitle.setVisible(false);
        relatedTitle.setManaged(false);

        resultArea.getChildren().add(buildReceipt(order));
    }

    private VBox errorBanner(String message) {
        Label label = new Label(message);
        label.getStyleClass().add("error-banner");
        label.setWrapText(true);
        VBox box = new VBox(label);
        return box;
    }

    private VBox buildReceipt(Order order) {
        boolean acknowledged = "Acknowledged".equals(order.getStatus());

        Label stamp = new Label(order.getStatus());
        stamp.getStyleClass().add(acknowledged ? "stamp-ok" : "stamp-warn");

        Label header = new Label(order.getId() + " — " + order.getCustomer().getName());
        header.getStyleClass().add("receipt-header");

        VBox lines = new VBox(3);
        for (OrderLine line : order.getLines()) {
            Label l = new Label(String.format("%s × %d — %s",
                    line.getBook().getTitle(), line.getQuantity(),
                    line.isInStock() ? "In stock" : "Shortfall"));
            l.getStyleClass().add(line.isInStock() ? "receipt-line-ok" : "receipt-line-short");
            lines.getChildren().add(l);
        }

        Label total = new Label(String.format("Order Total: EGP %.2f", order.getTotal()));
        total.getStyleClass().add("total-label");

        VBox box = new VBox(6, stamp, header, lines, total);
        box.getStyleClass().add(acknowledged ? "receipt-ok" : "receipt-warn");
        box.setPadding(new Insets(12));

        if (!order.getRequisitions().isEmpty()) {
            for (Requisition req : order.getRequisitions()) {
                VBox reqBox = new VBox(2);
                Label reqHeader = new Label("Requisition — " + req.getPublisher());
                reqHeader.getStyleClass().add("requisition-header");
                reqBox.getChildren().add(reqHeader);
                for (Requisition.RequisitionItem item : req.getItems()) {
                    reqBox.getChildren().add(new Label(item.title + ": " + item.quantity + " units"));
                }
                reqBox.getStyleClass().add("requisition-block");
                box.getChildren().add(reqBox);
            }
        }

        Label note = new Label(acknowledged
                ? "Acknowledgement generated and sent to customer, warehouse, and credit control."
                : "Acknowledgement withheld until requisitioned stock arrives.");
        note.setWrapText(true);
        note.getStyleClass().add("muted-text");
        box.getChildren().add(note);

        return box;
    }

    @FXML
    private void handleLogout() {
        Session.clear();
        cart.clear();
        try {
            MainApp.showLogin();
        } catch (IOException ignored) {
        }
    }
}
