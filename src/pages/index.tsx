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
  image?: string;
};

type Story = {
  story: StoryPart[];
};

type StoryDetails = {
  story_type: string;
  background_setting: string;
  story_theme: string;
};

import jsPDF from "jspdf";

const getImageDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const downloadPDF = async (story: Story) => {
  const pdf = new jsPDF();
  let yOffset = 20;
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Add title
  pdf.setFontSize(24);
  pdf.text("Generated Story", pageWidth / 2, yOffset, { align: "center" });
  yOffset += 15;

  pdf.setFontSize(12);

  for (const [index, part] of story.story.entries()) {
    // Check if we need a new page
    if (yOffset > pageHeight - 40) {
      pdf.addPage();
      yOffset = 20;
    }

    // Add paragraph number
    pdf.setFont(undefined, "bold");
    yOffset += 10;

    // Add paragraph text
    pdf.setFont(undefined, "normal");
    const lines = pdf.splitTextToSize(part.paragraph, contentWidth);
    pdf.text(lines, margin, yOffset);
    yOffset += 5 * lines.length;

    // Add image if available
    if (part.image && part.image !== "None") {
      try {
        const imageDataUrl = await getImageDataUrl(part.image);
        const imgProps = pdf.getImageProperties(imageDataUrl);
        const imgWidth = contentWidth;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        // Check if image fits on current page
        if (yOffset + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yOffset = 20;
        }

        pdf.addImage(
          imageDataUrl,
          "JPEG",
          margin,
          yOffset,
          imgWidth,
          imgHeight,
        );
        yOffset += imgHeight + 10;
      } catch (error) {
        console.error("Error loading image:", error);
        pdf.text("(Image could not be loaded)", margin, yOffset);
        yOffset += 10;
      }
    }

    // Add some space between paragraphs
    yOffset += 10;
  }

  pdf.save("generated_story.pdf");
};

const ToggleButton = ({
  onClick,
  isVisible,
}: {
  onClick: () => void;
  isVisible: boolean;
}) => (
  <Button
    onClick={onClick}
    className="fixed top-4 left-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded shadow-md hover:shadow-lg transition-all duration-300"
  >
    {isVisible ? "Hide Input" : "Show Input"}
  </Button>
);

export default function Home() {
  const [storyDetails, setStoryDetails] = useState<StoryDetails>({
    story_type: "",
    background_setting: "",
    story_theme: "",
  });

  const [generatedStory, setGeneratedStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputCardVisible, setInputCardVisible] = useState(true);

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
        setInputCardVisible(false); // Hide input card after story generation
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

  const downloadPDF = async (story: Story) => {
    const pdf = new jsPDF();
    let yOffset = 20;
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    pdf.setFontSize(24);
    pdf.text("Generated Story", pageWidth / 2, yOffset, { align: "center" });
    yOffset += 15;

    pdf.setFontSize(12);

    for (const part of story.story) {
      if (yOffset > pageHeight - 40) {
        pdf.addPage();
        yOffset = 20;
      }

      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(part.paragraph, contentWidth);
      pdf.text(lines, margin, yOffset);
      yOffset += 5 * lines.length;

      if (part.image && part.image !== "None") {
        try {
          const imageDataUrl = await getImageDataUrl(part.image);
          const imgProps = pdf.getImageProperties(imageDataUrl);
          const imgWidth = contentWidth;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

          if (yOffset + imgHeight > pageHeight - margin) {
            pdf.addPage();
            yOffset = 20;
          }

          pdf.addImage(
            imageDataUrl,
            "JPEG",
            margin,
            yOffset,
            imgWidth,
            imgHeight,
          );
          yOffset += imgHeight + 10;
        } catch (error) {
          console.error("Error loading image:", error);
          pdf.text("(Image could not be loaded)", margin, yOffset);
          yOffset += 10;
        }
      }

      yOffset += 10;
    }

    pdf.save("generated_story.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <ToggleButton
        onClick={() => setInputCardVisible(!inputCardVisible)}
        isVisible={inputCardVisible}
      />
      {inputCardVisible && (
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
                <div>
                  <label
                    htmlFor="story-type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Main Character
                  </label>
                  <Select
                    onValueChange={(value) =>
                      setStoryDetails((prev) => ({
                        ...prev,
                        story_type: value,
                      }))
                    }
                  >
                    <SelectTrigger id="story-type">
                      <SelectValue placeholder="Select Main Character" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Detective",
                        "Alien",
                        "Superhero",
                        "Time traveler",
                        "Curious child",
                        "Talking animal",
                        "Fairy princess",
                        "Brave knight",
                        "Magical creature",
                        "Ordinary person",
                      ].map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label
                    htmlFor="background-setting"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Story Setting
                  </label>
                  <Select
                    onValueChange={(value: string) =>
                      setStoryDetails((prev) => ({
                        ...prev,
                        background_setting: value,
                      }))
                    }
                  >
                    <SelectTrigger id="background-setting">
                      <SelectValue placeholder="Select Story Setting" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Abandoned spaceship",
                        "Medieval castle",
                        "Futuristic city",
                        "Underwater research facility",
                        "Enchanted forest",
                        "Magical kingdom",
                        "Secret garden",
                        "Treehouse village",
                        "Candy land",
                        "Cloud city",
                        "Prehistoric jungle",
                        "Haunted mansion",
                      ].map((setting) => (
                        <SelectItem key={setting} value={setting}>
                          {setting}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label
                    htmlFor="story-theme"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Story Goal
                  </label>
                  <Select
                    onValueChange={(value: string) =>
                      setStoryDetails((prev) => ({
                        ...prev,
                        story_theme: value,
                      }))
                    }
                  >
                    <SelectTrigger id="story-theme">
                      <SelectValue placeholder="Select Story Goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Solve a mystery",
                        "Save the world",
                        "Find a way home",
                        "Defeat an ancient evil",
                        "Make a new friend",
                        "Learn a valuable lesson",
                        "Discover a hidden talent",
                        "Break a magical curse",
                        "Reunite a family",
                        "Protect nature",
                        "Spread kindness and joy",
                        "Overcome a fear",
                      ].map((theme) => (
                        <SelectItem key={theme} value={theme}>
                          {theme}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full text-lg font-semibold py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Generating..." : "Generate Story"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      {generatedStory && (
        <div
          className={`mt-8 px-4 sm:px-6 lg:px-8 max-w-full mx-auto ${!inputCardVisible ? "w-full" : ""}`}
        >
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                Generated Story
              </h2>
              <Button
                onClick={() => downloadPDF(generatedStory)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded shadow-md hover:shadow-lg transition-all duration-300"
              >
                Download Story as PDF
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-300px)]">
              {generatedStory.story.map((part, index) => (
                <div key={index} className="mb-8">
                  <p className="text-lg text-gray-700 mb-4 leading-relaxed">
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
          </div>
        </div>
      )}
    </div>
  );
}
