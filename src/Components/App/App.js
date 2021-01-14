import React, { useState } from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar.js';
import SearchResults from '../SearchResults/SearchResults.js';
import Playlist from '../Playlist/Playlist.js';
import Spotify from '../../util/Spotify.js';


function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [playlistName, setPlaylistName] = useState('New Playlist');
  const [playlistId, setPlaylistId] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [msgVisibility, setMsgVisibility] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageColor, setMessageColor] = useState('');
  // Track whether button is HIDE or GET PLAYLISTS.
  const [getButton, setGetButton] = useState(true);
  const [editMode, setEditMode] = useState(false);

  function search(term) {
    Spotify.search(term).then(searchResults => {
      setSearchResults([...searchResults]);
    });
  }

  function addTrack(track) {
    // If the track is already on the playlist, do not save.
    if (playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    } else {
      playlistTracks.push(track);
      setPlaylistTracks([...playlistTracks]);
      // Remove track from searchResults after adding it to playlistTracks.
      const index = searchResults.indexOf(track);
      searchResults.splice(index, 1);
      setSearchResults([...searchResults]);
    }
    if (editMode) {
      Spotify.addTrack(track.uri, playlistId).then(() => {
        activateMsg('Track added!', '#228B22');
      });
    }
  }

  function removeTrack(track) {
    const index = playlistTracks.indexOf(track);
    playlistTracks.splice(index, 1);
    setPlaylistTracks([...playlistTracks]);
    // Add track back to searchResults if removing from playlistTracks.
    searchResults.unshift(track);
    setSearchResults([...searchResults]);
    if (editMode) {
      Spotify.deleteTrack(track.uri, playlistId).then(() => {
        activateMsg('Track removed!', '#FF0000');
      });
    }
  }

  function savePlaylist() {
    const trackURIs = playlistTracks.map(track => track.uri);
    if (!trackURIs.length) {
      return activateMsg('Tracks required.', '#FF0000');
    }
    if (!playlistName) {
      return activateMsg('Playlist name required.', '#FF0000');
    }
    if (!editMode) {
      Spotify.savePlaylist(playlistName, trackURIs).then(() => {
        activateMsg('Playlist saved!', '#228B22');
        setPlaylistName('New Playlist');
        setPlaylistTracks([]);
      });
    }
    if (editMode) {
      Spotify.renamePlaylist(playlistName, playlistId).then(() => {
        activateMsg('Playlist renamed!', '#228B22');
        setPlaylistName('New Playlist');
        setPlaylistTracks([]);
      });
      setEditMode(false);
    }
    // Update list of playlists if already open after saving.
    if (playlists.length) {
      setTimeout(() => getPlaylists(), 1500);
    }
  }

  async function getPlaylist(playlistId) {
    const name = await Spotify.getPlaylistName(playlistId);
    const tracks = await Spotify.getPlaylistTracks(playlistId);
    setPlaylistName(name);
    setPlaylistId(playlistId);
    setPlaylistTracks(tracks);
    setEditMode(true);
  }

  async function getPlaylists() {
    activateMsg('Retrieving playlists...', '#FF8C00');
    const allPlaylists = await Spotify.getPlaylists();
    setPlaylists(allPlaylists);
    setTimeout(() => activateMsg('Playlists retrieved.', '#228B22'), 400);
  }

  function deletePlaylist(id) {
    Spotify.deletePlaylist(id);
    activateMsg('Playlist deleted.', '#FF0000');
    setTimeout(() => getPlaylists(), 800);
  }

  function activateMsg(text, color) {
    setMessageText(text);
    setMessageColor(color);
    // Activates the msgVisibility prop for 3 seconds.
    setMsgVisibility(true);
    setTimeout(() => {setMsgVisibility(false)}, 3000);
  }

  function toggleButton() {
    setGetButton(!getButton);
    if (getButton) {
      getPlaylists();
    } else {
      setPlaylists([]);
    }
  }

  function getToken() {
    // Generate access token before running search to prevent page reset on initial search.
    Spotify.getAccessToken();
  }

  return (
    <div>
      <h1>Ja<span className="highlight">mmm</span>ing</h1>
      <div className="App">
        <SearchBar onSearch={search} token={getToken} />
        <a href="#Temp-user"><button className="Temp-access-button">Get temporary access details</button></a>
        <div className="App-playlist">
          <SearchResults searchResults={searchResults} onAdd={addTrack} />
          <Playlist playlistTracks={playlistTracks} playlistName={playlistName} onRemove={removeTrack} onNameChange={setPlaylistName} onSave={savePlaylist} onGet={toggleButton} playlists={playlists} msgVisibility={msgVisibility} msgText={messageText} msgColor={messageColor} getButton={getButton} get={getPlaylist} delete={deletePlaylist} />
        </div>
        <div id="Temp-user"></div>
      </div>
    </div>
  );
}


export default App;
