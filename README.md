# FLOWYA

Product Definition · Official Development Base

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:

Create a `.env` file in the root directory with the following variables:

```env
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key_here
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

To obtain API keys:

**Mapbox Access Token (for maps):**
1. Go to [Mapbox](https://account.mapbox.com/)
2. Create an account or sign in
3. Navigate to Access Tokens
4. Create a new token or use the default token
5. Add it to your `.env` file as `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`

**OpenAI API Key (optional, for AI content generation):**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env` file as `EXPO_PUBLIC_OPENAI_API_KEY`

**Supabase (optional, for user authentication):**
1. Go to [Supabase](https://supabase.com/)
2. Create a new project or select an existing one
3. Go to Project Settings > API
4. Copy the "Project URL" and add it as `EXPO_PUBLIC_SUPABASE_URL`
5. Copy the "anon public" key and add it as `EXPO_PUBLIC_SUPABASE_ANON_KEY`
6. Note: The app will work without Supabase credentials, but authentication features will be disabled
7. **For Vercel deployment:** Configure these variables in Vercel Environment Variables, not in `.env` file

**Important:** The `.env` file is in `.gitignore` and should never be committed to version control.

3. Start the development server:
```bash
npm start
```

## Design System

- **Typography**: Inter (ÚNICA tipografía)
- **Icons**: Lucide React Native (ÚNICA librería de iconos)
- **Spacing**: Base 8px (múltiplos de 8px)
- **Glass Style**: Apple-style glassmorphism
- **Touch Targets**: Minimum 48px x 48px

See the plan documentation for complete design principles and implementation guidelines.

## Security

See `docs/SECURITY.md` for security best practices, including API key configuration and restrictions.
