# peerLance Frontend - Technical Documentation

This directory contains the frontend client application for peerLance, a student freelancing bid portal. Built as a Single Page Application (SPA), the client integrates with the Express API server and implements a Spotify-inspired dark layout.

---

## Application Architecture

The application is structured as a decoupled client interacting with the backend API via HTTP REST queries and WebSocket connections.

```text
               [ App.jsx ] (Router & Global Layout)
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
  [ pages/ ]                [ components/ ]
  (View Routes)             (Reusable UI Elements)
       │                         │
       └────────────┬────────────┘
                    ▼
               [ store/ ] (Zustand Stores)
                    │
                    ▼
               [ api/ ] (Axios instance)
```

1. **State Store Layer (`/src/store`)**: Global state is managed using Zustand stores. Components select specific variables or actions, decoupling components from direct API mutations.
2. **API Communication Layer (`/src/api`)**: Directs HTTP requests using an Axios instance configured with credential headers for session management, along with response interceptors for global error handling.
3. **Routing Configuration (`/src/App.jsx`)**: Declares application paths, applies authentication wrappers (`ProtectedRoute` and `RoleBasedRoute`), and configures the toast notification overlay.
4. **Reusable UI System (`/src/components`)**: A local library of UI components (buttons, input fields, modals, loaders) to maintain design consistency across views.

---

## Technology Stack

The client uses the following dependencies:

| Dependency | Purpose | Choice Rationale |
| :--- | :--- | :--- |
| **React (v19)** | UI Rendering Engine | Fast component lifecycle rendering and hooks. |
| **Vite (v8)** | Frontend Bundler | Instant development server startup and fast build bundling. |
| **Tailwind CSS (v4)** | CSS Engine | Modern utility classes and CSS variables configuration. |
| **Zustand** | Global State | Minimalist state management that avoids the boilerplate of Redux. |
| **Axios** | HTTP Client | Simple requests/responses, request configurations, and interceptor support. |
| **React Router (v7)** | Client-Side Routing | Declarative path registry supporting layout wrapping and guards. |
| **Socket.io Client** | WebSockets Client | Connects to the backend server to receive notifications and messages. |
| **React Hot Toast** | Alert Notifications | Elegant toast overlays for success, warning, and error states. |
| **Lucide React** | Icons Library | Modern, customizable SVG icons matching the Spotify aesthetic. |
| **Date-fns** | Date Formatting | Utility functions to format timestamps and deadlines. |

---

## UI Design System

The visual design is inspired by the clean, high-contrast dark layout of Spotify:

### Color Palette (defined in `src/index.css`)
* **Primary Green**: `#1DB954`
* **Hover Green**: `#1ED760`
* **Background**: `#121212` (deep charcoal-black base)
* **Card Background**: `#181818` (elevated container elements)
* **Secondary Background**: `#212121`
* **Border Color**: `#2A2A2A`
* **Primary Text**: `#FFFFFF`
* **Secondary Text**: `#B3B3B3`

### Responsive Breakpoints
* **Mobile (default)**: Single column layouts, collapsible mobile drawer menu.
* **Tablet (`md`: 768px)**: Multi-column grids, sidebar expansions, and side-by-side forms.
* **Desktop (`lg`: 1024px)**: Full workspace layouts, three-column panels, and wide cards.

---

## State Management

Zustand stores manage the global state across pages:

### `authStore`
* **State**: `currentUser`, `loading`, `isAuthenticated`, `isCheckingAuth`, `error`.
* **Actions**: `register()`, `login()`, `logout()`, `checkAuth()`, `updateProfile()`.
* **Responsibility**: Manages registration, authentication, session validation, and profile updates.

### `projectStore`
* **State**: `projects`, `myProjects`, `currentProject`, `loading`, `totalPages`, `currentPage`.
* **Actions**: `fetchProjects()`, `fetchProjectById()`, `fetchMyProjects()`, `createProject()`, `completeProject()`.
* **Responsibility**: Controls open project searches, detail listings, and client creations.

