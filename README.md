# Growth Academy Platform

A modern, fully-functional platform for Growth Academy that provides AI-powered marketing plan generation, subscription management, and expert communication tools.

## Features

- 🤖 **GrowthAI Marketing Plan Generator**: AI-powered marketing strategy generation
- 💳 **Subscription Management**: Multiple tiers with Stripe integration
- 💬 **Direct Messaging**: Real-time expert communication (Growth Expert tier)
- 🔒 **Secure Authentication**: Powered by Clerk
- 📊 **Case Studies**: Dynamic CMS-driven success stories
- 📱 **Responsive Design**: Optimized for all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Supabase
- **Authentication**: Clerk
- **Payments**: Stripe
- **AI**: Anthropic's AI API
- **Real-time Communication**: Supabase Realtime

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Configure the following in your `.env.local`:
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - CLERK_SECRET_KEY
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - STRIPE_SECRET_KEY
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   - ANTHROPIC_API_KEY

5. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # Reusable UI components
├── lib/                 # Utility functions and configurations
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

## Subscription Tiers

- **Free**: 1 AI Marketing Plan/month
- **Growth Pro**: 10 plans/month + consultation
- **Growth Expert**: 20 plans/month + VIP features

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

Proprietary - All Rights Reserved
