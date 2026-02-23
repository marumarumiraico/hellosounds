# Hello Sounds 🐾

Hear how animals, objects, and humans speak around the world! This project uses **Google Cloud Text-to-Speech (Neural2/Wavenet)** to provide high-quality, native pronunciations for sounds in 15 different languages.

## Tech Stack
- **Frontend**: Vanilla JS, HTML5, CSS3
- **Backend**: Cloudflare Functions (Serverless)
- **API**: Google Cloud Text-to-Speech API
- **Deployment**: Cloudflare Pages

## Features
- 15 Countries supported with native accents.
- High-quality AI voices.
- Interactive UI with jelly animation feedback.
- Automatic fallback to browser speech synthesis.

## Environment Variables
To run this project with full AI voice support, you need to set:
- `GOOGLE_TTS_API_KEY`: Your Google Cloud API Key.
