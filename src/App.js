import logo from "./logo.svg";
import { useEffect, useState } from "react";
import "./index.css";
import StarRating from "./StarRating";

const url = "http://www.omdbapi.com/?apikey=a42e75d0";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [watched, setWatched] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [selectedId, setSelectedID] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  function AddWatchedHandle(newwatched) {
    if (
      watched.filter((watchedItem) => watchedItem.imdbID === newwatched.imdbID)
        .length != 0
    ) {
      setWatched((watched) =>
        watched.map((watchItem) =>
          watchItem.imdbID === newwatched.imdbID
            ? { ...watchItem, userRating: newwatched.userRating }
            : watchItem
        )
      );
      alert("successfully edit watched");
    } else {
      watched.push(newwatched);
      setWatched(watched);
      alert("successfully added new watched");
    }
  }
  function IsExist(imdbID) {
    return (
      watched.filter((watchedItem) => watchedItem.imdbID === imdbID).length != 0
    );
  }
  function handleBack() {
    setSelectedID(null);
    setSelectedMovie(null);
  }
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
          console.log(data.Search);
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
  useEffect(
    function () {
      async function findMovie() {
        if (selectedId == null) return;
        setIsLoading(true);
        try {
          setError("");
          const apiurl = url + "&i=" + selectedId + "&plot=short";
          const res = await fetch(apiurl);
          if (!res.ok) {
            throw new Error("some thing went wrong");
          }
          const data = await res.json();
          // console.log(data);
          setIsLoading(false);
          if (data.Response === "False")
            throw new Error("selected movie not found");
          setSelectedMovie(data);
        } catch (err) {
          console.error(err.message);
          setError(err.message);
        }
      }
      findMovie();
    },
    [selectedId]
  );
  return (
    <>
      <Nav>
        <Search query={query} setQuery={setQuery} />
        <ResultFound count={movies ? movies.length : 0} />
      </Nav>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList onChange={setSelectedID} movies={movies} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId && selectedMovie && !error && !isLoading && (
            <MovieDetail
              movie={selectedMovie}
              setId={setSelectedID}
              setSelectedMovie={setSelectedMovie}
              addWatched={AddWatchedHandle}
              IsExist={IsExist}
              handleBack={handleBack}
            ></MovieDetail>
          )}
          {!selectedId && !selectedMovie && !error && !isLoading && (
            <>
              <SummeryMovie watched={watched} />
              <WatchedMovieList watched={watched} />
            </>
          )}
          {error && <ErrorMessage message={error} />}
          {isLoading && <Loader />}
        </Box>
      </Main>
    </>
  );
}
function Loader() {
  return (
    <div className="loader">
      <p>Loading...</p>
    </div>
  );
}
function ErrorMessage({ message }) {
  return (
    <div className="error">
      <p>{message} ⛔</p>
    </div>
  );
}
function Nav({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
//Nav Component Include ==> Logo - Search - ResultFound Component
function ResultFound({ count }) {
  return (
    <p className="num-results">
      Found <strong>{count}</strong> results
    </p>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({ setQuery, query }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
//Nav Component Include ==> Logo - Search - ResultFound Component
function Main({ children }) {
  return <main className="main">{children}</main>;
}
//Main Component Include  ==> BoxMovie - WatchedMovie Component
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
//BoxMovie Component ==> Include MovieList Component
function MovieList({ movies, onChange }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie onChange={onChange} movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}
//MovieList Component ==> Include Movie Component
function Movie({ movie, onChange }) {
  return (
    <li key={movie.imdbID} onClick={() => onChange(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
function MovieDetail({
  movie,
  setId,
  setSelectedMovie,
  handleBack,
  addWatched,
  IsExist,
}) {
  const [userRate, setUseRate] = useState(0);

  useEffect(function () {
    document.title = "MOVIE:" + movie.Title;
    return function () {
      document.title = "POPCORN";
    };
  }, []);
  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          handleBack();
        }
      }
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [handleBack]
  );
  // console.log(isNAN(Number(movie.Runtime.substr(0, 3))));
  return (
    <div className=" details">
      <button className="btn-back" onClick={handleBack}>
        {" "}
        ✖{" "}
      </button>
      <header>
        <img src={movie.Poster} alt={movie.Title} />
        <div className="details-overview">
          <h2>{movie.Title}</h2>
          <p>
            {movie.Released} 📆 - {movie.Runtime}
          </p>
          <p>{movie.Genre}</p>
          <p>imDb Rates :{movie.imdbRating} 🌟</p>
        </div>
      </header>
      <section>
        <div className="rating">
          <StarRating gap={0.1} onSetRating={setUseRate} defaultvalue={5} />
          <button
            className="btn-add"
            onClick={() =>
              addWatched({
                imdbID: movie.imdbID,
                Title: movie.Title,
                Year: movie.Year,
                Poster: movie.Poster,
                runtime:
                  movie.Runtime.substr(0, 3) != "N/A"
                    ? Number(movie.Runtime.substr(0, 3))
                    : 0,
                imdbRating: movie.imdbRating,
                userRating: userRate,
              })
            }
          >
            {IsExist(movie.imdbID)
              ? "Edit Watched movie"
              : "Add To Watched List"}
          </button>
        </div>
        <p>{movie.Plot}</p>
        <h5>Directed By {movie.Director}</h5>
      </section>
    </div>
  );
}
//MovieList Component ==> Include Movie Component
//BoxMovie Component ==> Include MovieList Component
function SummeryMovie({ watched }) {
  const avgImdbRating = Math.round(
    average(watched.map((movie) => movie.imdbRating))
  );
  const avgUserRating = Math.round(
    average(watched.map((movie) => movie.userRating))
  );
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovieList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovieItem key={movie.imdbID} movie={movie} />
      ))}
    </ul>
  );
}
function WatchedMovieItem({ movie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
