# IMPLEMENTATION.md - Todo List Application

This document outlines the implementation details, design decisions, and setup instructions for the Todo List Application.

## 1. Chosen Tech Stack

*   **Frontend:** React.js
*   **Backend:** Node.js
*   **Middleware/Framework:** Express.js
*   **ODM (Object Data Modeling):** Mongoose
*   **Database:** MongoDB
*   **Styling:** Tailwind CSS

## 2. How to Run the Application

### Prerequisites
*   Node.js (latest stable version recommended)
*   npm (or yarn)
*   MongoDB instance running locally

### Setup and Execution Steps
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/ShruthikRavula/Todo-List.git
    cd Todo-List
    ```
2.  **Start MongoDB:**
    Ensure your MongoDB instance is running, on `localhost:27017`. If not edit `MONGO_URI` variable in backend/.env with new url where your MongoDB Instance is running.

3.  **Setup and Run Frontend:**
    *   Open a new terminal.
    *   Navigate to the frontend directory:
        ```bash
        cd frontend
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Start the frontend development server:
        ```bash
        npm start
        ```

4.  **Setup and Run Backend:**
    *   Open another new terminal.
    *   Navigate to the backend directory:
        ```bash
        cd backend
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Start the backend server:
        ```bash
        npm start
        ```
        *(Note: Ensure your backend is configured to connect to your MongoDB instance, typically via environment variables like `MONGODB_URI` in a `.env` file within the `backend` directory.)*

5.  **Access the Application:**
    Open your web browser and navigate to `http://localhost:3000` (or the port your React application is running on).

## 3. Any Assumptions or Design Decisions

*   **Styling Choice:** Tailwind CSS was chosen for styling the application, allowing for rapid UI development with utility-first classes.
*   **Data Export Specificity:** When exporting todos to CSV or JSON format, only the following specific fields are included: Tags, Time (e.g., due date or creation date), Priority, and Status.
*   **Persistent Filters on Export:** The export functionality considers any active search queries and filters. Only the todos matching the current filtered view are exported.
*   **Todo Display Order on Dashboard:** Upon user sign-in, todos are displayed in two sections:
    1.  Todos created by the logged-in user appear first, sorted by their due time in descending order.
    2.  Todos where the logged-in user has been mentioned by others appear next, also sorted by date in descending order.
*   **User Mention Mechanism:**
    *   To mention other users in a todo, their usernames are entered as a comma-separated list.
    *   The system processes these usernames: valid, existing usernames result in the respective users being tagged; invalid or non-existent usernames are ignored for the current implementation.

## 4. Any Additional Features or Improvements Made

*   **User Authentication:**
    *   A full authentication system has been implemented, allowing users to sign up and sign in.
    *   Users can sign in using either their username or their email address.
*   **Batch Todo Completion:**
    *   Users can select multiple todos from their list and mark them as 'complete' in a single action, streamlining task management.
*   **Potential Enhancement for User Mentions (Future Consideration):**
    *   The current comma-separated input for user mentions could be enhanced by implementing a dropdown list of all registered users, possibly with a search/filter capability, to make selecting users for mentions more user-friendly and less error-prone.
