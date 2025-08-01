import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { downloadUrl } = await request.json();

    if (!downloadUrl) {
      return NextResponse.json({ error: "Download URL is required" }, { status: 400 });
    }

    // Fetch the video from the server
    const videoResponse = await fetch(downloadUrl);

    if (!videoResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
    }

    // Get the video content as an array buffer
    const videoBuffer = await videoResponse.arrayBuffer();

    // Get content type from the original response
    const contentType = videoResponse.headers.get("content-type") || "video/mp4";

    // Create response with proper headers for file download
    const response = new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": 'attachment; filename="clipx-video.mp4"',
        "Content-Length": videoBuffer.byteLength.toString(),
        "Cache-Control": "no-cache",
      },
    });

    return response;
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
