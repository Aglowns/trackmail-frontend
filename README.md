# TrackMail Frontend

A modern Next.js frontend for the TrackMail job application tracking system.

## Features

- 🔐 **Authentication**: Supabase Auth integration with login/signup
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🎨 **Modern UI**: Built with shadcn/ui components
- 📊 **Application Management**: Create, read, update, delete job applications
- 🔍 **Search & Filter**: Filter applications by status and search by company/position
- 🎯 **Status Tracking**: Visual status badges for application stages
- 📝 **Form Validation**: React Hook Form with Zod validation
- 🔔 **Notifications**: Toast notifications for user feedback

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Auth**: Supabase Auth Client
- **HTTP Client**: Axios
- **State Management**: React hooks + Context
- **Form Handling**: React Hook Form + Zod validation
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- TrackMail backend API running

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd trackmail-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/     # Protected dashboard routes
│   │   ├── applications/
│   │   │   ├── new/
│   │   │   └── [id]/edit/
│   │   └── layout.tsx
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (redirects)
├── components/
│   ├── auth/            # Authentication components
│   ├── applications/    # Application-specific components
│   ├── layout/          # Layout components
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── api.ts           # API client
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Utility functions
└── types/
    └── application.ts    # TypeScript interfaces
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## API Integration

The frontend integrates with the TrackMail backend API. Make sure your backend is running and accessible at the URL specified in `NEXT_PUBLIC_API_URL`.

### Authentication Flow

1. User signs up/logs in via Supabase Auth
2. JWT token is automatically included in API requests
3. Backend validates the token and returns user-specific data

### API Endpoints Used

- `GET /applications` - List applications with filtering
- `GET /applications/:id` - Get single application
- `POST /applications` - Create new application
- `PUT /applications/:id` - Update application
- `DELETE /applications/:id` - Delete application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.