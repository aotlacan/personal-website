# Alex portfolio — research, robotics, and MMB pages

## Pages
- `/research.html` — links to your two research PDFs and the AI Learning Dots video
- `/robotics.html` — dedicated FIRST Robotics section with timeline and gallery
- `/mmb.html` — Michigan Marching Band highlights and gallery
- `/about.html` — short bio, contact, and resume link

## Add your images
Put JPG or PNG files in `/assets` and update the `<img src>` paths on `robotics.html` and `mmb.html`.

## Preview locally
```bash
npx serve .
```

## Deploy to Cloudflare Pages
```bash
npm i -g wrangler
wrangler login
wrangler pages deploy . --project-name=alex-portfolio
```
