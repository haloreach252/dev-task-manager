# **Development Log & Task Manager**

## **Overview**

A **Trello-like project management tool** designed for **game developers and general project management**, providing **real-time collaboration**, **custom workflows**, and **task organization**. It features **teams, roles, customizable boards, integrations, and flexible layouts** to fit different project needs.

## **Key Features**

### **1. Authentication & Access Control**

-   **Supabase Auth** for secure user authentication.
-   **Teams with Customizable Roles & Permissions**:
    -   **Admin**: Full control over boards and team settings.
    -   **Editor**: Edit all boards but cannot modify team settings.
    -   **Viewer**: Read-only access.
-   **Board Visibility Settings**:
    -   **Public**: Anyone with the link can view, but not edit.
    -   **Team**: Only team members can view.
    -   **Private**: Only added members can view and edit.
-   **Magic Link & Email Invites** for quick team onboarding.

### **2. Project & Board Management**

-   **Multiple Boards per Project** for better task separation.
-   **Kanban-Style Task Management** with drag-and-drop organization.
-   **Customizable Workflows** (e.g., game dev-specific workflows).
-   **Real-time Updates** using Supabase Realtime.
-   **Board Customization**:
    -   Custom **backgrounds, colors, and gradients** for boards, cards, and tasks.
    -   Ability to **rearrange columns** freely.
-   **Board Snapshots**: Restore previous board states (up to a limit).
-   **Board Column Limits**: Set limits on the amount of tasks in a column to reduce overloading (e.g., max 3 tasks in "In Progress").

### **3. Task Features**

-   **Task Properties**:
    -   **Priorities, Labels, Due Dates, and Dependencies**.
    -   **File Attachments** for design docs, screenshots, etc.
    -   **Rich Text Support** for detailed descriptions.
    -   **Checklists** for checkable lists of items.
-   **Custom Task Statuses** instead of fixed “To Do, In Progress, Done”.
-   **Task Overview Table**: A centralized table to view all tasks, cards, and boards.
-   **Task Archiving**: Archive completed tasks to reduce clutter.
-   **Task Assignment**: Assign a task to one or multiple board members.

### **4. Collaboration & Realtime Features**

-   **Live Presence Indicators** (see who is online and editing a task).
-   **Real-time Comments & Updates** on tasks.
-   **Task History & Change Logs** for tracking edits and progress.

### **5. External Integrations**

-   **GitHub Integration**: Sync issues with tasks.
-   **Google Docs**: Attach and collaborate on design documents.
-   **Discord Webhooks**: Send automatic updates to team Discord channels.

### **6. Views & Layouts**

-   **Kanban View (Columns of Cards & Tasks)** – Primary task organization.
-   **Calendar View (Based on Due Dates)** – For tracking deadlines.
-   **Overview Table** – Quick access to all project tasks.

### **7. Monetization & Hosting**

-   **Free to Use Initially**, with premium features planned for the future.
-   **Managed Service** hosted by the developer.
-   **Future Self-Hosting Option** for teams that want to run their own instance.

### **8. Advanced Task & Project Management**

-   **Task Templates**: Predefined common task structures (e.g., "Bug Fix", "Level Design", "Character Animation") for quick creation.
-   **Subtasks**: Break tasks into smaller steps with progress tracking (similar to task dependencies).
-   **Recurring Tasks**: Automate repetitive tasks with scheduled recurrence.
-   **Linked Tasks**: An improvement on task dependency by showing relationships between tasks (e.g., "Blocked by", "Depends on").
-   **Task Automation** (Zapier or Built-in Triggers): Auto-assign tasks, move statuses, or send notifications based on rules.

### **9. Enhanced Collaboration & Communication**

-   **Threaded Comments**: Keep discussions organized under tasks.
-   **Task Mentions**: `@username` to notify specific team members in task comments.
-   **Whiteboard for Brainstorming**: A digital sketchpad for quick idea visualization.

## **Tech Stack & Packages**

### **Frontend**

-   Next.js (latest)
-   React
-   TailwindCSS
-   ShadCN (for UI components)

### **Backend & Database**

-   Supabase (Authentication, Database, Realtime Updates, Storage)
-   Prisma ORM (Database ORM)

### **Libraries**

-   `@dnd-kit` (for task organization)
-   `@supabase/realtime-js` (for live updates)
-   `@tanstack/react-query` (for efficient data fetching)
