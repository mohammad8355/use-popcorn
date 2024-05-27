import { useState, useEffect } from "react";
export function useMovies(query, url) {
  const [error, setError] = useState("");
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchdata() {
        try {
          setError("");
          setIsLoading(true);
          const apiUrl = url + "&S=" + query;
          const res = await fetch(apiUrl, { signal: controller.signal });
          if (!res.ok) {
            throw new Error("Some thing went wrong to fetching data");
          }
          const data = await res.json();
          if (data.Response === "False") throw new Error("movie not found");
          setMovies(data.Search);
          setError("");
        } catch (err) {
          console.error(err.message);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      fetchdata();

      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return { movies, isLoading, error };
}
