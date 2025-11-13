## Features

- **Group Vector Aligner**: Custom group alignment tool with structured interviews and AI-powered summaries
- Works across the entire [Next.js](https://nextjs.org) stack
  - App Router
  - Pages Router
  - Middleware
  - Client
  - Server
  - It just works!

## Group Vector Aligner Features

This starter has been customized with a **Group Vector Aligner** - a tool for structured group alignment:

- **Structured Interviews**: 9-question alignment survey covering Purpose, Sponsorship, Resources, Leadership, Deliverables, Plan, Change, Investment, and Benefits
- **Single Group Focus**: Simplified workflow with one group ("default-group") for streamlined collaboration
- **AI-Powered Summaries**: OpenAI integration generates comprehensive alignment summaries when 3+ contributors participate
- **Real-time Dashboard**: Live tracking of contributor count and alignment status
- **Supabase Integration**: Secure user authentication and data persistence

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

 4. Rename `.env.example` to `.env.local` and update the following:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[INSERT SUPABASE PROJECT API PUBLISHABLE OR ANON KEY]
   OPENAI_API_KEY=[INSERT YOUR OPENAI API KEY]
   ```
   > [!NOTE]
   > This example uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, which refers to Supabase's new **publishable** key format.
   > Both legacy **anon** keys and new **publishable** keys can be used with this variable name during the transition period. Supabase's dashboard may show `NEXT_PUBLIC_SUPABASE_ANON_KEY`; its value can be used in this example.
   > See the [full announcement](https://github.com/orgs/supabase/discussions/29260) for more information.

   Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` can be found in [your Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true).

   The `OPENAI_API_KEY` is required for AI-powered group alignment summaries. Get your API key from [OpenAI's platform](https://platform.openai.com/api-keys).

5. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

6. This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete `components.json` and [re-install shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.
