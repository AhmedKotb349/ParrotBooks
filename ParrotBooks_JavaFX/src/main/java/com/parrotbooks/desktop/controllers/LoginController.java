package com.parrotbooks.desktop.controllers;

import com.parrotbooks.desktop.MainApp;
import com.parrotbooks.desktop.model.User;
import com.parrotbooks.desktop.store.Session;
import com.parrotbooks.desktop.store.Store;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;

import java.io.IOException;
import java.util.Optional;

public class LoginController {

    @FXML private TextField usernameField;
    @FXML private PasswordField passwordField;
    @FXML private Label errorLabel;

    @FXML
    private void handleLogin() {
        String username = usernameField.getText().trim();
        String password = passwordField.getText();

        Optional<User> user = Store.get().login(username, password);
        if (user.isEmpty()) {
            showError("Incorrect username or password.");
            return;
        }

        Session.setCurrentUser(user.get());
        try {
            MainApp.showDashboard();
        } catch (IOException e) {
            showError("Could not load the dashboard: " + e.getMessage());
        }
    }

    private void showError(String message) {
        errorLabel.setText(message);
        errorLabel.setVisible(true);
        errorLabel.setManaged(true);
    }

    @FXML private void fillAdmin() { fill("admin"); }
    @FXML private void fillSales() { fill("sales"); }
    @FXML private void fillWarehouse() { fill("warehouse"); }
    @FXML private void fillAccounts() { fill("accounts"); }

    private void fill(String username) {
        usernameField.setText(username);
        passwordField.setText("password123");
    }
}
