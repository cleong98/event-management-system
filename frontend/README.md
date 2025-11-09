# Frontend - Event Management System

React + TypeScript frontend for the Event Management System with separate Admin and User portals.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite  
- **UI Framework**: Material UI v5
- **Routing**: React Router v6
- **Forms**: React Hook Form + Yup validation
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Testing**: Vitest + React Testing Library

## Features

### Admin Portal
- Authentication with JWT
- Events List with pagination, filtering, sorting, search
- Create Event form with file upload  
- Edit Event form with status change
- Delete Event with password confirmation
- Responsive design

### User Portal  
- Events Gallery (thumbnail view)
- Event Details page
- Public access (no auth required)

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test
```

## Docker

```bash
# Run with Docker Compose
docker-compose up frontend
```

Access at http://localhost:5173
