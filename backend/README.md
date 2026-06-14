# peerLance Backend API - Technical Documentation

This directory houses the backend server for peerLance, a student freelancing bidding portal. It is a RESTful API built on Node.js and Express, integrated with MongoDB for data persistence, Socket.io for real-time messaging, and Cloudinary for file attachments.

---

## Architecture

The server adheres to a modular Model-View-Controller (MVC) structure, split into distinct concerns:

```text
HTTP Request / WebSocket
   │
   ▼
[ server.js ] (App Entry & Socket Server)
   │
   ▼
[ routes/ ] (Express Routing layer)
   │
   ▼
[ middleware/ ] (Validation, Rate Limiting, JWT Checks)
   │
   ▼
[ models/ ] (Mongoose schemas / MongoDB collections)
```

1. **Routing Layer (`/routes`)**: Explicit router definitions maps HTTP verbs to controller endpoints, passing incoming queries to corresponding validation middlewares.
2. **Database Layer (`/models`)**: Defines structure, field types, validation rules, default states, and document relationships using Mongoose ODM.
3. **Middleware Layer (`/middleware`)**: Houses validation checks, authorization guards, request rate limiters, and error handling.
4. **Validation Layer (`/validation`)**: Utilizes Zod for strict validation of request bodies before processing.
5. **Utility Layer (`/utils`)**: Provides helpers for JWT token generation, email dispatches, and Cloudinary storage configuration.

---

## Technology Stack

The backend dependencies and their purposes are outlined in the table below:

| Dependency | Purpose | Choice Rationale |
| :--- | :--- | :--- |
| **Express (v5)** | API Router Framework | Standard routing capabilities, middleware support, and async handler error handling. |
| **Mongoose** | Object Document Mapper | Handles schema enforcement, populated queries, and transaction management. |
| **Zod** | Input Validation | Type-safe runtime schemas ensuring strict checks on parameters, queries, and bodies. |
| **JSON Web Token** | Authentication Sessions | Signed authorization payload enabling stateless credentials verification. |
| **bcryptjs** | Password Hashing | One-way cryptographic hashing of user passwords before writing to the database. |
| **Socket.io** | WebSockets Protocol | Enables event-driven bi-directional updates for notifications and chat rooms. |
| **Multer** | Multipart File Parser | Form-data parser for processing files to prepare them for storage. |
| **Cloudinary** | File Media CDN | Remote CDN host that securely stores project reference files and attachments. |
| **Cookie Parser** | Cookie Header Parser | Parses client Cookie headers to read signed and unsigned credentials. |
| **Express Rate Limit** | Request Rate Limiter | Basic protection against brute-force login submissions and denial-of-service. |
| **Nodemailer** | SMTP Email Dispatcher | Dispatches welcome and notification emails to registered student accounts. |

---

## Database Design

The schema design utilizes MongoDB collections structured with Mongoose ODM:

### User Collection (`userModel`)
* **Purpose**: Stores account authentication details, biography, tech skills list, and role designation.
* **Fields**:
  * `firstName` (String, Required)
  * `lastName` (String, Optional)
  * `email` (String, Unique, Index, Required)
  * `password` (String, Required, Hashed)
  * `role` (String, enum: `["CLIENT", "FREELANCER"]`, Required)
  * `bio` (String, Default: `""`)
  * `skills` (Array of Strings, Default: `[]`)
  * `avatarUrl` (String, Optional)

### Project Collection (`projectModel`)
* **Purpose**: Manages job opportunity listings posted by clients.
* **Fields**:
  * `client` (ObjectId referencing User, Required)
  * `title` (String, Required)
  * `description` (String, Required)
  * `category` (String, Required)
  * `skillsRequired` (Array of Strings, Required)
  * `budgetMin` (Number, Required)
  * `budgetMax` (Number, Required)
  * `deadline` (Date, Required)
  * `status` (String, enum: `["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"]`, Default: `"OPEN"`)
  * `attachments` (Array of Strings containing Cloudinary URLs)
  * `acceptedBid` (ObjectId referencing Bid, Optional)
  * `reviewSubmitted` (Boolean, Default: `false`)

