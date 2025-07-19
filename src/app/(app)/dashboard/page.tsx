import Link from "next/link";
import { ArrowRight, Pencil, Film, DollarSign } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to VisualizeIt.ai</h1>
      <p className="text-xl mb-8">
        Create stunning visuals for your videos using AI-powered scene
        generation.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-blue-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Pencil className="mr-2" /> Step 1: Scribble
          </h2>
          <p className="mb-4">
            Start by creating a simple scribble or sketch of your scene idea.
          </p>
          <br />
          <Link
            href="/generate"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            Go to Generate <ArrowRight className="ml-2" />
          </Link>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Film className="mr-2" /> Step 2: Generate
          </h2>
          <p className="mb-4">
            Our AI will transform your scribble into a detailed scene based on
            your prompt.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            Start Generating <ArrowRight className="ml-2" />
          </Link>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <DollarSign className="mr-2" /> Step 3: Monetize
          </h2>
          <p className="mb-4">
            Earn creator revenue through Zora and Mint IP for your asset on
            Story Network.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            Start Generating <ArrowRight className="ml-2" />
          </Link>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/my-assets"
          className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
        >
          View My Assets <ArrowRight className="ml-2" />
        </Link>
      </div>
    </div>
  );
}
