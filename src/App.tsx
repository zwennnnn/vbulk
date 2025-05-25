import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './theme/theme';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import YoutubeDownloader from './pages/YoutubeDownloader';
import YoutubeToMp3 from './pages/YoutubeToMp3';
import InstagramDownloader from './pages/InstagramDownloader';
import TiktokDownloader from './pages/TiktokDownloader';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/youtube-downloader" element={<YoutubeDownloader />} />
          <Route path="/youtube-to-mp3" element={<YoutubeToMp3 />} />
          <Route path="/instagram-downloader" element={<InstagramDownloader />} />
          <Route path="/tiktok-downloader" element={<TiktokDownloader />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
