### Do
- Use our brandkit and styles where possible.
- Default to small components. Prefer focused modules over god components.
- Use comments to explain your code in Dutch.
- Code, functions, vars - everything but comments and documentation - should be in English.
- Use `./js/config.js` and `./js/auth.js` for configuration and authentication.
- Use `./js/utils.js` for utility functions.
- Use `./js/loader.js` for component loading.
- Adhere to official documentation from Supabase.

### Don't
- Do not hard code colors, use `css/variables.css` where possible to adhere to our brandkit.
- Do not use `div`s if we have a component already
- Do not add new heavy dependencies without approval

### Commands
```bash
# Start the dev server
npm run dev
```

### Project Structure
- All code goes in the `src` directory.
- We have a `components` directory for reusable components.
- We have an `assets` directory for static assets, like fonts, images and icons.
- We have a `css` directory for global styles and theme configuration.
- `admin` directory for admin pages and the modules with their corresponding Javascript files.
- `pages` for all other normal pages.
- `supabase` directory contains the SQL scripts to start up the DB.