### Bid Collection (`bidModel`)
* **Purpose**: Tracks freelancer proposals submitted for client projects.
* **Fields**:
  * `project` (ObjectId referencing Project, Required)
  * `freelancer` (ObjectId referencing User, Required)
  * `proposedPrice` (Number, Required)
  * `deliveryDays` (Number, Required)
  * `coverNote` (String, Required)
  * `status` (String, enum: `["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"]`, Default: `"PENDING"`)

### Message Collection (`messageModel`)
* **Purpose**: Persists real-time communication history.
* **Fields**:
  * `project` (ObjectId referencing Project, Required)
  * `sender` (ObjectId referencing User, Required)
  * `receiver` (ObjectId referencing User, Required)
  * `text` (String, Required)
  * `isRead` (Boolean, Default: `false`)

### Review Collection (`reviewModel`)
* **Purpose**: Tracks client feedback evaluations for freelancers.
* **Fields**:
  * `project` (ObjectId referencing Project, Required)
  * `reviewer` (ObjectId referencing User, Required)
  * `reviewee` (ObjectId referencing User, Required)
  * `rating` (Number, Min: 1, Max: 5, Required)
  * `comment` (String, Required)

---

## Authentication Flow

Authentication is built around stateless JSON Web Tokens stored in signed HTTP cookies.

```text
[Register] ──> Hash Password ──> Create User Record ──> Send Email
[Login]    ──> Verify password ──> Generate JWT ──> Set HttpOnly Cookie
[Request]  ──> verifyToken Middleware ──> Read Cookie ──> Populate req.user
[Logout]   ──> Clear Cookie
```

1. **HttpOnly Cookie Protection**: The JWT token cookie cannot be accessed by client-side scripts, protecting the session against Cross-Site Scripting (XSS) attacks.
2. **Protected Routes Middleware**: The `verifyToken` middleware extracts, decodes, and verifies the JWT cookie before granting access to API controllers.
3. **Role Validation Guard**: Access is restricted using role authorization checks. For instance, creating a project requires the `CLIENT` role, while submitting bids requires the `FREELANCER` role.

---

## API Documentation

### Authentication Routes

#### `POST /api/auth/register`
* **Purpose**: Create a new account.
* **Auth Required**: No.
* **Request Body**:
  ```json
  {
    "firstName": "Test",
    "lastName": "User",
    "email": "test@user.com",
    "password": "password123",
    "role": "FREELANCER"
  }
  ```
* **Response (201)**:
  ```json
  { "success": true, "message": "Registration successful" }
  ```

#### `POST /api/auth/login`
* **Purpose**: Authenticate user and issue HttpOnly token cookie.
* **Auth Required**: No.
* **Request Body**:
  ```json
  { "email": "test@user.com", "password": "password123" }
  ```
