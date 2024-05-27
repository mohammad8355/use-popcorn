import logo from "./logo.svg";
import { useEffect, useRef, useState } from "react";
import "./index.css";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const url = "http://www.omdbapi.com/?apikey=a42e75d0";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [watched, setWatched] = useLocalStorageState([], "watched");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedID] = useState(null);
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
      setWatched((watched) => [...watched, newwatched]);
      alert("successfully added new watched");
    }
  }
  function IsExist(imdbID) {
    return (
      watched.filter((watchedItem) => watchedItem.imdbID === imdbID).length != 0
    );
  }
  function DeleteWatchedHandle(imdbID) {
    if (window.confirm("do you agree to delete this watched movie")) {
      setWatched((watched) =>
        watched.filter((watchedItem) => watchedItem.imdbID != imdbID)
      );
    }
  }
  const { movies, isLoading, error } = useMovies(query, url);
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
          {selectedId && !error && !isLoading && (
            <MovieDetail
              setId={setSelectedID}
              selectedId={selectedId}
              addWatched={AddWatchedHandle}
              IsExist={IsExist}
            ></MovieDetail>
          )}
          {!selectedId && !error && !isLoading && (
            <>
              <SummeryMovie watched={watched} />
              <WatchedMovieList
                deleteWatched={DeleteWatchedHandle}
                watched={watched}
              />
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
  const InputEl = useRef(null);
  useKey("Enter", function () {
    if (document.activeElement === InputEl.current) return;
    InputEl.current.focus();
    setQuery("");
  });
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={InputEl}
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
function MovieDetail({ setId, addWatched, IsExist, selectedId }) {
  const [userRate, setUseRate] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
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
  useEffect(
    function () {
      document.title = selectedMovie
        ? "MOVIE:" + selectedMovie.Title
        : "POPCORN";
      return function () {
        document.title = "POPCORN";
      };
    },
    [selectedMovie]
  );
  function handleBack() {
    setId(null);
    setSelectedMovie(null);
  }
  useKey("Escape", handleBack);
  // console.log(isNAN(Number(movie.Runtime.substr(0, 3))));
  return (
    <div className=" details">
      <button className="btn-back" onClick={handleBack}>
        {" "}
        ✖{" "}
      </button>
      <header>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : selectedMovie ? (
          <>
            {" "}
            <img src={selectedMovie.Poster} alt={selectedMovie.Title} />
            <div className="details-overview">
              <h2>{selectedMovie.Title}</h2>
              <p>
                {selectedMovie.Released} 📆 - {selectedMovie.Runtime}
              </p>
              <p>{selectedMovie.Genre}</p>
              <p>imDb Rates :{selectedMovie.imdbRating} 🌟</p>
            </div>
          </>
        ) : (
          "no data"
        )}
      </header>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : selectedMovie ? (
        <section>
          <div className="rating">
            <StarRating gap={0.1} onSetRating={setUseRate} defaultvalue={5} />
            <button
              className="btn-add"
              onClick={() =>
                addWatched({
                  imdbID: selectedMovie.imdbID,
                  Title: selectedMovie.Title,
                  Year: selectedMovie.Year,
                  Poster: selectedMovie.Poster,
                  runtime:
                    selectedMovie.Runtime.substr(0, 3) != "N/A"
                      ? Number(selectedMovie.Runtime.substr(0, 3))
                      : 0,
                  imdbRating: selectedMovie.imdbRating,
                  userRating: userRate,
                })
              }
            >
              {IsExist(selectedMovie.imdbID)
                ? "Edit Watched movie"
                : "Add To Watched List"}
            </button>
          </div>
          <p>{selectedMovie.Plot}</p>
          <h5>Directed By {selectedMovie.Director}</h5>
        </section>
      ) : (
        "n data"
      )}
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
function WatchedMovieList({ watched, deleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovieItem
          onChange={deleteWatched}
          key={movie.imdbID}
          movie={movie}
        />
      ))}
    </ul>
  );
}
function WatchedMovieItem({ movie, onChange }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <button
        style={{
          position: "absolute",
          top: "0",
          right: "0",
          padding: ".5em",
          border: "none",
          borderRadius: "50%",
          backgroundColor: "#fff",
        }}
        onClick={() => onChange(movie.imdbID)}
      >
        ❌
      </button>
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
