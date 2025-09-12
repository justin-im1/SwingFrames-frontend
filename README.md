# Golf Swing Analyzer

A modern web application for analyzing and comparing golf swings using AI-powered insights. Built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- **Video Upload**: Drag-and-drop interface for uploading golf swing videos
- **Swing Tagging**: Tag swings with outcomes (pure, slice, hook, etc.) and club types
- **Side-by-Side Comparison**: Compare multiple swings with synchronized playback
- **Overlay Mode**: Transparent overlay view for detailed analysis
- **Swing Library**: Organize and manage your swing collection
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Redux Toolkit
- **Data Fetching**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Code Quality**: ESLint, Prettier, Husky

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd golf-swing-analyzer
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── upload/            # Upload page
│   ├── library/           # Library page
│   ├── compare/           # Comparison page
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── layout/           # Layout components (Navbar, Layout)
│   ├── ui/               # UI components (Button, Card)
│   ├── swing/            # Swing-related components
│   ├── upload/           # Upload components
│   └── providers/        # Context providers
├── features/             # Redux slices
│   ├── user/            # User state management
│   ├── swings/          # Swings state management
│   ├── overlay/         # Overlay settings
│   └── ui/              # UI state management
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and configurations
├── types/               # TypeScript type definitions
└── utils/               # Helper functions
```

## Features Overview

### Upload Page (`/upload`)

- Drag-and-drop video upload with progress tracking
- Swing tagging with predefined outcomes and club types
- Real-time preview of uploaded content

### Library Page (`/library`)

- Grid and list view of all uploaded swings
- Search and filter functionality
- Bulk selection for comparison
- Statistics dashboard

### Compare Page (`/compare`)

- Side-by-side and overlay comparison modes
- Synchronized video playback
- Adjustable overlay opacity
- Timeline controls and settings

## State Management

The application uses Redux Toolkit for global state management with the following slices:

- **User Slice**: Authentication and user profile
- **Swings Slice**: Swing library and selection state
- **Overlay Slice**: Comparison settings and overlay mode
- **UI Slice**: Sidebar, theme, and notifications

## API Integration

The app is designed to work with a backend API. The API layer includes:

- Authentication endpoints
- Swing CRUD operations
- Video upload with presigned URLs
- Comparison management

## Development

### Code Quality

- **ESLint**: Code linting with Next.js configuration
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **lint-staged**: Run linters on staged files

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Deployment

The application can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Docker**

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
