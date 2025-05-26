Trimble Identity (TID) authentication is now integrated into your project:

A "Sign in with Trimble" button is added to your UI.
The OAuth 2.0 / OpenID Connect flow is implemented in your JavaScript.
After login, user info is displayed.
To complete the setup:

Replace the placeholders in app.js for TID_CLIENT_ID and TID_REDIRECT_URI with your actual values from the Trimble Developer Portal.
For production, move the token exchange to a backend server for security.
