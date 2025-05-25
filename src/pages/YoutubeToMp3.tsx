import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  SelectChangeEvent,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip
} from '@mui/material';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import YouTubeIcon from '@mui/icons-material/YouTube';
import axios from 'axios';

interface AudioFormat {
  url: string;
  quality: string;
  mimeType: string;
  audioBitrate?: number;
  audioQuality?: string;
  audioSampleRate?: string;
}

interface AudioInfo {
  title: string;
  thumbnail: string;
  formats: AudioFormat[];
}

const YoutubeToMp3: React.FC = () => {
  const [url, setUrl] = useState('');
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Proxy server URL
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:3001/api';
  
  const PROXY_URL = `${API_BASE_URL}/download-youtube`;

  const handleURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    // Reset states when URL changes
    setAudioInfo(null);
    setSelectedFormat('');
    setError(null);
  };

  const handleFormatChange = (e: SelectChangeEvent) => {
    setSelectedFormat(e.target.value);
  };

  // YouTube URL'sinden video ID'sini çıkaran yardımcı fonksiyon
  const extractVideoId = (url: string): string | null => {
    // Normal video URL'leri için
    let match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (match && match[1]) return match[1];

    // Shorts URL'leri için
    match = url.match(/(?:youtube\.com\/shorts\/)([^"&?\/\s]{11})/);
    if (match && match[1]) return match[1];

    return null;
  };

  const handleGetAudioInfo = async () => {
    if (!url) {
      setError('Lütfen bir YouTube URL adresi girin');
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Geçersiz YouTube URL formatı. Lütfen doğru bir YouTube video veya shorts URL girin.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // YouTube video bilgilerini doğrudan sunucudan al
      const response = await axios.get(`${API_BASE_URL}/youtube-info`, { 
        params: { 
          url: videoId.length === 11 ? `https://www.youtube.com/watch?v=${videoId}` : url,
          format: 'audio'
        }
      });
      
      // API yanıtını konsola yazdır
      console.log('API yanıtı:', response.data);

      if (!response.data || !response.data.formats) {
        throw new Error('API yanıtı geçersiz format içeriyor');
      }

      // İndirilebilir ses formatlarını al
      const audioFormats: AudioFormat[] = [];
      
      // formats listesindeki ses formatlarını al
      if (response.data.formats && Array.isArray(response.data.formats)) {
        response.data.formats.forEach((format: any) => {
          if (format && format.url && format.mimeType && 
              (format.mimeType.includes('audio') || 
              (format.mimeType.includes('mp4') && format.audioQuality))) {
            audioFormats.push({
              url: format.url,
              quality: format.audioQuality || `${Math.round((format.audioBitrate || 128000)/1000)}kbps`,
              mimeType: format.mimeType,
              audioBitrate: format.audioBitrate,
              audioQuality: format.audioQuality,
              audioSampleRate: format.audioSampleRate
            });
          }
        });
      }

      if (audioFormats.length === 0) {
        throw new Error('İndirilebilir ses formatı bulunamadı');
      }

      // Bitrate'e göre sırala (yüksekten düşüğe)
      audioFormats.sort((a, b) => {
        const aBitrate = a.audioBitrate || 0;
        const bBitrate = b.audioBitrate || 0;
        return bBitrate - aBitrate;
      });

      // Tekrarlanan format URL'lerini çıkar
      const uniqueFormats = audioFormats.filter((format, index, self) =>
        index === self.findIndex((f) => f.url === format.url)
      );

      setAudioInfo({
        title: response.data.title || 'YouTube Video',
        thumbnail: response.data.thumbnail || '',
        formats: uniqueFormats
      });

      setLoading(false);
    } catch (err) {
      console.error('Video bilgileri alınırken hata:', err);
      setError('Ses bilgileri alınırken bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  const handleDownload = async (audioUrl: string, quality: string, title: string) => {
    try {
      // Yükleniyor mesajı göster
      setSnackbarMessage('Ses dosyası indiriliyor, lütfen bekleyin...');
      setSnackbarOpen(true);
      
      // Filename oluştur
      const filename = `${title.replace(/[^\w\s]/gi, '')}-${quality}`;
      
      // YouTube video URL'sini kontrol et
      const isYoutubeUrl = url.includes('youtube.com') || url.includes('youtu.be');
      const downloadUrl = isYoutubeUrl
        ? `${PROXY_URL}?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}&format=audio`
        : `${PROXY_URL}?url=${encodeURIComponent(audioUrl)}&filename=${encodeURIComponent(filename)}&format=audio`;
      
      // Yeni sekmede aç (indirme başlayacak)
      window.open(downloadUrl, '_blank');
      
      setSnackbarMessage('İndirme başlatıldı!');
    } catch (error) {
      console.error('İndirme hatası:', error);
      setSnackbarMessage('Ses dosyası indirme başlatılamadı. Lütfen tekrar deneyin.');
      setSnackbarOpen(true);
    }
  };

  const handleCopyUrl = (urlToCopy: string) => {
    // URL'yi hiç değiştirmeden tam olarak kopyala
    navigator.clipboard.writeText(urlToCopy)
      .then(() => {
        setSnackbarMessage('Ses dosyası bağlantısı panoya kopyalandı. Tarayıcıda açarak indirebilirsiniz.');
        setSnackbarOpen(true);
      })
      .catch(err => {
        console.error('URL kopyalama hatası:', err);
        setSnackbarMessage('URL kopyalanamadı. Lütfen manuel olarak kopyalayın.');
        setSnackbarOpen(true);
      });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const formatBitrate = (bitrate?: number): string => {
    if (!bitrate) return '';
    return `${Math.round(bitrate/1000)}kbps`;
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" align="center" gutterBottom color="primary">
        YouTube MP3 Dönüştürücü
      </Typography>
      
      <Typography variant="body1" align="center" paragraph sx={{ mb: 4 }}>
        YouTube videolarını yüksek kaliteli MP3 formatına dönüştürün.
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2 }}>
          <YouTubeIcon sx={{ color: 'red', mr: 1, my: 0.5 }} />
          <TextField
            fullWidth
            label="YouTube Video URL"
            variant="outlined"
            value={url}
            onChange={handleURLChange}
            placeholder="https://www.youtube.com/watch?v=... veya https://youtube.com/shorts/..."
            error={!!error}
            helperText={error}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleGetAudioInfo}
            disabled={loading || !url}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'İşleniyor...' : 'Video Bilgilerini Getir'}
          </Button>
        </Box>
      </Paper>

      {audioInfo && (
        <Card sx={{ mb: 4 }}>
          <CardMedia
            component="img"
            height="360"
            image={audioInfo.thumbnail}
            alt={audioInfo.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://via.placeholder.com/480x360?text=Video+Thumbnail';
            }}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {audioInfo.title}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Mevcut Ses Kaliteleri:</Typography>
              
              {audioInfo.formats.map((format, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 1,
                    p: 2,
                    border: '1px solid #eee',
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: '#f9f9f9'
                    }
                  }}
                >
                  <Typography>
                    {format.quality} {format.audioBitrate ? `(${formatBitrate(format.audioBitrate)})` : ''}
                  </Typography>
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleDownload(format.url, format.quality, audioInfo.title)}
                      endIcon={
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                          <path d="M480-313 287-506l43-43 120 120v-371h60v371l120-120 43 43-193 193ZM220-160q-24 0-42-18t-18-42v-143h60v143h520v-143h60v143q0 24-18 42t-42 18H220Z"/>
                        </svg>
                      }
                    >
                      İndir
                    </Button>
                  </Box>
                </Box>
              ))}
              
              <Alert severity="info" sx={{ mt: 2 }}>
                MP3 indirmek için kalite seçeneğinin yanındaki indirme butonuna tıklayın.
              </Alert>
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mt: 6 }}>
        <Typography variant="h6" gutterBottom>
          Nasıl Kullanılır?
        </Typography>
        <ol>
          <li>
            <Typography paragraph>
              YouTube video veya shorts sayfasından video URL'sini kopyalayın
            </Typography>
          </li>
          <li>
            <Typography paragraph>
              URL'yi yukarıdaki giriş kutusuna yapıştırın
            </Typography>
          </li>
          <li>
            <Typography paragraph>
              "Video Bilgilerini Getir" butonuna tıklayın
            </Typography>
          </li>
          <li>
            <Typography paragraph>
              İndirmek istediğiniz ses kalitesinin yanındaki kopyala butonuna tıklayın
            </Typography>
          </li>
          <li>
            <Typography paragraph>
              Kopyalanan bağlantıyı yeni bir tarayıcı sekmesinde açarak MP3 indirme işlemini başlatın
            </Typography>
          </li>
        </ol>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default YoutubeToMp3; 