# Project Blueprint: Medical Equipment Lending Library (MELL)

This document provides a comprehensive, actionable blueprint for developing the MELL web application. It is designed to be used by a solo developer or an AI coding agent for incremental, sprint-based development.

## Phase 1: High-Level Architectural Decisions

### 1.1. Architecture Pattern Selection

**Decision:** Modular Monolith

**Rationale:** The project is a straightforward CRUD application with a small, well-defined scope for the MVP. A monolithic architecture is the most efficient choice for a solo developer, as it simplifies development, testing, and deployment by keeping the frontend and backend in a single codebase. The "modular" approach will be enforced through a domain-driven folder structure to ensure code is organized, maintainable, and easy to reason about, which will facilitate future expansion.

### 1.2. Technology Stack Selection

Based on research and current best practices, the following technologies will be used. All versions are locked as per system requirements to ensure stability and compatibility.

**Frontend Framework:**
- **Name:** Next.js
- **Version:** 15.4.6 (App Router)

**UI Components:**
- **Name:** shadcn/ui
- **Version:** 2.10.x (latest available via `npx shadcn-ui@latest init`)

**Backend Runtime:**
- **Name:** Python
- **Version:** 3.12.x

**Backend Framework:**
- **Name:** FastAPI
- **Version:** 0.116.1
- **Supporting Libraries:** Pydantic 2.x, passlib[bcrypt] 5.x, python-jose 3.x

**Primary Database:**
- **Name:** MongoDB Atlas
- **Rationale:** The application's data models (Users, Equipment, Requests) are document-centric and will benefit from the schema flexibility of MongoDB. This flexibility is ideal for an agile development process where requirements may evolve. MongoDB Atlas provides a generous free tier that is perfect for development and initial deployment.

### 1.3. Core Infrastructure & Services (Local Development Focus)

- **Local Development:** The project will be run via simple terminal commands. No containerization (Docker, Kubernetes) is required.
  - **Frontend:** `npm run dev`
  - **Backend:** `uvicorn app.main:app --reload`

- **File Storage:** The `EquipmentItem` entity includes an `image_url`. For local development, a simple local file storage system will be used.
  - **Implementation:** A git-ignored directory named `/uploads` will be created at the root of the backend project. The backend will serve these static files.

- **Job Queues:** Not required for the MVP as all communication is synchronous and notifications are deferred.

- **Authentication:** A library-based JWT (JSON Web Tokens) approach will be used.
  - **Implementation:** The backend will generate a JWT upon successful login. This token will be stored on the client and sent in the `Authorization` header for all protected API requests. `passlib` will be used for hashing passwords, and `python-jose` for creating and verifying JWTs.

- **External Services:** None are required for the MVP, as per the PRD.

### 1.4. Integration and API Strategy

- **API Style:** REST
- **Versioning:** All API routes will be versioned under `/api/v1/`. This ensures that future breaking changes can be introduced without affecting the existing frontend.
- **Standard JSON Response Formats:**
  - **Success (2xx Status Code):**
    ```json
    {
      "success": true,
      "data": { ... }
    }
    ```  - **Error (4xx/5xx Status Code):**
    ```json
    {
      "success": false,
      "error": {
        "code": "ERROR_CODE",
        "message": "A descriptive error message."
      }
    }
    ```

## Phase 2: Detailed Module Architecture

The application will be structured as a modular monolith with distinct domains.

### 2.1. Module Identification

- **AuthModule (Backend):** Responsible for user registration, login, and JWT management.
- **UserModule (Backend):** Manages user data and profiles.
- **InventoryModule (Backend):** Manages the `EquipmentItem` catalog.
- **BorrowingModule (Backend):** Manages the `BorrowRequest` workflow and associated business logic.
- **SharedModule (Frontend):** Contains shared UI components (e.g., Layout, Header), utility functions, custom hooks (e.g., `useAuth`), and global type definitions.

### 2.2. Module Responsibilities and Contracts

