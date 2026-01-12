# ANTIGRAVITY: MV Footage Dispatcher

## 1. Project Overview
- **Name**: `mv-footage-dispatcher`
- **Purpose**: A local web application to organize and rename massive amounts of video footage via drag-and-drop.
- **Goal**: Enable the user to sort video clips from Eagle/Finder into "virtual folders" in the browser and export them as a structured ZIP file with auto-renaming.
- **Target Audience**: Video Creators, MV Editors.

## 2. Core Features (MVP)
1.  **Virtual Folder System**: Create namable folders (e.g., "A_Melo", "Chorus").
2.  **Drag & Drop Import**: Drop files from OS directly into these virtual folders.
3.  **Auto-Sorting & Renaming**:
    - Files within a folder are automatically numbered (e.g., `A_Melo_001.mp4`).
    - Drag & drop reordering updates the sequence number.
4.  **Export**: ZIP download containing the folders and renamed files.

## 3. Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React State.
- **Libraries**:
    - `dnd-kit`: Drag and Drop.
    - `jszip`: ZIP creation.
    - `file-saver`: File download.
    - `lucide-react`: Icons.

## 4. Current Step
- [x] Initialize Project
- [x] Create `ANTIGRAVITY.md`
- [x] Install Dependencies (dnd-kit, jszip, etc.)
- [x] Implement Main UI (Canvas & Folders)
- [x] Implement Drag Logic
- [x] Implement Export (Direct Save to Desktop)
- [x] MVP Achieved

## 5. Rules
- **English Code, Japanese UI**: Variable names in English, UI text in Japanese.
- **Simple & Fast**: Prioritize responsiveness and speed.
