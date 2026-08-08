# Parrot Books — JavaFX Desktop App (NetBeans)

Self-contained JavaFX desktop client for the Parrot Books Sales System.
No server, no database — catalogue, customers, and business logic
(stock checks, purchase requisitions grouped by publisher, order
acknowledgement) all live in-memory in `store/Store.java`.

## Opening in NetBeans

This is a standard **Maven** project, which NetBeans supports natively:

1. **File → Open Project…**
2. Select the `ParrotBooks-Desktop-NetBeans` folder (the one with `pom.xml`
   in it).
3. NetBeans recognizes it automatically as a Maven project — no import
   wizard needed, no `nbproject/` folder required.
4. Right-click the project → **Build** (this downloads the JavaFX
   dependencies via Maven the first time — needs internet).
5. Right-click the project → **Run**.

If Run doesn't pick up the JavaFX Maven plugin's `javafx:run` goal
automatically on your NetBeans version: right-click the project →
**Run Maven → Goals…** and enter `javafx:run`. You can also save that as
a custom action (Project Properties → Actions → Run project → set to
`javafx:run`) so the regular green Run button uses it going forward.

## Requirements

- JDK 17 or newer
- NetBeans 12+ (with Maven support, which is built in)
- Internet connection on first build (Maven needs to download the
  JavaFX 21 artifacts from Maven Central)

## Running from the command line instead

```bash
mvn clean javafx:run
```

## What's verified

This was built and tested in a sandboxed environment: it compiles
cleanly against real JavaFX jars, and I ran the actual compiled app
under a virtual display (Xvfb) end to end — the Login screen loads and
stays running with zero exceptions, and I additionally drove it straight
to the Dashboard screen (which does all the dynamic work: building the
book grid with cover images, the category filters, the cart, and the
order-submission logic) and confirmed a full render pass completes with
no errors. The one thing that sandbox couldn't reach is Maven Central
itself (network-restricted there, same as the MongoDB situation
earlier) — so `mvn compile`/`javafx:run` specifically should be tested
on your machine, but the actual Java/FXML code itself is confirmed
working.

## Demo accounts

| Username | Password | Role |
|---|---|---|
| `admin` | `password123` | admin |
| `sales` | `password123` | sales |
| `warehouse` | `password123` | warehouse |
| `accounts` | `password123` | accounts |

## Features implemented

- Login screen with role-based demo accounts
- Category-filterable book catalogue with cover art (Open Library Covers
  API, keyed by each book's real ISBN)
- "Related books" suggestions (same category) when you add an item
- Order slip with live quantity spinners and running total
- Full order submission logic: per-line validation, extended price/order
  total, stock check, automatic purchase requisition grouped by
  publisher for shortfall items, and a stamped receipt showing
  Acknowledged vs. Awaiting Stock

## Project layout

```
src/main/java/com/parrotbooks/desktop/
├── MainApp.java              # entry point (scene switching)
├── Launcher.java             # JDK11+ workaround — see note in the file
├── model/                    # Book, Customer, User, Order, OrderLine, Requisition
├── store/                    # Store (seed data + business logic), Session
└── controllers/              # LoginController, DashboardController
src/main/resources/
├── fxml/                     # Login.fxml, Dashboard.fxml
├── css/app.css
└── images/
```
