import asyncio
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from story_writer import StoryWriter
from story_prompt import StoryPrompt
from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

# Mount the images directory
app.mount("/images", StaticFiles(directory="images"), name="images")

# CORS configuration
origins = [
    "http://localhost:3000",  # Add your frontend URL
    "http://localhost:9000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

class StoryRequest(BaseModel):
    story_type: str
    background_setting: str
    story_theme: str

@app.api_route("/api/v1/generate_story", methods=["POST", "OPTIONS"])
async def generate_story(request: Request, story_request: StoryRequest):

    if request.method == "OPTIONS":

            return {"message": "Options request"}
    writer = StoryWriter()
    prompt_generator = StoryPrompt()
    try:
        prompt = prompt_generator.generate(
            story_type=story_request.story_type,
            background_setting=story_request.background_setting,
            story_theme=story_request.story_theme
        )
        story = writer.write_story(prompt)

        # Convert local image paths to URLs and handle image generation failures
        for item in story['paragraphs']:
            if 'image' in item and item['image']:
                item['image'] = str(request.url_for('images', path=os.path.basename(item['image'])))
            else:
                item['image'] = "None"  # Set to None if image generation failed
            # item.pop('image_path', None)  # Remove the image_path key
        logger.info("Image paths converted successfully")

        logger.info(f"Returning generated story: {story}")
        return {"prompt": prompt, "story": story}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(ve)}")
    except TypeError as te:
        raise HTTPException(status_code=400, detail=f"Type error: {str(te)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
