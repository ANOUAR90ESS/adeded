
# VETORRE - Next-Gen AI Tool Directory

VETORRE is a comprehensive platform for discovering, generating, and experimenting with AI tools. Built with React, Supabase, and Google Gemini 2.5.

## 🚀 Features

- **AI Tool Directory**: Automatically filtered listings (Free, Paid, Top Rated).
- **Gemini Powered**: Uses `gemini-2.5-flash` and `gemini-3-pro` for content generation.
- **Veo Studio**: Generate 1080p videos using the Google Veo model.
- **Live Demo**: Real-time voice interaction using Gemini Live API.
- **Admin Dashboard**: Manage content, generate tools from RSS feeds, and analyze trends.

## 🛠️ Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Create a `.env` file in the root:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
    ```
    *Note: The Gemini API Key is injected automatically in the AI Studio environment via `process.env.API_KEY`.*

4.  **Database Setup**:
    - Go to your Supabase Project -> SQL Editor.
    - Copy the contents of `supabase_schema.sql`.
    - Run the script to create tables and policies.

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🧠 Smart Filtering

The app automatically sorts tools into **Free** or **Paid** categories based on the `price` field.
- **Free**: Includes keywords like "Free", "Freemium", "0", "Trial", "Open Source".
- **Paid**: Includes currency symbols ($), "Paid", "Pro", "Premium".

## 📄 License

MIT
# newsve
