# Clerk Authentication Setup

This project uses Clerk for authentication. Follow these steps to set up Clerk:

## 1. Create a Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up for an account
2. Create a new application
3. Choose "Next.js" as your framework

## 2. Get Your API Keys

1. In your Clerk dashboard, go to "API Keys"
2. Copy your **Publishable Key** and **Secret Key**

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 4. Configure Clerk Settings

In your Clerk dashboard:

1. **Authentication Methods**: Enable email/password and any other methods you want
2. **User Profile**: Configure what fields users can edit
3. **Appearance**: Customize the look and feel to match your app
4. **Webhooks**: Set up webhooks to sync user data with your backend (optional)

## 5. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/sign-up` to create a new account
3. Navigate to `/sign-in` to sign in
4. Try accessing protected routes like `/upload`, `/library`, or `/compare`

## 6. Backend Integration

To integrate with your backend:

1. Use Clerk's webhooks to sync user data
2. Send the user's Clerk ID to your backend for user identification
3. Use Clerk's JWT tokens for API authentication

## Features Included

- ✅ **Sign In/Sign Up Pages**: Custom styled pages at `/sign-in` and `/sign-up`
- ✅ **Protected Routes**: Upload, Library, and Compare pages require authentication
- ✅ **User Button**: Integrated user menu in the sidebar
- ✅ **Middleware Protection**: Automatic route protection using Clerk middleware
- ✅ **Redux Integration**: User state synced with Clerk authentication
- ✅ **Responsive Design**: Works on all screen sizes

## Customization

You can customize the Clerk components by modifying:

- `src/app/sign-in/[[...sign-in]]/page.tsx` - Sign in page styling
- `src/app/sign-up/[[...sign-up]]/page.tsx` - Sign up page styling
- `src/components/layout/Navbar.tsx` - User button and auth links
- `src/middleware.ts` - Protected route configuration

## Troubleshooting

- Make sure your environment variables are correctly set
- Check that your Clerk application is properly configured
- Verify that the middleware is working by checking the network tab
- Ensure your backend can handle Clerk webhooks if you're using them
