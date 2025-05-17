// tavily.ts
// This file will contain the logic for interacting with the Tavily API.

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string; // Optional, depending on Tavily API response structure
}

// This is a placeholder for your Tavily API Key
// In a real application, this should be stored securely, e.g., in environment variables
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || "YOUR_TAVILY_API_KEY_HERE";

export async function searchWithTavily(
  query: string,
  maxResults: number = 5
): Promise<TavilySearchResult[] | null> {
  if (!TAVILY_API_KEY || TAVILY_API_KEY === "YOUR_TAVILY_API_KEY_HERE") {
    console.error(
      "Tavily API Key is not configured. Please set it in your environment variables or directly in tavily.ts."
    );
    // Returning mock data for development without a key
    console.warn("Tavily API key not found, returning mock data.");
    return [
      {
        title: `Mock Result 1 for ${query}`,
        url: `https://example.com/mock1`,
        content: `This is mock search result content 1 for the query: ${query}. It provides some initial text. In a real scenario, this would be fetched from Tavily.`,
        score: 0.9,
      },
      {
        title: `Mock Result 2 for ${query}`,
        url: `https://example.com/mock2`,
        content: `This is mock search result content 2 for the query: ${query}. It contains further details. The actual content would be dynamic and relevant.`,
        score: 0.85,
      },
    ];
    // return null; // Or return null if you don't want mock data
  }

  const endpoint = "https://api.tavily.com/search";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: "advanced", // or "basic"
        include_answer: false, // or true, if you want Tavily's summarized answer
        include_raw_content: false, // or true
        max_results: maxResults,
        // include_domains: [],
        // exclude_domains: []
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Tavily API request failed with status ${response.status}:`, errorData);
      return null;
    }

    const data = await response.json();
    // Assuming the Tavily API returns results in a specific structure, e.g., data.results
    // You might need to adjust this based on the actual API response format
    return data.results as TavilySearchResult[];
  } catch (error) {
    console.error("Error calling Tavily API:", error);
    return null;
  }
}