| Module           | Responsibilities                                                              | Key API Endpoints (Contract)                                                                                                                                                           | Controlled Collections |
| ---------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **AuthModule**   | Register new users, authenticate existing users, generate/validate JWTs.      | `POST /api/v1/auth/register`<br>`POST /api/v1/auth/login`                                                                                                                               | `users` (writes)       |
| **UserModule**   | Manage user profile data, handle role assignments.                            | `GET /api/v1/users/me`<br>`PUT /api/v1/users/me`<br>`GET /api/v1/users` (Admin)<br>`PUT /api/v1/users/{id}` (Admin)                                                                       | `users`                |
| **InventoryModule**| CRUD operations for medical equipment. Public browsing and searching.         | `POST /api/v1/inventory` (Admin)<br>`GET /api/v1/inventory`<br>`GET /api/v1/inventory/{id}`<br>`PUT /api/v1/inventory/{id}` (Admin)<br>`DELETE /api/v1/inventory/{id}` (Admin)         | `equipmentItems`       |
| **BorrowingModule**| Create and manage borrow requests, update statuses, enforce business rules. | `POST /api/v1/borrow-requests` (Borrower)<br>`GET /api/v1/borrow-requests/my-requests` (Borrower)<br>`GET /api/v1/borrow-requests` (Admin)<br`PUT /api/v1/borrow-requests/{id}/status` (Admin/Borrower) | `borrowRequests`       |

### 2.3. Key Module Design

#### Backend Folder Structure (FastAPI)

A domain-driven structure will be used within an `app` directory.

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py             # FastAPI app instantiation, middleware, main router
│   ├── core/               # Core logic: config, security (JWTs)
│   │   ├── config.py
│   │   └── security.py
│   ├── db/                 # Database connection and setup
│   │   └── database.py
│   ├── models/             # Pydantic models for request/response bodies
│   │   ├── user_models.py
│   │   ├── inventory_models.py
│   │   └── borrowing_models.py
│   ├── schemas/            # Pydantic models mapping to DB collections
│   │   ├── user_schema.py
│   │   ├── inventory_schema.py
│   │   └── borrowing_schema.py
│   ├── services/           # Business logic (Repository Pattern)
│   │   ├── user_service.py
│   │   ├── inventory_service.py
│   │   └── borrowing_service.py
│   └── api/
│       └── v1/
│           ├── __init__.py
│           ├── routers/      # API endpoint definitions
│           │   ├── auth.py
│           │   ├── users.py
│           │   ├── inventory.py
│           │   └── borrowing.py
│           └── dependencies.py # Reusable dependencies (e.g., get_current_user)
├── .env
├── .env.example
└── requirements.txt
```

#### Frontend Folder Structure (Next.js App Router)

```
frontend/
├── app/
│   ├── (auth)/             # Route group for auth pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/        # Route group for protected pages
│   │   ├── admin/
│   │   │   ├── inventory/page.tsx
│   │   │   └── page.tsx      # Admin dashboard
│   │   ├── dashboard/page.tsx  # Borrower dashboard
│   │   └── layout.tsx        # Protected layout
│   ├── equipment/
│   │   ├── [id]/page.tsx   # Equipment detail page
│   │   └── page.tsx        # Public catalog page
│   ├── globals.css
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── shared/             # General reusable components (Header, Footer)
│   └── ui/                 # shadcn/ui components (auto-generated)
├── contexts/               # React Context for global state (e.g., AuthContext)
│   └── AuthContext.tsx
├── hooks/                  # Custom hooks (e.g., useAuth)
├── lib/                    # Utility functions, API client
│   ├── api.ts
│   └── utils.ts
└── types/                  # TypeScript type definitions
    └── index.ts
