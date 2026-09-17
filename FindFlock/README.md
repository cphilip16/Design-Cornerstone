# Flock

A campus travel goal tracker for Johns Hopkins students. Discover places around Homewood, mark them visited, collect points, and move up through Flock titles.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Product notes

This first version uses `localStorage` for a lightweight demo profile. The storage boundary is intentionally small: the profile currently consists of `visitedIds`, derived `points`, and a derived `rank` from the destination and rank tables in `src/App.tsx`.

When Supabase is added, replace the local storage read/write with an authenticated profile query and a visited-destinations table. Keep points and rank derived from the destination records so they cannot drift from the user's visit history.
