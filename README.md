# LLM Story Writing App

This project is an interactive story generation application that uses AI to create unique stories based on user input. It consists of a FastAPI backend for story generation and a Next.js frontend for user interaction.

## Features

- Dynamic story generation based on user-selected parameters
- Intuitive user interface with dropdown menus for story customization
- Real-time story display
- Responsive design for various screen sizes

## Tech Stack

### Backend
- FastAPI
- Python 3.8+
- OpenAI GPT model (via OpenRouter)
- Pydantic for data validation
- CORS middleware for cross-origin requests

### Frontend
- Next.js
- React
- Axios for API requests
- Tailwind CSS for styling
- Radix UI for accessible component primitives

## Project Structure

```
llm-story-writing-app/
├── app/
│   ├── main.py
│   ├── story_prompt.py
│   └── story_writer.py
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── select.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   ├── _app.tsx
│   │   └── index.tsx
│   └── styles/
│       └── globals.css
├── requirements.txt
└── ...other_files
```

## Setup and Installation

### Backend

1. Navigate to the project root directory:
   ```
   cd llm-story-writing-app
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `app` directory and add your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

5. Run the server:
   ```
   python app/main.py
   ```

   The server will start at http://localhost:8000.

### Frontend

1. Navigate to the project root directory:
   ```
   cd llm-story-writing-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Select a story type from the first dropdown menu.
2. Choose a background setting from the second dropdown menu.
3. Pick a story theme from the third dropdown menu.
4. Click the "Generate Story" button to create your unique story.
5. Wait for the AI to generate the story, which will then be displayed on the screen.

## API Documentation and Testing

Once the server is running, you can access the API documentation and test the endpoints using Swagger UI at:

http://localhost:8000/docs

This interactive interface allows you to:
- Explore available endpoints
- View request and response schemas
- Test API endpoints directly from your browser

## API Endpoints

- `POST /api/v1/generate_story`: Generates a story based on the provided parameters.

  Request body:
  ```json
  {
    "story_type": string,
    "background_setting": string,
    "story_theme": string
  }
  ```

  Response:
  ```json
  {
    "prompt": string,
    "story": string
  }
  ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
