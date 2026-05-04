const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

export async function searchLocation(query) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    throw new Error("Enter a place name first.");
  }

  const searchUrl = new URL(NOMINATIM_SEARCH_URL);
  searchUrl.searchParams.set("format", "jsonv2");
  searchUrl.searchParams.set("limit", "1");
  searchUrl.searchParams.set("q", normalizedQuery);

  const response = await fetch(searchUrl, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Location search is unavailable right now.");
  }

  const results = await response.json();

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error("No location matched that search.");
  }

  return {
    lat: Number(results[0].lat),
    lon: Number(results[0].lon),
    label: results[0].display_name ?? normalizedQuery
  };
}