```

## Phase 3: Tactical Sprint-by-Sprint Plan

### Sprint S0: Project Foundation & Setup

- **Sprint ID & Name:** S0: Project Foundation & Setup
- **Project Context:** This project is to build a web application called 'Medical Equipment Lending Library (MELL)', a platform for community members to borrow and manage medical equipment.
- **Goal:** To establish a fully configured, runnable project skeleton on the local machine, enabling rapid feature development in subsequent sprints.
- **Tasks:**
  1.  **Developer Onboarding:** Ask the developer for the URL of their new, empty GitHub repository for this project.
  2.  **Project Scaffolding:**
      - Create a root directory `MELL`.
      - Inside `MELL`, create `frontend` and `backend` directories.
      - Initialize a Git repository in the root, add a comprehensive `.gitignore` file (for `node_modules`, `.env`, `__pycache__`, etc.), and push the initial structure to the `main` branch.
      - Create a `develop` branch from `main`. All future work will be based on `develop`.
  3.  **Backend Setup (Python/FastAPI):**
      - In the `backend` directory, create a Python virtual environment (e.g., `python3 -m venv venv`).
      - Install dependencies: `pip install "fastapi==0.116.1" "uvicorn[standard]" pydantic python-dotenv pymongo`.
      - Create a `requirements.txt` file: `pip freeze > requirements.txt`.
      - Create the basic file structure as defined in Phase 2, starting with `app/main.py`.
  4.  **Frontend Setup (Next.js & shadcn/ui):**
      - In the `frontend` directory, run `npx create-next-app@15.4.6 .` to scaffold a new Next.js project with TypeScript and Tailwind CSS.
      - Run `npx shadcn-ui@latest init` to initialize shadcn/ui.
  5.  **Database Setup (MongoDB Atlas):**
      - Instruct the developer to create a free-tier M0 cluster on MongoDB Atlas.
      - Ask the developer to retrieve their MongoDB Atlas connection string (SRV address).
  6.  **Configuration:**
      - Create `.env.example` files in both `frontend` and `backend` directories.
      - Backend `.env.example`: `DATABASE_URL="your_mongodb_connection_string"`
      - Frontend `.env.example`: `NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"`
      - Create `.env` files (added to `.gitignore`) in both directories and populate them with the actual values.
  7.  **"Hello World" Verification:**
      - **Backend:** Create a `/api/v1/health` endpoint in `app/main.py` that returns `{"status": "ok"}`. Implement the initial database connection logic in `app/db/database.py` and ensure the app connects on startup without errors.
      - **Frontend:** On the main `page.tsx`, use `fetch` to call the backend's `/api/v1/health` endpoint and display the status on the page. Configure `next.config.mjs` for proxying or ensure CORS is enabled on the FastAPI backend for local development.
- **Verification Criteria:** The developer can clone the repository, run `npm install` and `npm run dev` in `/frontend`, run `pip install -r requirements.txt` and `uvicorn app.main:app --reload` in `/backend`, and see a "Status: ok" message on the web page. The backend terminal shows a successful connection to MongoDB Atlas. The initial code is pushed to the `develop` branch on GitHub.

### Sprint S1: User Authentication & Roles

- **Sprint ID & Name:** S1: User Authentication & Roles
- **Project Context:** This sprint builds the foundational user authentication system for the MELL application, which is critical for all personalized features and role-based access control.
- **Previous Sprint's Accomplishments:** S0 established a local development environment. The Next.js frontend and FastAPI backend are running, can communicate, and are connected to MongoDB Atlas. The codebase is tracked in a GitHub repository.
- **Goal:** To implement a complete, secure user registration and login system using JWTs, with distinct roles for 'Borrower' and 'Admin'.
- **Relevant Requirements & User Stories:** FR-001
- **Tasks:**
  1.  **Database (Backend):**
      - In `backend/app/schemas/user_schema.py`, define the `User` schema for the MongoDB collection. Include `name`, `email` (indexed, unique), `hashed_password`, `role` ('Borrower' or 'Admin'), `createdAt`, `updatedAt`.
  2.  **Backend (AuthModule & UserModule):**
      - Install dependencies: `pip install "passlib[bcrypt]" python-jose`. Update `requirements.txt`.
      - Create `core/security.py` to handle password hashing/verification and JWT creation/decoding.
      - In `api/v1/routers/auth.py`, implement the endpoints: `POST /api/v1/auth/register` (creates a user with default 'Borrower' role) and `POST /api/v1/auth/login` (returns a JWT).
      - In `api/v1/dependencies.py`, create a reusable dependency (`get_current_user`) that verifies the JWT from the `Authorization` header and returns the user data.
      - In `api/v1/routers/users.py`, create a protected endpoint `GET /api/v1/users/me` that uses `get_current_user` to return the current logged-in user's profile.
  3.  **Frontend (Next.js):**
      - Create `(auth)/login/page.tsx` and `(auth)/register/page.tsx` using shadcn/ui components (Card, Input, Button, Label).
      - Implement client-side forms with validation (e.g., using `react-hook-form` and `zod`).
      - Create `contexts/AuthContext.tsx` to manage user state (user object, token, loading status) globally.
      - Wrap the root layout in `AuthContext.Provider`.
      - In `lib/api.ts`, create functions to call the `/register` and `/login` backend endpoints.
      - Implement logic to store the JWT in a secure client-side location (e.g., httpOnly cookie or local storage) and attach it to subsequent API requests.
      - Create a basic `(dashboard)/dashboard/page.tsx` for Borrowers and a `(dashboard)/admin/page.tsx` for Admins. Implement a client-side check in the protected layout that redirects unauthenticated users to `/login`.
  4.  **Version Control:** Commit all changes and push the `develop` branch to GitHub.
