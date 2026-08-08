package com.parrotbooks.desktop;

/**
 * Separate launcher class. On JDK 11+, running a class that directly
 * extends javafx.application.Application as the main class can trigger
 * "JavaFX runtime components are missing" even when the JavaFX jars are
 * present, if they're on the classpath rather than the module path. Using
 * a plain class (this one) as the actual entry point avoids that check.
 */
public class Launcher {
    public static void main(String[] args) {
        MainApp.main(args);
    }
}
