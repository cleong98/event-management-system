import { ReactNode } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Container,
} from "@mui/material";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  icon: ReactNode;
  avatarBgColor?: "primary.main" | "secondary.main";
}

export const AuthLayout = ({
  children,
  title,
  subtitle,
  icon,
  avatarBgColor = "primary.main",
}: AuthLayoutProps) => {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 3,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Card
          elevation={6}
          sx={{
            width: "100%",
            borderRadius: 2,
            // Hide card on mobile, show on desktop
            boxShadow: { xs: 0, sm: 6 },
            backgroundColor: { xs: "transparent", sm: "background.paper" },
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 4 },
            }}
          >
            {/* Avatar Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Avatar
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  bgcolor: avatarBgColor,
                  mb: 2,
                }}
              >
                {icon}
              </Avatar>
              <Typography
                component="h1"
                variant="h5"
                fontWeight={600}
                sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
              >
                {title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, textAlign: "center" }}
              >
                {subtitle}
              </Typography>
            </Box>

            {children}
          </CardContent>
        </Card>

        {/* Footer */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 5, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
        >
          Copyright © Event Management System {new Date().getFullYear()}
        </Typography>
      </Box>
    </Container>
  );
};
