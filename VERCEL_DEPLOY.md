# Deploying NexusAxolotlAI to Vercel

This guide explains how to deploy the application to Vercel directly from your GitHub repository.

## Prerequisites
1.  A [Vercel account](https://vercel.com).
2.  The project pushed to your GitHub repository (which you have already done).
3.  Your **OpenAI API Key**.

## Steps to Deploy

1.  **Log in to Vercel** and go to your **Dashboard**.
2.  Click **"Add New..."** -> **"Project"**.
3.  **Import Git Repository**:
    *   Find your repository (`NexusAxolotlAI`) in the list.
    *   Click **"Import"**.

4.  **Configure Project**:
    *   **Framework Preset**: Vercel should automatically detect `Vite`. If not, select **Vite**.
    *   **Root Directory**: Leave as `./` (default).
    *   **Build and Output Settings**:
        *   **Build Command**: `npm run build` (Default)
        *   **Output Directory**: `dist/public`
            *   *Note: You MUST change this from the default `dist` to `dist/public` because we configured the project to build there.*
    *   **Environment Variables**:
        *   Expand the "Environment Variables" section.
        *   Add the following variable:
            *   **Key**: `OPENAI_API_KEY`
            *   **Value**: `sk-...` (Your actual OpenAI API Key)

5.  **Deploy**:
    *   Click **"Deploy"**.

## Important Notes

### Data Persistence
Currently, the application uses **In-Memory Storage**. This means:
*   **Data is NOT saved permanently.**
*   Every time the Vercel serverless function restarts (which happens frequently), all submissions and chat history will be reset.
*   To enable permanent storage, you would need to set up a PostgreSQL database (e.g., Vercel Postgres) and update the code to use it.

### Functionality
*   The **Frontend** (UI) is served as static files.
*   The **Backend** (API) runs as Vercel Serverless Functions via the `api/index.ts` adapter we created.
*   All features (Chat, Donations, etc.) should work, but remember the data persistence limitation.
