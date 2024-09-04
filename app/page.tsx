"use client";
import { CardBody, CardContainer, CardItem } from "@/components/3d-card";
import { Input } from "@/components/input";
import { SparklesCore } from "@/components/sparkles";
import { cn } from "@/utils/cn";
import { Label } from "@radix-ui/react-label";
import { IconBrandGithub, IconBrandGoogle, IconBrandOnlyfans } from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from "@/components/footer";

interface Movie {
  Title: string;
  Year: string;
  Plot: string;
  Actors: string;
  Runtime: string;
  Director: string;
  Released: string;
  Poster: string;
  Writer: string;
  Language: string;
  Genre: string
}

type MovieSuggestion = {
  Title: string;
  Year: string;
  imdbID: string;
};


export default function Home() {

  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);

  const [movieName, setMovieName] = useState<string>('');
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [debouncedMovieName, setDebouncedMovieName] = useState(movieName);
  const [suggestions, setSuggestions] = useState<MovieSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Debounce movie name input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedMovieName(movieName);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [movieName]);

  // Fetch movie suggestions based on debounced input
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedMovieName.length > 2) {
        setSuggestionsLoading(true);
        try {
          const ApiKey = process.env.NEXT_PUBLIC_API_KEY;
          const response = await fetch(`https://www.omdbapi.com/?s=${debouncedMovieName}&apikey=${ApiKey}`);
          const data = await response.json();

          if (data.Search) {
            setSuggestions(data.Search);
          } else {
            setSuggestions([]);
          }
        } catch (error) {
          toast.error('Error fetching suggestions.');
        } finally {
          setSuggestionsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [debouncedMovieName]);

  // Handle input field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMovieName(e.target.value);
    setShowSuggestions(true);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (Title: string) => {
    setMovieName(Title);
    setShowSuggestions(false);
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (!movieName.trim()) {
      toast.error('Please enter a movie name.', {
        position: 'top-right',
        autoClose: 3000,
        style: {
          backgroundColor: 'black',
          color: 'white',
        },
      });
      setLoading(false);
      return;
    }

    try {
      const ApiKey = process.env.NEXT_PUBLIC_API_KEY;
      const response = await fetch(`https://www.omdbapi.com/?t=${movieName}&apikey=${ApiKey}`);
      const data = await response.json();

      if (data.Response === 'False') {
        toast.error(data.Error, {
          position: 'top-right',
          autoClose: 3000,
          style: {
            backgroundColor: 'black',
            color: 'white',
          },
        });
        setMovie(null);
        setShowResult(false);
      } else {
        setMovie(data);
        setShowResult(true);
      }
    } catch (error) {
      toast.error('An error occurred while fetching the movie.', {
        position: 'top-right',
        autoClose: 3000,
        style: {
          backgroundColor: 'black',
          color: 'white',
        },
      });
      setShowResult(false);
    } finally {
      setLoading(false);
    }
  };

  // Convert minutes to hours and minutes format
  const convertMinutesToHours = (timeString: any) => {
    const totalMinutes = parseInt(timeString.replace(' min', ''), 10);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  useEffect(() => {
    if (suggestions.length > 0 && suggestionsRef.current) {
      suggestionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [suggestions]);

  return (
    <>
      <div className="h-screen relative w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
        <div className="w-full absolute inset-0 h-screen">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>
        <ToastContainer />

        {showResult ? (<>

          <CardContainer className="inter-var">
            <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
              <CardItem
                translateZ="50"
                className="text-xl font-bold text-neutral-600 dark:text-white"
              >
                {movie?.Title}
                <p className="text-xs font-thin">{convertMinutesToHours(movie?.Runtime)} | {movie?.Released}</p>
              </CardItem>
              <CardItem
                as="p"
                translateZ="60"
                className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
              >
                Plot - {movie?.Plot}
              </CardItem>
              <CardItem translateZ="100" className="w-full mt-4">
                <img
                  src={movie?.Poster}
                  className="h-60 w-auto object-cover rounded-xl group-hover/card:shadow-xl" style={{ margin: "0 auto" }}
                />
              </CardItem>
              <div className="flex justify-center items-start flex-col gap-2 mt-2">
                <p>Actors - {movie?.Actors}</p>
                <p>Director - {movie?.Director} | {movie?.Language}</p>
                <p>Genre - {movie?.Genre}</p>
                <p>Writer - {movie?.Writer}</p>
              </div>
              <div className="flex justify-between items-center mt-10">
                <CardItem
                  translateZ={20}
                  as={Link}
                  href="https://twitter.com/nagendra_s_y"
                  target="__blank"
                  className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
                >
                  Message me on X →
                </CardItem>
                <CardItem
                  translateZ={20}
                  as="button"
                  className="px-4 py-2 rounded bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
                >
                  <button onClick={() => setShowResult(false)}>
                    Back
                  </button>
                </CardItem>
              </div>
            </CardBody>
          </CardContainer>

        </>) : (<>
          <div className="z-10">
            <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
              <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
                Welcome to My Movie Application
              </h2>
              <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
                You can search any movie here, i will provide details related to that movie.
              </p>

              <form className="my-8" onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4 relative">
                  <LabelInputContainer>
                    <Label htmlFor="firstname">Movie name</Label>
                    <Input
                      id="firstname"
                      placeholder="Type here.."
                      type="text"
                      value={movieName}
                      onChange={handleInputChange}
                      onFocus={() => inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                      ref={inputRef}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="p-2 mt-2 absolute z-10 bg-slate-400 rounded overflow-y-auto top-36 list-none custom-scrollbar" style={{ maxHeight: "300px", width: "385px" }} ref={suggestionsRef}>
                        {suggestionsLoading && (<>
                          <p>loading..</p>
                        </>)}

                        {suggestions.map((movie) => (
                          <li key={movie.imdbID} className="p-1 rounded-sm hover:bg-slate-200 hover:text-black" style={{ cursor: 'pointer' }} onClick={() => handleSuggestionClick(movie.Title)}>
                            {movie.Title} ({movie.Year})
                          </li>
                        ))}
                      </ul>
                    )}
                  </LabelInputContainer>
                </div>

                <button
                  className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Search'}
                  <BottomGradient />
                </button>
                <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
              </form>
            </div>
          </div>
        </>)}
      </div>
      <Footer />
    </>
  );
}


const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
