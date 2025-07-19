"use server";

import path from "node:path";
import { openAsBlob } from "node:fs";
// import { writeFileSync } from "node:fs";
import { Livepeer } from "@livepeer/ai";
import { revalidatePath } from "next/cache";
import { createWriteStream } from "fs";
import { resolve } from "path";
import { get } from "https";
import { Image } from "@livepeer/ai/models/components";
// @ts-ignore
import { PinataSDK } from "pinata-web3";
import { fetchExternalImage } from "next/dist/server/image-optimizer";

const livepeerAI = new Livepeer({
  httpBearer: process.env.LIVEPEER_API_KEY,
});

// async function downloadImage(url: string) {
//   const filePath = resolve(process.cwd(), "public", "test.png");
//   const file = createWriteStream(filePath);

//   return new Promise((resolve, reject) => {
//     get(url, (response) => {
//       response.pipe(file);
//       file.on("finish", () => {
//         file.close(resolve); // Close the file stream when finished
//         console.log("Image downloaded and saved!");
//       });
//     }).on("error", (err) => {
//       console.error("Error downloading image:", err);
//       reject(err);
//     });
//   });
// }

// convert script scene to AI image
export async function textToImage(prompt: string) {
  console.log("Generating image from script:", prompt);
  const modelId = "ByteDance/SDXL-Lightning";
  const width = 1280;
  const height = 720;
  const guidanceScale = 7.5;
  const negativePrompt = "";
  const safetyCheck = true;
  const seed = 0;
  const numInferenceSteps = 50;
  const numImagesPerPrompt = 1;

  const result = await livepeerAI.generate.textToImage({
    modelId,
    prompt,
    width,
    height,
    guidanceScale,
    negativePrompt,
    safetyCheck,
    seed,
    numInferenceSteps,
    numImagesPerPrompt,
  });

  // revalidatePath("/");

  if (result.imageResponse?.images) {
    const images = result.imageResponse.images.map((image) => image.url);
    return {
      success: true,
      images,
    };
  } else {
    return {
      success: false,
      images: [],
      error: "Failed to generate images",
    };
  }
}

// convert scribble scene to AI image
export async function imageToImage(prompt: string, imageData: string) {
  // convert base64 image to ArrayBuffer
  const base64 = imageData.split(",")[1];
  const buffer = Buffer.from(base64, "base64");
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
  console.log("Array buffer:", arrayBuffer);

  const result = await livepeerAI.generate.imageToImage({
    image: { fileName: "test.png", content: arrayBuffer },
    prompt: prompt,
    modelId: "timbrooks/instruct-pix2pix",
  });

  console.log("Image to image result:", result.imageResponse);

  if (result.imageResponse?.images) {
    const images = result.imageResponse.images.map((image) => image.url);
    return {
      success: true,
      images,
    };
  } else {
    return {
      success: false,
      images: [],
      error: "Failed to generate images",
    };
  }
}

// after image is selected by user, convert to video
export async function imageToVideo(imageUrl: string) {
  const image = await fetchExternalImage(imageUrl);

  const result = await livepeerAI.generate.imageToVideo({
    image: { fileName: "test.png", content: image.buffer },
    modelId: "stabilityai/stable-video-diffusion-img2vid-xt-1-1",
  });

  console.log("Image to video result:", result.videoResponse?.images);

  if (result.videoResponse?.images) {
    const images = result.videoResponse.images.map((image) => image.url);
    return {
      success: true,
      images,
    };
  } else {
    return {
      success: false,
      images: [],
      error: "Failed to generate images",
    };
  }
}

export async function uploadJSONToIPFS(json: any) {
  const pinata = new PinataSDK({
    pinataJwt: `${process.env.PINATA_JWT}`,
    pinataGateway: `${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}`,
  });

  // console.log("pinata jwt", process.env.PINATA_JWT);
  console.log("Uploading JSON to IPFS...", json);
  const upload = await pinata.upload.json(json);
  console.log("JSON uploaded to IPFS:", upload);
  return upload.IpfsHash;
}

export async function uploadFileToIPFS(url: any) {
  const pinata = new PinataSDK({
    pinataJwt: `${process.env.PINATA_JWT}`,
    pinataGateway: `${process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL}`,
  });

  console.log("Uploading content of URL to Pinata...", url);
  const upload = await pinata.upload.url(url);
  console.log("URL contents uploaded to IPFS:", upload);
  return upload.IpfsHash;
}
