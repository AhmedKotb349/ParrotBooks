package com.parrotbooks.desktop;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;

import java.io.IOException;

/**
 * Parrot Books Sales System — JavaFX desktop app.
 * Self-contained: all data lives in Store (in-memory), no server required.
 */
public class MainApp extends Application {

    private static Stage primaryStage;

    @Override
    public void start(Stage stage) throws IOException {
        primaryStage = stage;
        stage.setTitle("Parrot Books — Sales System");
        stage.getIcons().add(new Image(MainApp.class.getResourceAsStream("/images/logo.png")));
        showLogin();
        stage.show();
    }

    public static void showLogin() throws IOException {
        setRoot("/fxml/Login.fxml", 420, 560);
    }

    public static void showDashboard() throws IOException {
        setRoot("/fxml/Dashboard.fxml", 1100, 720);
    }

    private static void setRoot(String fxmlPath, double width, double height) throws IOException {
        FXMLLoader loader = new FXMLLoader(MainApp.class.getResource(fxmlPath));
        Parent root = loader.load();
        Scene scene = new Scene(root, width, height);
        scene.getStylesheets().add(MainApp.class.getResource("/css/app.css").toExternalForm());
        primaryStage.setScene(scene);
    }

    public static void main(String[] args) {
        launch(args);
    }
}
