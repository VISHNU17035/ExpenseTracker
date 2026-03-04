Build a modern mobile-friendly web application called Daily Expense Logger that helps users quickly record daily expenses and analyze spending patterns over time. The experience should feel similar to apps like HealthifyMe where users log entries throughout the day, but here users log financial transactions. The UI should be clean, minimal, intuitive, and optimized primarily for mobile while still working on desktop.

Use the following stack: React for frontend, Tailwind CSS for styling, Chart.js for visualizations, and Firebase for backend services including Firebase Authentication, Firestore database, and Firebase Storage for image uploads.

The application should contain two main screens: Expense Logging and Statistics, with navigation using a bottom navigation bar containing two tabs labeled Log Expenses and Statistics.

Users must authenticate before using the app. Implement Firebase Authentication with Google Sign-In and Email/Password login. Each user's data must remain private and transactions must be associated with the authenticated user's Firebase UID.

The Expense Logging screen should display the current date automatically at the top in a format such as “Today — March 4, 2026.” Users should not need to enter the date manually when logging expenses. Below the date show a list of all expenses recorded for that day. Each expense should appear in a card layout showing merchant/description, amount in Indian Rupees, and category, for example: Swiggy — ₹350 — Food. Each card should also include Edit and Delete buttons.

At the bottom of the list show Total Today: ₹X, which updates automatically as transactions change.

Provide a floating “+ Add Expense” button. When pressed, show two options: Upload Screenshot or Add Manually.

Manual entry should open a form with fields for Amount, Merchant/Description, Category (Food, Transport, Shopping, Bills, Entertainment, Transfers, Other), and optional Notes. When saving, automatically assign today's date and store the transaction in Firestore.

For Upload Screenshot, allow users to upload an image of a payment confirmation or receipt. Store the image in Firebase Storage. After upload, show a confirmation form where the user can manually enter or verify Amount, Merchant, Category, and Notes. Save the transaction in Firestore along with the image URL. The architecture should allow OCR parsing to be added later, but it is not required for the initial version.

The Statistics screen should show spending analytics using Chart.js with four tabs: Daily, Weekly, Monthly, Yearly. The Daily tab should show total spending for the day, a category breakdown chart, and the transaction list. The Weekly tab should show total weekly spending and a bar chart of spending per day. The Monthly tab should show total spending for the month, a category pie chart, and a line chart of daily spending. The Yearly tab should show total yearly spending and a bar chart of spending per month.

If there is not enough data for charts, display a message such as “Not enough data yet. Start logging expenses to see insights.”

Use Firestore with a transactions collection containing: userId, amount, merchant, category, notes, date, source (manual or screenshot), imageUrl (optional), and createdAt.

The UI should follow modern mobile-first design principles with rounded cards, clear typography, simple navigation, and responsive layout. The final output should be a working React application with Firebase authentication, Firestore integration, expense logging, screenshot uploads, and a statistics dashboard with charts.