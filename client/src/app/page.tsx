"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { clipTweet } from "./actions/clip";

export default function Home() {
  const [tweetUrl, setTweetUrl] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeError, setTimeError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const validateTimeFormat = (time: string): boolean => {
    if (!time.trim()) return true;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5]?[0-9]):([0-5]?[0-9])$/;
    return timeRegex.test(time);
  };

  const isFormValid = (): boolean => {
    if (!tweetUrl.trim()) return false;
    if (!tweetUrl.includes("twitter.com") && !tweetUrl.includes("x.com")) return false;
    if (start.trim() && !validateTimeFormat(start)) return false;
    if (end.trim() && !validateTimeFormat(end)) return false;
    return true;
  };

  const handleTimeChange = (value: string, setter: (v: string) => void, label: string) => {
    setter(value);
    if (value.trim() && !validateTimeFormat(value)) {
      setTimeError(`${label} must be in HH:MM:SS format (e.g., 00:01:30)`);
    } else {
      setTimeError("");
    }
  };

  const handleClip = async () => {
    if (!tweetUrl.trim()) {
      setError("Please enter a Twitter URL");
      return;
    }

    if (!tweetUrl.includes("twitter.com") && !tweetUrl.includes("x.com")) {
      setError("Please enter a valid Twitter/X URL");
      return;
    }

    setLoading(true);
    setError("");
    setDownloadUrl("");

    try {
      const response = await clipTweet(tweetUrl, start, end);

      console.log(response);

      // Ensure the download URL is properly formatted as an absolute URL
      const formattedUrl = `http://${response.downloadUrl}`;

      setDownloadUrl(formattedUrl);

      // Automatically trigger download when ready
      await handleDownload(formattedUrl);

      setTweetUrl("");
      setStart("");
      setEnd("");
    } catch (err: any) {
      console.error("Error:", err);
      if (err.response?.data) {
        setError(err.response.data);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url?: string) => {
    const downloadUrlToUse = url || downloadUrl;
    if (!downloadUrlToUse) return;

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ downloadUrl: downloadUrlToUse }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Download failed");
        return;
      }

      // Create a blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "clipx-video.mp4";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      setError("Failed to download video");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center mb-12">
        <div className="flex items-center text-7xl md:text-8xl font-black mb-6 text-center">
          <Image className="rounded-full mr-4" src="/favicon.png" width={100} height={100} alt="ClipX Logo" />
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            ClipX
          </span>
        </div>
        <div className="text-xl md:text-2xl text-slate-400 text-center max-w-2xl leading-relaxed">
          Download any X/Twitter video in just 1 click!
          <span className="block text-slate-500 text-lg mt-2">No shady Ads, No paywall!</span>
        </div>
      </div>

      <div className="w-full max-w-lg">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-8 rounded-2xl shadow-2xl">
          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-medium mb-2">Twitter/X URL</label>
            <input
              type="text"
              placeholder="https://twitter.com/username/status/..."
              value={tweetUrl}
              onChange={e => setTweetUrl(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-900/70 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Start Time</label>
              <input
                type="text"
                placeholder="00:00:05"
                value={start}
                onChange={e => handleTimeChange(e.target.value, setStart, "Start time")}
                className="w-full p-4 rounded-xl bg-slate-900/70 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">End Time</label>
              <input
                type="text"
                placeholder="00:00:15"
                value={end}
                onChange={e => handleTimeChange(e.target.value, setEnd, "End time")}
                className="w-full p-4 rounded-xl bg-slate-900/70 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>
          </div>

          <button
            onClick={handleClip}
            disabled={loading || !isFormValid()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-blue-500/25"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Processing...
              </div>
            ) : (
              "Download Clip"
            )}
          </button>

          {timeError && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-400 text-sm">{timeError}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-500 text-md mb-4">Fast and completely free to use</p>
          <p className="text-slate-200 text-md">
            Created by -{" "}
            <Link
              href="https://x.com/AbhinavXJ"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-400"
            >
              Abhinav Jha
            </Link>
          </p>
          <p className="text-slate-200 text-md">
            Follow at -{" "}
            <Link
              href="https://x.com/JustClipX"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-400"
            >
              ClipX
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
