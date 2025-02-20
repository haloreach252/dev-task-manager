This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Project layout

## Project Requirements

This project uses Supabase auth, storage, and realtime specifically. The database used CAN be a self-hosted one
but should still be a PostgreSQL database.

## .env

The .env.example file has the .env keys you'll need to setup the project locally

If using Supabase, the various urls and keys can be found in your dashboard

DATABASE_URL should be the Supabase connection pooling url.
DIRECT_URL should be the Supabase direct url.
NEXT_PUBLIC_SUPABASE_URL should be the url given to you by auth
NEXT_PUBLIC_SUPABASE_ANON_KEY should be the key given to you by auth
NEXT_PUBLIC_SITE_URL should be the base url for your site (e.g. http://localhost:3000 for local dev or https://mywebsite.com for a hosted website)

## src

This project uses the src directory to store project files

## Components

The components directory contains global components. Components specific to a certain page should be in a component
folder under that pages directory

## Lib folder

The lib folder handles anything that should remain relatively global within the app. At the time of writing,
it currently handles creating a prisma client, and creating and handling the Supabase auth client and middleware.

## App folder

The app folder contains the code for everything else the app needs to function.