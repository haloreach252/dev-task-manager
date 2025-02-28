# Dev Task Manager

## Overview

The **Dev Task Manager** is a powerful and easy-to-use project management tool designed for developers and general project management. Unlike other tools that require multiple apps to manage different aspects of a project, this tool consolidates various project management functionalities into a single app. It is built to accommodate **solo users, teams, and enterprises** alike.

### Key Highlights:

-   All-in-one project management tool: **Kanban boards, whiteboards, and more** in a single app.
-   Designed for **developers**, but flexible enough for general use.
-   **Team management system** with role-based permissions.
-   **Authentication** via email/password, GitHub, and Discord (more OAuth providers planned).
-   **Future integrations planned** for GitHub, Google Docs, and Discord.
-   Built using **Next.js, React, TailwindCSS, ShadCN, and Supabase**.

🚧 **This project is currently in heavy development.** A live demo is not yet available.

---

## Features

For a detailed breakdown of the planned features, see the **[Feature Documentation](./notes/feature_doc.md)**.

### 🔐 **Authentication & Access Control**

-   **Supabase Auth** handles secure authentication.
-   **Multiple sign-in options:** Email/password, GitHub, and Discord.
-   **Team-based roles & permissions:**
    -   **Admin**: Full control over projects and team settings.
    -   **Editor**: Edit boards but no admin privileges.
    -   **Viewer**: Read-only access.
-   **Board visibility settings:** Public, Team, or Private.

### 📌 **Project & Board Management**

-   **Multiple boards per project** for better organization.
-   **Kanban-style task management** with drag-and-drop functionality.
-   **Custom workflows** for different types of projects.
-   **Board customization**: Custom backgrounds, colors, and column limits.
-   **Board snapshots**: Restore previous board states.
-   **Column task limits**: Prevent workflow overload.

### ✅ **Task Management**

-   **Task properties:** Priorities, labels, due dates, dependencies.
-   **File attachments** for design docs, screenshots, etc.
-   **Rich text descriptions** for detailed task explanations.
-   **Checklists** for subtask tracking.
-   **Task statuses**: Customizable workflow instead of a rigid "To Do / In Progress / Done" setup.
-   **Task assignment**: Assign tasks to multiple team members.

### 📡 **Collaboration & Real-time Features**

-   **Live presence indicators** to see who is online.
-   **Real-time comments** on tasks.
-   **Task history & change logs** for tracking edits.

### 🔗 **Planned Integrations** (Future Roadmap)

-   **GitHub**: Sync issues with tasks.
-   **Google Docs**: Attach and collaborate on documents.
-   **Discord Webhooks**: Send automatic updates to team channels.

### 📊 **Views & Layouts**

-   **Kanban View** – Primary task organization.
-   **Calendar View** – Track due dates.
-   **Overview Table** – Quick task overview.

---

## Installation & Setup

### 📥 Prerequisites

-   **Node.js** v22 or higher.
-   A **Supabase** project.

### 🛠 Setup Instructions

1. Clone the repository:
    ```sh
    git clone https://github.com/haloreach252/dev-task-manager.git
    cd dev-task-manager
    ```
2. Install dependencies:
    ```sh
    npm install --legacy-peer-deps
    ```
3. Set up environment variables:
    - Rename `.env.example` to `.env` and fill in the necessary values.
    - Required environment variables:
        ```env
        DATABASE_URL=your_supabase_db_url
        DIRECT_URL=your_supabase_direct_url
        NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
        NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Change for production
        SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
        ```
4. Run the development server:
    ```sh
    npm run dev
    ```

---

## Usage

-   The UI is designed to be **compact and intuitive**.
-   More detailed UI/UX documentation is available in the **[Design Documentation](./notes/design_doc.md)**.
-   No keyboard shortcuts, tips, or best practices at the moment.

---

## Contribution Guidelines

🚫 **Public contributions are not currently accepted.**

-   The project may be open-sourced in the future.
-   Security concerns prevent full code transparency at this time.

---

## License & Credits

-   **All rights reserved** – Miniverse Studios.
-   No external credits at this time.

---

## Future Roadmap

🚀 Planned features include:

-   **Task templates** for common workflows.
-   **Subtasks & dependencies** for better task structuring.
-   **Recurring tasks** to automate workflows.
-   **Whiteboard brainstorming tool**.
-   **Task automation (Zapier or built-in triggers)**.

Stay tuned for more updates! 🚀
