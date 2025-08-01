"use server";

export async function clipTweet(tweetUrl: string, start: string, end: string) {
  const response = await fetch(`http://109.199.102.132:9000/clip`, {
    method: "POST",
    body: JSON.stringify({ tweetUrl, start, end }),
  });
  const data = await response.json();

  return data;
}