### `bidStore`
* **State**: `myBids`, `projectBids`, `loading`, `error`.
* **Actions**: `submitBid()`, `fetchMyBids()`, `fetchBidsByProject()`, `acceptBid()`, `rejectBid()`, `withdrawBid()`.
* **Responsibility**: Manages the bidding lifecycle, proposed list views, client reviews, and withdrawals.

### `chatStore`
* **State**: `messages`, `loading`.
* **Actions**: `fetchMessages()`, `sendMessage()`, `addMessage()`, `markAsRead()`, `reset()`.
* **Responsibility**: Manages project-scoped chat histories, real-time message additions, and read statuses.

### `savedStore`
* **State**: `savedProjects`, `savedIds`, `loading`.
* **Actions**: `fetchSavedProjects()`, `toggleSaveProject()`.
* **Responsibility**: Manages bookmarked project listings for freelancers.

### `notificationStore`
* **State**: `notifications`, `unreadCount`, `loading`.
* **Actions**: `fetchNotifications()`, `markAllAsRead()`, `addNotification()`.
* **Responsibility**: Controls real-time event updates and notification list management.

---

## Routing Structure

The application routes are defined in `src/App.jsx` as follows:

| Path | Element | Route Protection / Access |
| :--- | :--- | :--- |
| `/` | `Landing` | Public |
| `/login` | `Login` | Guest Only (Redirects home if authenticated) |
| `/register` | `Register` | Guest Only (Redirects home if authenticated) |
| `/projects` | `ProjectListing` | Public |
| `/project/:id` | `ProjectDetail` | Public |
| `/profile` | `Profile` | Protected (Any Authenticated User) |
| `/chat` | `Chat` | Protected (Any Authenticated User) |
| `/project/post` | `PostProject` | Role-Based Protection (`CLIENT` only) |
| `/client/dashboard` | `ClientDashboard` | Role-Based Protection (`CLIENT` only) |
| `/client/projects` | `ClientDashboard` | Role-Based Protection (`CLIENT` only) |
| `/freelancer/dashboard` | `FreelancerDashboard`| Role-Based Protection (`FREELANCER` only) |
| `/freelancer/bids` | `MyBids` | Role-Based Protection (`FREELANCER` only) |
| `/freelancer/saved` | `SavedProjects` | Role-Based Protection (`FREELANCER` only) |

---

## Page Documentation

* **Landing Page (`Landing.jsx`)**: The home view containing statistics counters, testimonials, and a search field to look up open projects.
* **Login / Register (`Login.jsx` / `Register.jsx`)**: Auth forms. The registration form includes cards to select user roles (`FREELANCER` vs `CLIENT`).
* **Client Dashboard (`ClientDashboard.jsx`)**: A management panel for clients to track open listings, active jobs, and review submitted bids.
* **Freelancer Dashboard (`FreelancerDashboard.jsx`)**: A management workspace for freelancers to track bid stats, active projects, and saved listings.
* **Browse Projects (`ProjectListing.jsx`)**: The main list view containing filters for categories, budgets, and text queries.
* **Project Details (`ProjectDetail.jsx`)**: Displays project descriptions, budgets, and deadlines.
  * *For Freelancers*: Submits proposals using a custom modal.
  * *For Clients*: Displays all submitted bids, allowing the client to accept/reject bids, mark the project as completed, and submit a review.
* **Create Project (`PostProject.jsx`)**: A form for clients to publish projects. It supports file attachments via drag-and-drop.
* **My Bids (`MyBids.jsx`)**: A panel for freelancers to track proposal reviews and withdraw pending bids.
* **Saved Projects (`SavedProjects.jsx`)**: A catalog view showing bookmarked projects for quick access.
* **Chat Page (`Chat.jsx`)**: A messaging workspace with a list of active project chat rooms on the left and a messaging window on the right.
* **Profile Page (`Profile.jsx`)**: Shows biographical details, skills, and client reviews. Includes an edit mode to update user info.

