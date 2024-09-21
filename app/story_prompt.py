import random

class StoryPrompt:
    def __init__(self):
        self.characters = ["Detective", "Alien", "Superhero", "Time traveler"]
        self.settings = ["Abandoned spaceship", "Medieval castle", "Futuristic city", "Underwater research facility"]
        self.conflicts = ["Solve a mystery", "Save the world", "Find a way home", "Defeat an ancient evil"]
    def generate(self, story_type: str, background_setting: str, story_theme: str) -> str:
        return f"A story about {story_type} must {story_theme} in a {background_setting}."
