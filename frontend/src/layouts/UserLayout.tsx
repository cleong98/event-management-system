import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
} from '@mui/material';

export const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <AppBar position="static" className="shadow-md">
        <Toolbar className="px-4 sm:px-6 lg:px-8">
          <Typography
            variant="h6"
            component="div"
            className="flex-grow text-base sm:text-lg md:text-xl font-semibold"
          >
            Event Management System
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <main className="flex-grow">
        <Container
          maxWidth="xl"
          className="py-4 px-4 sm:py-6 sm:px-6 md:py-8 md:px-8"
        >
          <Outlet />
        </Container>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 dark:bg-gray-800 py-4 px-4 mt-auto">
        <Container maxWidth="xl">
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            className="text-xs sm:text-sm"
          >
            Event Management System © {new Date().getFullYear()}
          </Typography>
        </Container>
      </footer>
    </div>
  );
};
