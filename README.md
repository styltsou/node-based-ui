Desktop UI Experiment

A personal website experiment where I wanted to see if I could build a UI that acts like a desktop operating system (loosely inspired by PostHog's interface). It's not completely finished, but the basic window management and a few apps are working.
What's in here
Window Management

   - Windows can be minimized, split, and resized.
   - Works sort of like a basic desktop environment in the browser.

The Music Player

Instead of just hardcoding a playlist, this app tries to automate it:
    - Grabs my top recent tracks from the Spotify API.
    - Searches YouTube for each song and pulls the top 5 results.
    - Runs the titles through a basic keyword heuristic to filter out things like live versions, covers, or reaction videos to find the actual song.
    - Keeps the top 10 best matches and plays them through a hidden YouTube embed controlled via the player API.

Piano App: A basic virtual piano. Uses the Web MIDI API, you can play it through the site.

Snake: Just the classic snake game running inside one of the windows.

How the music filtering works

It's a pretty simple pipeline to keep the playlist clean without manual updating:

``
[Spotify API] -> Gets my recent tracks
       │
       ▼
[YouTube Search] -> Grabs top 5 results per song
       │
       ▼
[Keyword Heuristic] -> Filters out "live", "cover", "reaction", etc.
       │
       ▼
[Hidden YT Embed] -> Plays the top 10 cleaned results
``
