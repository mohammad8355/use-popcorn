import logo from "./logo.svg";
import { useEffect, useState } from "react";
import "./index.css";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];
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
      console.log("edit watched");
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
      console.log("added new watched");
      setWatched(watched);
      alert("successfully added new watched");
    }
  }
  function IsExist(imdbID) {
    return (
      watched.filter((watchedItem) => watchedItem.imdbID === imdbID).length != 0
    );
  }
  useEffect(
    function () {
      async function fetchdata() {
        try {
          setError("");
          setIsLoading(true);
          const apiUrl = url + "&S=" + query;
          const res = await fetch(apiUrl);
          // console.log(apiUrl);
          if (!res.ok) {
            throw new Error("Some thing went wrong to fetching data");
          }
          const data = await res.json();
          if (data.Response === "False") throw new Error("movie not found");
          setMovies(data.Search);
          console.log(data.Search);
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
function MovieDetail({ movie, setId, setSelectedMovie, addWatched, IsExist }) {
  const [userRate, setUseRate] = useState(0);
  function handleBack() {
    setId(null);
    setSelectedMovie(null);
  }
  useEffect(function () {
    document.title = "MOVIE:" + movie.Title;
    return function () {
      document.title = "POPCORN";
    };
  }, []);
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
//WatchedMovieList ==> Include WatchedMovieItem Component
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
//WatchedMovieComponent ==> Include SummeryMovie Component - WatchedMovieList Component
//Main Component Include  ==> BoxMovie - WatchedMovie Component
