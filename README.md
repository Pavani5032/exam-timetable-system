# Constraint-Based Examination Timetable and Conflict-Free Resource Allocation System

### SIMATS ENGINEERING
**Saveetha Institute of Medical and Technical Sciences, Chennai – 602105**  
**Department of Information Technology — B.Tech IT Capstone Project**

- **Students / Authors:**
  - **M. Thanuja** (Reg. No: 192425356) — *Requirements Analysis & Data Management*
  - **Dasari Sai Pavani** (Reg. No: 192520032) — *Scheduling Algorithm & Resource Allocation*
  - **P. Varshini** (Reg. No: 192472372) — *Application Integration & Timetable Management*
- **Project Supervisor / Guide:**
  - **Dr. Charlyn Pusha Latha**, Professor

---

## 1. System Overview

Preparing university examination timetables is a multi-dimensional constraint-satisfaction and combinatorial optimization problem. When hundreds of students enroll in varying core and elective courses, scheduling conflicts routinely arise:
- Concurrent examinations for shared students (Student clashes)
- Room capacity violations (Hall seating capacity < Candidate strength)
- Duplicate room booking (Multiple examinations scheduled in the same hall at the same time)
- Faculty invigilation clashes (Assigning faculty who are on approved leave or assigning one invigilator to multiple concurrent halls)
- Student examination fatigue (Multiple examinations scheduled for a single student on the same day)

This full-stack application provides an end-to-end, automated, constraint-based examination scheduling platform powered by the **DSATUR (Degree of Saturation) Graph-Colouring Algorithm** combined with a **Best-Fit Resource Allocation Engine**.

---

## 2. Technology Stack

- **Frontend:** React.js 18, Vite, Tailwind CSS, Lucide Icons, Axios, jsPDF & jsPDF-AutoTable
- **Backend:** Java 21, Spring Boot 3.2.5 (RESTful Microservices, Spring Data JPA, Spring Security with JWT, OpenPDF, Apache Commons CSV)
- **Database:** MySQL 8.0 (with H2 MySQL-compatibility mode for local standalone development)
- **Algorithms:**
  - Conflict Graph Construction $G = (V, E)$ based on shared student course registrations
  - DSATUR (Degree of Saturation) Graph Colouring for time slot assignment
  - Best-Fit Decreasing Room Allocation for capacity optimization
  - Faculty Invigilation & Leave Constraint Checking
  - Independent 5-Constraint Revalidation Engine
- **Deployment & Containerization:** Docker, Docker Compose, Multi-stage Dockerfiles, Nginx Alpine

---

## 3. Project Architecture & Modules

```
┌────────────────────────────────────────────────────────┐
│                   REACT FRONTEND                       │
│  - Admin Dashboard with Live Statistics & KPI Cards    │
│  - Module 1: Students, Courses, Exams, Rooms, Faculty   │
│  - Module 2: Automated Timetable Generator (DSATUR)    │
│  - Module 3: Interactive Calendar Grid & Manual Editor │
│  - Conflict Audit Reports & Resolution Advisories      │
│  - Publishing Controls & Official PDF / CSV Exports    │
└───────────────────────────▲────────────────────────────┘
                            │ REST APIs / JWT (Port 8080)
┌───────────────────────────▼────────────────────────────┐
│              SPRING BOOT BACKEND ENGINE                │
│  - Security & Authentication Service (JWT)             │
│  - Data Management CRUD Services                       │
│  - Algorithm Engine:                                   │
│      1. ConflictGraph.java (Vertices, Edges, Weights)  │
│      2. DsaturScheduler.java (Saturation Degree)       │
│      3. ScheduleValidator.java (5-Constraint Checker)  │
│      4. Alternative Suggestions Engine                 │
│  - Live Statistics & Audit Logging                     │
│  - Server-Side PDF & CSV Export Generators             │
└───────────────────────────▲────────────────────────────┘
                            │ JPA / JDBC
┌───────────────────────────▼────────────────────────────┐
│                    DATABASE LAYER                      │
│  - MySQL 8.0 (Docker Compose) / Embedded H2 Mode       │
│  - Relational Schema (14 Tables, Foreign Key Cascades) │
│  - Automated Demo Seeding & Instant Reset Capabilities │
└────────────────────────────────────────────────────────┘
```

### Module 1: Data Management & Configuration
- **Students & Registrations:** Complete student profiles with roll numbers, departments, semesters, and course enrollment maps.
- **Courses & Examinations:** Course codes (e.g. `CSA1016`, `IT201`, `CS101`), credits, exam durations (in minutes), and candidate counts.
- **Time Slots:** Chronologically ordered examination dates and sessions (Forenoon 09:00–12:00, Afternoon 13:30–16:30).
- **Rooms & Halls:** Examination halls, lecture rooms, and labs with verified seating capacities and active status toggles.
- **Faculty & Availability:** Teaching staff roster with daily invigilation limits and recorded leave dates/time slots.
- **Configurable Constraints:** Interactive toggles and value thresholds for:
  - `MAX_EXAMS_PER_STUDENT_PER_DAY` (Default: 1)
  - `ROOM_CAPACITY_STRICT` (Default: true)
  - `NO_FACULTY_OVERLAP` (Default: true)
  - `CHECK_FACULTY_AVAILABILITY` (Default: true)
  - `MIN_HOURS_BETWEEN_EXAMS` (Default: 2)
  - `ALLOW_WEEKEND_EXAMS` (Default: false)

