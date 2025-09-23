# Environment Setup for Gemini API

## Step 1: Create .env.local file

Create a file named `.env.local` in your project root with the following content:

```bash
# Add your Gemini API key here
GEMINI_API_KEY="AIzaSyAkiSbRAjNiVchWiEH_ZcIxSj0dWnmB08I"

# Database (if needed)
DATABASE_URL="postgresql://username:password@hostname:port/database"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Step 2: Get your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" 
4. Create a new API key
5. Copy the key and replace `your_actual_gemini_api_key_here` in the .env.local file

## Step 3: Restart your development server

After creating the .env.local file:

```bash
npm run dev
```

## Step 4: Test the quiz

1. Go to `/quiz`
2. Take the quiz
3. Check the browser console and terminal for debug logs
4. You should see "Environment check" logs showing if the API key is detected

## Debug Information

The system will log:
- Whether GEMINI_API_KEY is detected
- Length of the API key
- Whether Gemini service is called
- Any errors during API calls

If you still see mock data, check the console logs to see what's happening.
