import ell
from openai import Client
from dotenv import load_dotenv
import os

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

client = Client(base_url="https://openrouter.ai/api/v1", api_key=OPENROUTER_API_KEY)
ell.config.register_model("openai/gpt-4o-mini", client)

class StoryWriter:
    def __init__(self):
        self.stories_written = []

    @ell.simple(model="openai/gpt-4o-mini")
    def generate_story(self, prompt: str ):
        """You are an expert story writer. Write a short story (around 3 paras) based on the given prompt."""
        return f"Write a short story based on this prompt: {prompt}"

    def write_story(self, prompt: str):
        story = self.generate_story(prompt)
        self.stories_written.append(story)
        return story

    def get_stories(self) -> list[str]:
        return self.stories_written
