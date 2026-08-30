# 🎂 One More Candle

A birthday gift you send instead of just saying happy birthday.

**Live: [one-more-candle.vercel.app](https://one-more-candle.vercel.app/)**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

## What it is

You fill out a short form: your friend's name, a cake, a few photos, a message. You get back a link. You send that link. Your friend opens it and gets a small interactive surprise made specifically for them, not a generic birthday card template.

The link opens to a cake falling from the sky, piece by piece. A candle they get to tap out. A confetti reveal. A scrapbook of the two of you that they can tap through. Then the message you wrote, at the end.

No account for either of you. No app to install. Just a link.

## How it works

**Creating a gift** — pick the friend's name and an optional intro line, choose four cake presets (flavor, frosting style, background theme, candle style), upload photos with optional captions, write the birthday message. Preview it before you send it — the preview is the exact same code the recipient sees, not a mockup, so there's no surprise gap between what you check and what gets sent.

**Opening a gift** — the recipient's link loads their specific gift by a short, unguessable id. Nothing is listed or browsable; the only way to see a gift is to have its exact link.

## Stack

Plain HTML, CSS, and vanilla JavaScript. No framework, no build step, no bundler, no `npm install`. Supabase handles the database and photo storage, loaded from a CDN script tag rather than a package manager, so the whole project stays framework-free. Deployed on Vercel.

Going frameworks-free here wasn't a constraint imposed by the project's size, it was a choice: a handful of static pages with some client-side state and animation don't need a build pipeline to justify itself.

## Project layout

```
├── index.html        landing page
├── creator.html       the gift-creation form
├── gift.html          what the recipient sees (fetches a real gift by id)
├── demo.html          the recipient experience running on sample data, no backend needed
├── css/
├── js/
└── supabase/          SQL: schema, storage policies, and access control
```

## Running it locally

ES modules need to be served over `http://`, not opened as a file directly, so any static server works:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

To connect it to your own Supabase project: create a project, run the SQL files in `supabase/` in order (01 through 04), create a public storage bucket named `gift-photos`, then put your project URL and anon key into `js/supabaseClient.js`.

## A note on access

The anon key in this repo is the public client key, not a secret; it's meant to be visible in frontend code. What actually protects each gift's data is that reads only happen through a single Postgres function that returns one row by exact id. There's no endpoint that lists gifts, so having the anon key alone doesn't let anyone browse other people's gifts.

## License

MIT
