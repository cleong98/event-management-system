~# Dreamory Interview - Technical Assessment

### Main goal

Build a simple event management app

### Rules

1. Commit your code to GitHub (Remember to include your **`.env`** file)
2. Share with us your repository URL once you have completed the assessment.

### Minimum Requirement

#### Frontend
1. Written in TypeScript.
2. Use **ReactJS**
3. Use Material UI as the CSS framework.~
4. Use React Hook Form for efficient form handling with proper data validation.
5. Use TanStack Query for data fetching and state management.
6. Organizing the application into reusable components with proper separation of concerns.

#### Backend
1. Written in TypeScript.
2. Use **NestJS (Preferred)** or **Express.js (Less Preferred)**
3. Use **Prisma and Postgres** as the database solution
4. Organize code in a MVC structure
5. Use JWT authentication with AuthGuard to secure backend APIs
6. Encrypt user passwords before storing them

### Bonus
1. Validate input from the frontend using class-validator or an equivalent library.
2. Implement a refresh token mechanism
3. Implement pagination to limit results per page.
4. Enhance the frontend application with responsive design techniques, ensuring that the UI adapts seamlessly to different screen sizes.

### App Features

#### Admin Portal

1. **Registration**: 
   1. User can sign up for an admin portal account.
2. **Login**: 
   1. User can log in to the admin portal using email and password credentials.
3. **List events**: 
   1. Events are displayed in a table format for easy reference.
   2. The table should has filter, sort and search feature
4. **Create event**:
   1. User can create new events by providing details such as Event Name, Start Date, End Date & Location.
   2. User can upload an event poster thumbnail.
   3. Newly created events are automatically set with a status of "Ongoing".
5. **Update event**: 
   1. User can edit event details and change the uploaded thumbnail.
   2. A dropdown menu allow users to switch the event status between "Ongoing" and "Completed".
6. **Delete event**: 
   1. Users can delete events, with password validation required for confirmation.

#### User Portal

1. **List events**: 
   1. Events are presented in a thumbnail gallery format for easy browsing, with the event poster thumbnail image.
2. **Select event**: 
   1. Users can click on individual event to view the event detail