### Module 2: Automated Timetable Generation
1. **Conflict Graph Construction:**
   - Vertices $V$: Examinations to be scheduled.
   - Edges $E$: An edge connects examinations $E_i$ and $E_j$ if $|S(E_i) \cap S(E_j)| > 0$ (they share one or more registered students). The edge weight equals the count of shared candidates.
2. **DSATUR Graph Colouring:**
   - Saturation degree $\rho(v)$ of vertex $v$ equals the number of distinct time slots (colours) already allocated to adjacent neighbours.
   - Vertices with the highest saturation degree are scheduled first. Ties are broken by highest initial unassigned vertex degree.
   - Selects the earliest feasible time slot that satisfies:
     - No conflicting neighbour has the same slot.
     - Student daily examination threshold is respected.
     - Duration fits within the time slot window.
3. **Best-Fit Room Allocation:**
   - Filters candidate rooms where $\text{capacity} \ge \text{studentCount}$.
   - Sorts candidate rooms in ascending capacity order to minimize wasted seating space.
   - Enforces room exclusivity: no hall can host two examinations in the same time slot.
4. **Faculty Invigilation Allocation:**
   - Selects faculty who are not assigned to another room in the same slot.
   - Verifies the faculty member has no recorded leave on that date/slot.
   - Checks that daily duties do not exceed the configured maximum.
5. **Alternative Suggestions:**
   - When a slot, hall, or faculty allocation fails, the system automatically analyzes alternatives and recommends specific alternative slots or halls.
6. **Hard Constraint Integrity:**
   - A schedule with any unresolved hard constraint is explicitly marked `CONFLICT_DETECTED` and publication is locked until resolved.

### Module 3: Timetable Management, Reports & Publishing
- **Interactive Calendar Grid:** Displays timetable sorted by dates and sessions.
- **Manual Assignment Editor:** Modify any slot, hall, or faculty assignment.
- **Instant Constraint Revalidation:** Any manual edit automatically re-runs the full 5-constraint validator to immediately detect if a manual clash was introduced.
- **Comprehensive Conflict Audit Reports:** Categorized by student overlaps, room capacity, double-bookings, and faculty leave with severity and suggested resolutions.
- **Publishing Safeguard:** Publication is locked if hard conflicts exist.
- **Dual Export:** Download official timetable as PDF (with SIMATS University header, timestamps, and signature blocks) and CSV.

---

## 4. Default Login & Demo Data

- **URL:** [http://localhost:5173](http://localhost:5173) (Frontend) / [http://localhost:8080](http://localhost:8080) (Backend)
- **Admin Username:** `admin`
- **Admin Password:** `admin123`
- **Reset Demo Data:** Click the **"Reset Demo Data"** button in the top navigation bar at any time to reseed the realistic SIMATS Engineering dataset (45 students, 8 courses, 8 examinations, 8 time slots, 6 rooms, 7 faculty members, and active constraints).

---

## 5. How to Run the Application

### Option A: One-Click Windows Launch (Recommended for Local Demo)
From the root directory `exam-timetable-system\`:
1. Double click **`start-all.bat`**.
2. This launches:
   - Java Spring Boot Backend on **Port 8080**
   - React.js Frontend on **Port 5173**
3. Open your browser at **`http://localhost:5173`** and log in with `admin` / `admin123`.

### Option B: Docker Compose
```bash
# From the project root
docker compose up --build
```
Services started:
- MySQL 8.0: `localhost:3306`
- Spring Boot Backend: `localhost:8080`
- React Frontend (Nginx): `localhost:3000`

### Option C: Manual Command-Line Execution

#### 1. Backend:
```bash
cd backend
# Set JAVA_HOME to JDK 21+ if needed
gradlew bootRun
```
Backend will start on port `8080`.

#### 2. Frontend:
```bash
cd frontend
npm install
npm run dev
```
Frontend will start on port `5173`.

---

## 6. Verification and Automated Test Results

The backend includes a comprehensive JUnit 5 integration test suite in `com.simats.exam.SchedulingAlgorithmTest`:

| Test Case | Scenario Verified | Outcome |
|---|---|---|
| **Test 1: Student Conflict Detection** | Conflict graph edge construction between exams sharing students; DSATUR allocates distinct time slots. | **PASS** (100%) |
| **Test 2: Disjoint Registrations** | Exams with non-overlapping student enrollments can share time slots. | **PASS** (100%) |
| **Test 3: Room Capacity Strict Enforcement** | Attempting to allocate an undersized room (30 seats for 45 students) triggers `ROOM_CAPACITY_EXCEEDED`. | **PASS** (100%) |
| **Test 4: Duplicate Room Booking** | Assigning two exams to the same hall in the same slot triggers `ROOM_DOUBLE_BOOKING`. | **PASS** (100%) |
| **Test 5: Faculty Availability Enforcement** | Assigning an invigilator on recorded leave triggers `FACULTY_UNAVAILABLE`. | **PASS** (100%) |
| **Test 6: Faculty Overlap Rejection** | Assigning an invigilator to two concurrent exam halls triggers `FACULTY_OVERLAP`. | **PASS** (100%) |
| **Test 7: Manual Modification & Revalidation** | Manual drag/edit causing clash is caught instantly; resolving edit validates successfully. | **PASS** (100%) |

**Test Execution Command:**
```bash
cd backend
gradlew test
```
**Result:** 7 of 7 tests passed (BUILD SUCCESSFUL).

