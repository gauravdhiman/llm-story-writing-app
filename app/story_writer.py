import logging

from ell.types import Message
from replicate.deployment import Dict
from typing import List

import ell
from openai import Client
from dotenv import load_dotenv
import os

from dotenv import load_dotenv

load_dotenv()

import replicate
import requests
from pathlib import Path
from pydantic import BaseModel, Field

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")

client = Client(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_API_KEY)
ell.config.register_model("openai/gpt-4o-mini", client)

class StoryPragraph(BaseModel):
    paragraph: str = Field(description="One of the paragraphs of the story")
    image_prompt: str = Field(description="Image prompt to generate image for the paragraph")
    # summary: str = Field(description="A brief summary of the movie")

class StoryPragraphs(BaseModel):
    paragraphs: List[StoryPragraph] = Field(description="List of objects of type StoryParagraph")

class StoryWriter:
    def __init__(self):
        self.stories_written = []
        self.image_folder = Path("images")
        self.image_folder.mkdir(exist_ok=True)


    # @ell.simple(model="openai/gpt-4o-mini")
    @ell.complex(model="openai/gpt-4o-mini", response_format=StoryPragraphs)
    def generate_story(self, prompt: str):
        """You are an expert story writer. Write a short story based on the given prompt. Story MUST BE of at least 5 paragraphs or can be more, but NOT LESS THAN 5 paragprahs.
        For each paragraph, also provide a vivid image prompt that captures the essence of that paragraph.

        Return the result as a list of dictionaries, where each dictionary contains:
        - 'paragraph': The story paragraph text
        - 'image_prompt': A detailed prompt for generating an image based on the paragraph
        """

        return f"Write a short story (minimum 5 paragraphs) based on this prompt: {prompt}. Provide the story in a structured format with paragraphs and image prompts for each paragraph."

    def generate_image(self, prompt: str) -> str:

        try:
            image_url = replicate.run(
                "black-forest-labs/flux-1.1-pro",
                input={"prompt": prompt}
            )

            # if not output or not isinstance(output, list) or len(output) == 0:
            #     raise ValueError("Unexpected output format from Replicate API")

            # image_url = output[0]
            image_name = f"{hash(prompt)}.png"
            image_path = self.image_folder / image_name
            response = requests.get(image_url)

            response.raise_for_status()  # Raises an HTTPError for bad responses
            with open(image_path, "wb") as f:
                f.write(response.content)

            return str(image_path)
        except Exception as e:
            print(f"Error in generate_image: {str(e)}")
        return ""  # Return an empty string if image generation fails

    def write_story(self, prompt: str) -> dict[str, list[dict[str, str]]]:

        story_structure = self.generate_story(prompt)
        # para_obj = StoryPragraph(paragraph="This is just a test story, nothing else", image_prompt="A beautiful garden village that has pond full of ducks.")
        # story_structure = StoryPragraphs(paragraphs=[para_obj])

        story_structure = story_structure.parsed

        for para_obj in story_structure.paragraphs:
            # para_obj = story_structure.parsed

            image_path = self.generate_image(para_obj.image_prompt)
            self.stories_written.append({'paragraph': para_obj.paragraph, 'image': image_path})

        return {"story": self.stories_written}

    def get_stories(self) -> list[list[dict[str, str]]]:

        return self.stories_written
