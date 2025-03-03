@echo off
echo === Tailwind CSS Debugging Script ===
echo Checking Tailwind configuration...

REM Check if tailwind.config.ts exists
if exist tailwind.config.ts (
  echo ✅ tailwind.config.ts found
) else (
  echo ❌ tailwind.config.ts not found
)

REM Check if postcss.config.mjs exists
if exist postcss.config.mjs (
  echo ✅ postcss.config.mjs found
) else (
  echo ❌ postcss.config.mjs not found
)

REM Check if globals.css exists
if exist src\app\globals.css (
  echo ✅ src\app\globals.css found
) else (
  echo ❌ src\app\globals.css not found
)

REM Generate a full Tailwind CSS output for inspection
echo Generating full Tailwind CSS output for inspection...
npx tailwindcss -i src\app\globals.css -o tailwind-debug-output.css

echo Checking for Tailwind directives in globals.css...
findstr /C:"@tailwind" src\app\globals.css > nul
if %errorlevel% equ 0 (
  echo ✅ @tailwind directives found in globals.css
) else (
  echo ❌ @tailwind directives not found in globals.css
)

echo === Debugging Complete ===
echo Check tailwind-debug-output.css for the full CSS output
echo If you're having styling issues, make sure:
echo 1. Tailwind directives (@tailwind base, components, utilities) are in globals.css
echo 2. The content paths in tailwind.config.ts include all your template files
echo 3. Your layout.tsx properly imports globals.css
echo 4. Your server is correctly serving CSS files with the right content type 