* **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "payload": { "_id": "...", "firstName": "Test", "role": "FREELANCER" }
  }
  ```

#### `POST /api/auth/logout`
* **Purpose**: Clear the token cookie.
* **Auth Required**: Yes.
* **Response (200)**:
  ```json
  { "success": true, "message": "Logout successful" }
  ```

#### `GET /api/auth/me`
* **Purpose**: Retrieve details of the current logged-in user.
* **Auth Required**: Yes.
* **Response (200)**:
  ```json
  { "success": true, "payload": { "_id": "...", "firstName": "Test", "email": "..." } }
  ```

---

### Project Routes

#### `POST /api/project`
* **Purpose**: Post a new project.
* **Auth Required**: Yes (`CLIENT` only).
* **Request Type**: `multipart/form-data`.
* **Request Body Fields**: `title`, `description`, `category`, `skillsRequired` (array or comma-separated), `budgetMin`, `budgetMax`, `deadline`, `attachments` (files).
* **Response (201)**:
  ```json
  { "success": true, "payload": { "_id": "...", "title": "..." } }
  ```

#### `GET /api/project`
* **Purpose**: Fetch open projects using pagination, keyword search, and filters.
* **Auth Required**: No.
* **Query Parameters**: `page`, `limit`, `search`, `category`, `budgetMin`, `budgetMax`, `status`.
* **Response (200)**:
  ```json
  {
    "success": true,
    "payload": {
      "projects": [...],
      "totalPages": 5,
      "currentPage": 1
    }
  }
  ```

#### `GET /api/project/my-projects`
* **Purpose**: Fetch projects created by the logged-in client.
* **Auth Required**: Yes (`CLIENT` only).
* **Response (200)**:
  ```json
  { "success": true, "payload": [...] }
  ```

#### `GET /api/project/:id`
* **Purpose**: Get detailed project information by ID.
* **Auth Required**: No.
* **Response (200)**:
  ```json
  { "success": true, "payload": { "_id": "...", "title": "..." } }
  ```

#### `PUT /api/project/:id/complete`
* **Purpose**: Mark a project status as completed.
* **Auth Required**: Yes (`CLIENT` owner only).
* **Response (200)**:
  ```json
  { "success": true, "message": "Project completed successfully" }
  ```

---

### Bid Routes

#### `POST /api/bid`
* **Purpose**: Submit a bid proposal for an open project.
* **Auth Required**: Yes (`FREELANCER` only).
* **Request Body**:
  ```json
  {
    "projectId": "...",
    "proposedPrice": 5000,
    "deliveryDays": 5,
    "coverNote": "I am a skilled React developer..."
  }
  ```
* **Response (201)**:
  ```json
  { "success": true, "payload": { "_id": "...", "proposedPrice": 5000 } }
  ```

#### `GET /api/bid/my-bids`
* **Purpose**: Fetch bids submitted by the logged-in freelancer.
* **Auth Required**: Yes (`FREELANCER` only).
* **Response (200)**:
  ```json
  { "success": true, "payload": [...] }
  ```

#### `GET /api/bid/project/:projectId`
* **Purpose**: Fetch all submitted bids for a specific project.
* **Auth Required**: Yes (Client owner or freelancer participant).
* **Response (200)**:
  ```json
  { "success": true, "payload": [...] }
  ```

#### `PUT /api/bid/:id/accept`
* **Purpose**: Accept a bid proposal. Sets project status to `IN_PROGRESS` and rejects other pending bids.
* **Auth Required**: Yes (`CLIENT` owner only).
* **Response (200)**:
  ```json
  { "success": true, "message": "Bid accepted" }
  ```

#### `PUT /api/bid/:id/reject`
* **Purpose**: Reject a bid proposal.
* **Auth Required**: Yes (`CLIENT` owner only).
* **Response (200)**:
  ```json
  { "success": true, "message": "Bid rejected" }
  ```

#### `PUT /api/bid/:id/withdraw`
* **Purpose**: Withdraw a submitted bid proposal.
* **Auth Required**: Yes (`FREELANCER` owner only).
* **Response (200)**:
  ```json
  { "success": true, "message": "Bid withdrawn" }
  ```

---

### Chat Routes

#### `GET /api/chat/:projectId`
* **Purpose**: Load the message history for a project.
* **Auth Required**: Yes (Project participant only).
* **Response (200)**:
  ```json
  { "success": true, "payload": [...] }
  ```

#### `POST /api/chat`
* **Purpose**: Send a message in a project chat room.
* **Auth Required**: Yes (Project participant only).
* **Request Body**:
  ```json
  { "projectId": "...", "receiverId": "...", "text": "Hello, let's connect!" }
  ```
* **Response (201)**:
  ```json
  { "success": true, "payload": { "_id": "...", "text": "Hello..." } }
  ```

#### `PUT /api/chat/:projectId/read`
* **Purpose**: Mark messages in a chat room as read.
* **Auth Required**: Yes (Project participant only).
* **Response (200)**:
  ```json
  { "success": true, "message": "Messages marked as read" }
  ```

---

### Saved Project Routes

#### `POST /api/saved/:projectId`
* **Purpose**: Toggle save status on a project opportunity.
* **Auth Required**: Yes (`FREELANCER` only).
* **Response (200)**:
  ```json
  { "success": true, "saved": true, "message": "Project saved successfully" }
  ```

#### `GET /api/saved`
* **Purpose**: Fetch bookmarked projects.
* **Auth Required**: Yes (`FREELANCER` only).
* **Response (200)**:
  ```json
  { "success": true, "payload": [...] }
  ```

---

### Review Routes

#### `POST /api/review`
* **Purpose**: Submit a rating evaluation and comment for the project's freelancer.
* **Auth Required**: Yes (`CLIENT` only, once project is `COMPLETED`).
* **Request Body**:
  ```json
  { "projectId": "...", "rating": 5, "comment": "Great experience, timely delivery." }
  ```
* **Response (201)**:
  ```json
  { "success": true, "message": "Review submitted successfully" }
  ```

#### `GET /api/review/freelancer/:freelancerId`
* **Purpose**: Fetch all reviews received by a freelancer.
* **Auth Required**: No.
* **Response (200)**:
  ```json
  {
    "success": true,
    "payload": {
      "reviews": [...],
      "averageRating": 4.8,
      "totalReviews": 10
    }
  }
  ```

---

## Real-Time Communication

The backend uses Socket.io to establish real-time connections, routing users and project communications into logical rooms:

1. **User Channel Room (`user-${userId}`)**:
   * Users join this room on application load.
   * Receives target push alerts for status changes (e.g. `new-bid`, `bid-accepted`, `bid-rejected`, `project-completed`).
2. **Project Channel Room (`project-${projectId}`)**:
   * Participants (the client and accepted freelancer) join this room upon entering a project chat.
   * Manages messaging and typing indicators:
     * `send-message` / `receive-message`
     * `user-typing` / `stop-typing`

---

## Middleware

* **`verifyToken()`**: Extracts, decodes, and verifies JWT tokens from cookies to populate `req.user`.
* **`validate(schema)`**: Uses Zod validation schemas to validate incoming request bodies before they reach controllers.
* **`loginLimiter` / `registerLimiter`**: Express-rate-limit middleware configured to restrict auth submission frequencies.
* **Global Error Handler**: Catches system thrown errors (such as cast errors or validation errors) to return standardized JSON responses.

---

## File Upload Workflow

1. **Multer Setup**: Intercepts multipart form submissions and validates attachments.
2. **Cloudinary Upload**: Files are parsed, buffered, and uploaded directly to Cloudinary storage buckets.
3. **Database Registry**: The secure HTTPS URLs returned by Cloudinary are saved in the `attachments` array of the project document.

---

## Security Considerations

* **Password Hashing**: Passwords undergo one-way cryptographic hashing via `bcryptjs` with 12 salt rounds.
* **Cookie Defenses**: Session cookies are configured with:
  * `httpOnly: true` to prevent XSS credential theft.
  * `secure: true` (in production) to enforce HTTPS transmission.
  * `sameSite: "lax" / "none"` to prevent Cross-Site Request Forgery (CSRF).
* **Zod validation schemas**: Protects controllers against malicious payloads or SQL/NoSQL injection structures.
* **MongoDB Query Isolation**: All database operations verify document ownership. For instance, only the client who posted a project can accept bids on it.

---

## Development Commands

* **`npm install`**: Installs backend package dependencies.
* **`npm start`**: Launches the Express server in production mode using `node server.js`.
* **`npm run dev`**: Starts the development server with automatic file reload enabled using Node's native watch flag (`node --watch server.js`).

---

## Folder Structure

```text
backend/
├── config/
│   └── db.js               # MongoDB database connection configuration
├── middleware/
│   ├── rateLimiter.js      # Rate limit configurations for auth routes
│   └── verifyToken.js      # Authorization token validation middleware
├── models/
│   └── mainModels.js       # Schemas for User, Project, Bid, Message, and Review
├── routes/
│   ├── authAPI.js          # Authentication endpoint logic
│   ├── projectAPI.js       # Project CRUD operations
│   ├── bidAPI.js           # Proposal submission and lifecycle operations
│   ├── chatAPI.js          # Project-scoped messaging logic
│   ├── notificationAPI.js  # Notifications retrieval and read markers
│   ├── profileAPI.js       # User profile details updates
│   ├── reviewAPI.js        # Freelancer evaluation submissions
│   └── savedAPI.js         # Bookmarks management
├── utils/
│   ├── cloudinary.js       # Cloudinary client connection setup
│   ├── sendEmail.js        # Nodemailer dispatch configuration
│   └── upload.js           # Multer multipart storage settings
├── validation/
│   └── authValidation.js   # Zod validation rules
├── server.js               # Server entry file (initializes Socket.io)
└── package.json
```
