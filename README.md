# FreshSavings

FreshSavings is a community-driven pantry and recipe management web application. It helps users track their pantry items, share surplus food with the community, and generate recipes based on available ingredients.

The initial version of this project was scaffolded using [lovable.dev](https://lovable.dev), providing a solid foundation for rapid prototyping. Since then, the codebase has been extensively refactored and enhanced to improve maintainability, add new features, and experiment with modern web development practices.

## Features

- **Pantry Management:** Add, edit, and remove pantry items. Track expiry dates and categories.
- **Community Kitchen:** Share food items with the community and see what others have shared.
- **Recipe Generator:** Get recipe ideas based on your pantry contents.
- **Authentication:** Secure sign-in and sign-up.
- **Dark Mode:** Toggle between light and dark themes.
- **Responsive Design:** Works well on both desktop and mobile devices.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Functions)
- **State/Data:** React Query

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Supabase project (see [Supabase](https://supabase.com/))

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/r4yfon/fresh-savings.git
   cd fresh-savings
   ```

2. **Install dependencies:**

   ```sh
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**

   ```sh
   npm run dev
   # or
   yarn dev
   ```

4. **Open the app:**
   - Visit [http://localhost:8080](http://localhost:8080) in your browser.

## Project Structure

- `src/` - Main application source code
  - `components/` - UI and feature components
  - `pages/` - Top-level pages
  - `hooks/` - Custom React hooks
  - `lib/` - Utility functions
  - `integrations/` - Supabase client and types
- `supabase/` - Supabase migrations and functions
- `public/` - Static assets

## Scripts

- `dev` - Start the development server
- `build` - Build the app for production
- `preview` - Preview the production build
- `lint` - Run ESLint