- **Verification Criteria:** A user can register for an account. They can log in and receive a JWT. They are redirected to their dashboard, where they can see their email. Attempting to access a dashboard page while logged out redirects to the login page. User data is correctly stored in the MongoDB `users` collection with a hashed password.

### Sprint S2: Core Inventory Management (Admin)

- **Sprint ID & Name:** S2: Core Inventory Management (Admin)
- **Project Context:** This sprint focuses on empowering Administrators to manage the core asset of the library: the medical equipment.
- **Previous Sprint's Accomplishments:** S1 delivered a complete user authentication system. Users can register and log in, and the application can distinguish between roles.
- **Goal:** To build the full CRUD (Create, Read, Update, Delete) functionality for `EquipmentItem` entities, accessible only to users with the 'Admin' role.
- **Relevant Requirements & User Stories:** FR-002
- **Tasks:**
  1.  **Database (Backend):**
      - In `backend/app/schemas/inventory_schema.py`, define the `EquipmentItem` schema for MongoDB. Include `name`, `description`, `category`, `condition`, `image_url` (optional), and `status` ('Available', 'Unavailable').
  2.  **Backend (InventoryModule):**
      - In `api/v1/dependencies.py`, create a new dependency `get_current_admin_user` that reuses `get_current_user` and then verifies the user's role is 'Admin'.
      - In `api/v1/routers/inventory.py`, create the following protected endpoints, all using the `get_current_admin_user` dependency:
        - `POST /api/v1/inventory`
        - `PUT /api/v1/inventory/{item_id}`
        - `DELETE /api/v1/inventory/{item_id}`
      - Create a public endpoint for viewing items: `GET /api/v1/inventory/{item_id}`.
      - Implement the business logic in `services/inventory_service.py` using the Repository Pattern to interact with the database.
  3.  **Frontend (Next.js):**
      - Create the admin inventory management page: `(dashboard)/admin/inventory/page.tsx`. This page should be accessible only to logged-in Admins.
      - Use shadcn/ui's `Table` component to display the list of equipment items.
      - Implement a "Create New Item" button that opens a `Dialog` or navigates to a new page with a form for adding equipment.
      - Add "Edit" and "Delete" buttons to each row in the table. The "Delete" button should use an `AlertDialog` for confirmation.
      - The forms for creating and editing should map to the `EquipmentItem` model.
      - Update `lib/api.ts` with functions to call all the new inventory endpoints.
  4.  **Version Control:** Commit all changes and push the `develop` branch to GitHub.
- **Verification Criteria:** A logged-in Admin can navigate to `/admin/inventory`. They can create, view, edit, and delete equipment items. A logged-in Borrower trying to access this page is denied access. Changes are reflected in the MongoDB `equipmentItems` collection.

### Sprint S3: Public Catalog & Borrow Request Initiation

