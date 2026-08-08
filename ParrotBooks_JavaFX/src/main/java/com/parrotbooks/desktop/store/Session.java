package com.parrotbooks.desktop.store;

import com.parrotbooks.desktop.model.User;

/** Holds the currently signed-in user for the duration of the app session. */
public class Session {
    private static User currentUser;

    public static User getCurrentUser() { return currentUser; }
    public static void setCurrentUser(User user) { currentUser = user; }
    public static void clear() { currentUser = null; }
}
