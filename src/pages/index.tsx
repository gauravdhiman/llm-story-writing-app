import React, { useState } from "react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StoryPart = {
  paragraph: string;
  image: string;
};

type Story = {
  story: StoryPart[];
};

type StoryDetails = {
  story_type: string;
  background_setting: string;
  story_theme: string;
};

export default function Home() {
  const [storyDetails, setStoryDetails] = useState<StoryDetails>({
    story_type: "",
    background_setting: "",
    story_theme: "",
  });
  const [generatedStory, setGeneratedStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !storyDetails.story_type ||
      !storyDetails.background_setting ||
      !storyDetails.story_theme
    ) {
      alert("Please fill in all fields before generating a story.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post<{ prompt: string; story: StoryPart[] }>(
        "http://localhost:9000/api/v1/generate_story",
        storyDetails,
      );
      if (response.data && response.data.story) {
        setGeneratedStory({ story: response.data.story });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error generating story:", error);
      if (axios.isAxiosError(error) && error.response) {
        alert(
          `Error: ${error.response.data.detail || "An unexpected error occurred."}`,
        );
      } else {
        alert(
          "An unexpected error occurred while generating the story. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
  console.log(generatedStory);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <Card className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20 w-full max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-center text-gray-800">
              Story Writer
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-8">
            <form onSubmit={handleSubmit} className="mb-5 space-y-4 flex-1">
              <Select
                onValueChange={(value) =>
                  setStoryDetails((prev) => ({ ...prev, story_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Story Type" />
                </SelectTrigger>
                <SelectContent>
                  {["Detective", "Alien", "Superhero", "Time traveler"].map(
                    (type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value: string) =>
                  setStoryDetails((prev) => ({
                    ...prev,
                    background_setting: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Background Setting" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Abandoned spaceship",
                    "Medieval castle",
                    "Futuristic city",
                    "Underwater research facility",
                  ].map((setting) => (
                    <SelectItem key={setting} value={setting}>
                      {setting}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value: string) =>
                  setStoryDetails((prev) => ({ ...prev, story_theme: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Theme" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Solve a mystery",
                    "Save the world",
                    "Find a way home",
                    "Defeat an ancient evil",
                  ].map((theme) => (
                    <SelectItem key={theme} value={theme}>
                      {theme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="submit"
                className="w-full text-lg font-semibold py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Generating..." : "Generate Story"}
              </Button>
            </form>
            {generatedStory && (
              <div className="flex-1 mb-4 p-4 bg-gray-50 rounded-lg overflow-y-auto max-h-[600px]">
                {generatedStory.story.map((part, index) => (
                  <div key={index} className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                      {part.paragraph}
                    </p>
                    <img
                      src={part.image}
                      alt={`Story image ${index + 1}`}
                      className="w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