- **Sprint ID & Name:** S3: Public Catalog & Borrow Request Initiation
- **Project Context:** This sprint opens up the application to the public and allows logged-in borrowers to take the first step in the borrowing workflow.
- **Previous Sprint's Accomplishments:** S2 delivered a fully functional inventory management system for administrators.
- **Goal:** To create a publicly viewable catalog of equipment and allow logged-in Borrowers to submit a borrow request for an available item.
- **Relevant Requirements & User Stories:** FR-003, FR-004 (Create part)
- **Tasks:**
  1.  **Database (Backend):**
      - In `backend/app/schemas/borrowing_schema.py`, define the `BorrowRequest` schema. Include `user_id`, `item_id`, `request_details` (text), `status` ('Pending', 'Approved', 'Denied', 'Checked Out', 'Returned', 'Cancelled'), and timestamps.
  2.  **Backend (InventoryModule & BorrowingModule):**
      - In `api/v1/routers/inventory.py`, create the main public endpoint: `GET /api/v1/inventory`. This endpoint should support searching (by name) and filtering (by category, status) via query parameters.
      - In `api/v1/routers/borrowing.py`, create the request endpoint: `POST /api/v1/borrow-requests`. This must be protected by the `get_current_user` dependency.
      - In `services/borrowing_service.py`, implement the logic for creating a request. It must verify that the requested `EquipmentItem` has a status of 'Available'. The new request's status should default to 'Pending'.
  3.  **Frontend (Next.js):**
      - Create the public catalog page at `equipment/page.tsx`. Fetch and display equipment using a grid of `Card` components.
      - Add a search input (`Input`) and category filter (`Select`) to the catalog page. Implement logic to refetch data when these controls are used.
      - Create the equipment detail page at `equipment/[id]/page.tsx`. This page will fetch and display all details for a single item.
      - On the detail page, display a "Request to Borrow" button. This button should be disabled if the item's status is not 'Available'. If the user is not logged in, the button should redirect them to the `/login` page.
      - Clicking the button should open a `Dialog` with a form where the user can enter their `request_details`. Submitting this form calls the `POST /api/v1/borrow-requests` endpoint.
  4.  **Version Control:** Commit all changes and push the `develop` branch to GitHub.
- **Verification Criteria:** Any visitor can go to `/equipment` and see the list of items. They can search and filter the catalog. A logged-in Borrower can view an "Available" item, click "Request to Borrow", fill out the form, and submit it. A new `BorrowRequest` with "Pending" status appears in the database.

### Sprint S4: Request Management Dashboards

- **Sprint ID & Name:** S4: Request Management Dashboards
- **Project Context:** This sprint closes the loop on the core borrowing lifecycle, providing both Admins and Borrowers with the tools to manage and track requests.
- **Previous Sprint's Accomplishments:** S3 delivered the public-facing catalog and the ability for Borrowers to initiate a request.
- **Goal:** To create dashboards for Admins to manage incoming requests and for Borrowers to view the status of their own requests.
- **Relevant Requirements & User Stories:** FR-004 (View, Edit, List parts)
- **Tasks:**
  1.  **Backend (BorrowingModule):**
      - In `api/v1/routers/borrowing.py`, create the management endpoints:
        - `GET /api/v1/borrow-requests`: Returns all requests, with filters for status. Protected for Admins only.
        - `GET /api/v1/borrow-requests/my-requests`: Returns all requests for the currently logged-in user. Protected for any logged-in user.
        - `PUT /api/v1/borrow-requests/{request_id}`: An endpoint for an Admin to change the status of a request (e.g., to 'Approved' or 'Denied'). Also allows a Borrower to change the status of their own request to 'Cancelled' only if its current status is 'Pending'.
  2.  In `services/borrowing_service.py`, add the business logic for the status update. When an Admin approves a request, the service must also update the corresponding `EquipmentItem`'s status to 'Unavailable'. When an Admin sets a request to 'Returned', the service should set the item's status back to 'Available'.
  3.  **Frontend (Next.js):**
      - **Admin Dashboard:** Enhance the `(dashboard)/admin/page.tsx`. By default, it should fetch and display a table of all requests with "Pending" status. Add tabs or filters to view requests with other statuses.
      - For each pending request, provide "Approve" and "Deny" buttons. Clicking these will call the status update endpoint. For other statuses, show buttons for the next logical action (e.g., "Check Out", "Check In/Return").
      - **Borrower Dashboard:** Enhance the `(dashboard)/dashboard/page.tsx`. It should fetch data from the `/my-requests` endpoint and display a list of the user's requests and their current statuses (Pending, Approved, etc.).
      - For any request that is still "Pending", show a "Cancel Request" button.
  4.  **Version Control:** Commit all changes and push the `develop` branch to GitHub.
- **Verification Criteria:** An Admin can log in, view a list of pending requests, and approve or deny them. Approving a request makes the associated equipment item "Unavailable" in the public catalog. A Borrower can log in, see the status of their request change, and can cancel a pending request. The entire workflow described in the PRD (Section 3.1) can now be completed.