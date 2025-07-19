"use client";

import { useState, useRef, useTransition } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FileText, Play, Eraser, Undo, Redo } from "lucide-react";
import {
  imageToImage,
  textToImage,
  imageToVideo,
  uploadFileToIPFS,
} from "@/app/actions";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export const maxDuration = 60; // Applies to the actions

export default function VideoGenerator() {
  const { toast } = useToast();
  const [script, setScript] = useState("");
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  const handleScriptChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setScript(event.target.value);
  };

  const handlePromptChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPrompt(event.target.value);
  };

  const handleSubmit = async (inputType: "scribble" | "script") => {
    // generate image from scribble
    if (inputType === "scribble") {
      setIsGenerating(true);
      const canvas = canvasRef.current;
      if (canvas) {
        try {
          const imageData = await canvas.exportImage("png");
          const response = await imageToImage(prompt, imageData);
          if (response.success) {
            setImages((prevImages) => [...response.images, ...prevImages]);
            setIsGenerating(false);
          } else {
            console.error(
              "Failed to generate image from scribble:",
              response.error
            );
            setIsGenerating(false);
          }
        } catch (error) {
          console.error("Error exporting canvas image:", error);
          setIsGenerating(false);
        }
      }
    } else {
      setIsPending(true);
      console.log("Generating image from script:", script);
      try {
        // livepeer to generate image from prompt
        const response = await textToImage(script);
        if (response.success) {
          setImages((prevImages) => [...response.images, ...prevImages]);
          setIsPending(false);
        }
      } catch (error) {
        console.error("Error generating image from script:", error);
        setIsPending(false);
      }
    }
  };

  const handleGenerateVideo = async (imageUrl: string) => {
    setIsGeneratingVideo(true);
    console.log("Generating video from image:", imageUrl);
    try {
      // const response = await imageToVideo(imageUrl);
      const response = await fetch(
        `https://livepeer-proxy.onrender.com/image-to-video?imageUrl=${imageUrl}`
      ).then((res) => res.json());

      console.log("response", response);

      if (response.data.success) {
        setVideos((prevVideos) => [...response.data.images, ...prevVideos]);
        setIsGeneratingVideo(false);
      } else {
        console.error("Failed to generate video:", response.data.error);
        setIsGeneratingVideo(false);
        toast({
          title: "Error",
          description: "Failed to generate video from image.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating video from image:", error);
      setIsGeneratingVideo(false);
    }
  };

  const handleSaveVideo = async (videoUrl: string) => {
    setIsSavingVideo(true);
    const existingVideos = JSON.parse(localStorage.getItem("myAssets") || "[]");
    const videoExists = existingVideos.some(
      (video: { livepeerUrl: string }) => video.livepeerUrl === videoUrl
    );
    if (videoExists) {
      toast({
        title: "Video Exists",
        description: "This video has already been saved to My Assets.",
        variant: "destructive",
      });
      console.log("Video already saved to My Assets.");
      setIsSavingVideo(false);
    } else {
      const fileIpfsHash = await uploadFileToIPFS(videoUrl);
      const videoData = {
        url: `https://copper-lazy-gamefowl-691.mypinata.cloud/ipfs/${fileIpfsHash}`,
        uri: fileIpfsHash,
        livepeerUrl: videoUrl,
        nftMinted: false,
        nftIpfsHash: "",
        nftHash: "",
        registeredIp: false,
        tokenId: "",
        storyExplorerLink: "",
      };
      // Save the new video to local storage
      existingVideos.push(videoData);
      localStorage.setItem("myAssets", JSON.stringify(existingVideos));

      // Display a toast to inform the user
      toast({
        title: "Video Saved",
        description: "Video saved to My Assets!",
      });
      setIsSavingVideo(false);
    }
  };

  const handlePlayPause = (videoElement: HTMLVideoElement) => {
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>AI Video Generator</CardTitle>
          <CardDescription>
            Create visuals for your story using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="scribble" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scribble">Scribble Input</TabsTrigger>
              <TabsTrigger value="script">Script Input</TabsTrigger>
            </TabsList>
            <TabsContent value="scribble">
              <div className="space-y-4">
                <Label>Draw your scene</Label>
                <div className="border rounded-lg p-2">
                  <ReactSketchCanvas
                    ref={canvasRef}
                    width="100%"
                    height="300px"
                    strokeWidth={brushSize}
                    strokeColor={brushColor}
                    canvasColor="#ffffff"
                    className="w-full h-auto border rounded cursor-crosshair touch-none"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="brush-color">Color:</Label>
                    <Input
                      id="brush-color"
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-12 h-12 p-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="brush-size">Size:</Label>
                    <Slider
                      id="brush-size"
                      min={1}
                      max={20}
                      value={[brushSize]}
                      onValueChange={(value) => setBrushSize(value[0])}
                      className="w-32"
                    />
                  </div>
                  <Button
                    onClick={() => canvasRef.current?.undo()}
                    variant="outline"
                  >
                    <Undo className="mr-2 h-4 w-4" />
                    Undo
                  </Button>
                  <Button
                    onClick={() => canvasRef.current?.redo()}
                    variant="outline"
                  >
                    <Redo className="mr-2 h-4 w-4" />
                    Redo
                  </Button>
                  <Button
                    onClick={() => canvasRef.current?.clearCanvas()}
                    variant="outline"
                  >
                    <Eraser className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="prompt-input">
                    Enter your prompt for your scribble
                  </Label>
                  <Textarea
                    id="prompt-input"
                    placeholder="Enter your prompt here..."
                    value={prompt}
                    onChange={handlePromptChange}
                    rows={2}
                  />
                </div>
                <div className="w-full flex justify-center">
                  <Button
                    onClick={() => handleSubmit("scribble")}
                    disabled={isGenerating || !prompt}
                  >
                    {isGenerating
                      ? "Generating..."
                      : "Generate Image from Scribble"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="script">
              <div className="space-y-4">
                <Label htmlFor="script-input">
                  Enter your script with scene description
                </Label>
                <Textarea
                  id="script-input"
                  placeholder="Enter your script here..."
                  value={script}
                  onChange={handleScriptChange}
                  rows={5}
                />
                <Button
                  onClick={() => handleSubmit("script")}
                  disabled={!script || isPending}
                >
                  {isPending ? "Generating..." : "Generate from Script"}
                  {!isPending && <FileText className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          {images.length > 0 && (
            <div className="mt-8 flex flex-col items-center w-full">
              <h2 className="mb-4 text-xl font-semibold">Generated Images</h2>
              <div className="flex w-full justify-end">
                <Button
                  variant="outline"
                  className="my-4 "
                  onClick={() => setImages([])}
                >
                  Clear Images
                </Button>
              </div>
              {images.map((src, index) => (
                <div
                  key={index}
                  className="flex flex-col justify-center items-center"
                >
                  <img
                    src={src}
                    alt={`Generated Image ${index + 1}`}
                    className="rounded-lg"
                  />
                  <Button
                    variant="outline"
                    className="my-2 "
                    onClick={() => handleGenerateVideo(src)}
                    disabled={isGeneratingVideo}
                  >
                    {isGeneratingVideo
                      ? "Generating Video..."
                      : "Generate Video from Image"}
                  </Button>
                </div>
              ))}
              {/* Add a button to clear all images */}
            </div>
          )}

          {videos.length > 0 && (
            <div className="mt-8 flex flex-col items-center w-full">
              <h2 className="mb-4 text-xl font-semibold">Generated Videos</h2>
              {videos.map((src, index) => (
                <div className="flex flex-col justify-center items-center">
                  <video
                    key={index}
                    width={1280}
                    height={720}
                    controls
                    className="rounded-lg cursor-pointer"
                    onClick={(e) => handlePlayPause(e.currentTarget)}
                  >
                    <source src={src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <Button
                    variant="outline"
                    className="my-2 "
                    disabled={isSavingVideo}
                    onClick={() => handleSaveVideo(src)}
                  >
                    {isSavingVideo
                      ? "Saving Video..."
                      : "Save Video to My Assets"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