---

## API Integration

* **Axios Instance (`src/api/axiosInstance.js`)**:
  * Points to backend endpoints at `http://localhost:6868/api`.
  * Configured with `withCredentials: true` to send session cookie headers with every request.
* **Interceptors**:
  * Handles standard error logging.
  * Blocks global toasts for specific background checks (e.g. `/auth/me`).

---

## Real-Time Features

WebSockets are integrated via Socket.io to support real-time interactions:

1. **Auto Room Connections**:
   * Joining the app connects the user to their user-specific room to receive alerts for actions like new bids or bid acceptance.
   * Selecting a chat room connects the user to the project-specific chat room to receive live messages.
2. **Active Typing Status**:
   * Emits `user-typing` and `stop-typing` events as the user interacts with the input field. Toggles a loader indicator on the partner's screen.
3. **Read Checkmarks**:
   * Marks incoming messages as read, sending a checkmark status indicator back to the sender.

---

## Reusable Component Library

* **`Button`**: Supports `primary`, `secondary`, `outline`, `danger`, and `text` styles.
* **`Input`**: Text/password input field with toggle visibility and validation error indicators.
* **`Select`**: Dynamic custom dropdown menu.
* **`Textarea`**: Responsive multiline text field.
* **`Modal`**: Backdrop-overlay window. Handles escape key presses and body scroll locking.
* **`Loader`**: SVG spinner supporting absolute centering.
* **`Pagination`**: Centered navigation controls to step through pages.
* **`EmptyState`**: Displays standard cards with call-to-action prompts when lists are empty.
* **`StarRating`**: Customizable star rating system.

---

## Development Commands

* **`npm install`**: Installs frontend package dependencies.
* **`npm run dev`**: Starts the Vite local development server on `http://localhost:5173`.
* **`npm run build`**: Packages and outputs optimized HTML/JS/CSS assets to the `/dist` folder.
* **`npm run preview`**: Launches a local web server to preview the built distribution folder.

---

## Folder Structure

```text
frontend/
├── public/                 # Static public assets
├── src/
│   ├── api/
│   │   └── axiosInstance.js # Configured Axios instance with response handlers
│   ├── assets/             # Brand logos and illustration assets
│   ├── components/         # Reusable styling components and page layout layouts
│   │   ├── BidCard.jsx
│   │   ├── Button.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Input.jsx
│   │   ├── Loader.jsx
│   │   ├── Modal.jsx
│   │   ├── Navbar.jsx
│   │   ├── NotificationDropdown.jsx
│   │   ├── Pagination.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── ReviewCard.jsx
│   │   ├── RoleBasedRoute.jsx
│   │   ├── Select.jsx
│   │   ├── StarRating.jsx
│   │   └── Textarea.jsx
│   ├── pages/              # Routing pages and layouts
│   │   ├── Chat.jsx
│   │   ├── ClientDashboard.jsx
│   │   ├── FreelancerDashboard.jsx
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── MyBids.jsx
│   │   ├── NotFound.jsx
│   │   ├── PostProject.jsx
│   │   ├── Profile.jsx
│   │   ├── ProjectDetail.jsx
│   │   ├── ProjectListing.jsx
│   │   ├── Register.jsx
│   │   ├── SavedProjects.jsx
│   │   └── Unauthorized.jsx
│   ├── store/              # Zustand global state configurations
│   │   ├── authStore.js
│   │   ├── bidStore.js
│   │   ├── chatStore.js
│   │   ├── notificationStore.js
│   │   ├── projectStore.js
│   │   └── savedStore.js
│   ├── App.css             # Component level override resets
│   ├── App.jsx             # Route registration mappings
│   ├── index.css           # Tailwind CSS directives
│   └── main.jsx            # DOM creation entry
├── eslint.config.js        # ESLint code checks config
├── index.html              # HTML core shell template
├── vite.config.js          # Vite plugins configuration
└── package.json
```
