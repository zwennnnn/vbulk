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
import YouTubeIcon from '@mui/icons-material/YouTube';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios';

interface VideoFormat {
  url: string;
  quality: string;
  mimeType: string;
  height?: number;
  width?: number;
  qualityLabel?: string;
}

interface VideoInfo {
  title: string;
  thumbnail: string;
  formats: VideoFormat[];
}

const YoutubeDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
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
    setVideoInfo(null);
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

  const handleGetVideoInfo = async () => {
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
          url: videoId.length === 11 ? `https://www.youtube.com/watch?v=${videoId}` : url 
        }
      });
      
      // API yanıtını konsola yazdır
      console.log('API yanıtı:', response.data);

      if (!response.data || !response.data.formats) {
        throw new Error('API yanıtı geçersiz format içeriyor');
      }

      // İndirilebilir video formatlarını al
      const videoFormats: VideoFormat[] = [];
      
      // formats listesindeki video formatlarını al
      if (response.data.formats && Array.isArray(response.data.formats)) {
        response.data.formats.forEach((format: any) => {
          if (format && format.url && format.mimeType && format.mimeType.includes('video')) {
            videoFormats.push({
              url: format.url,
              quality: format.qualityLabel || format.quality || 'Bilinmeyen kalite',
              mimeType: format.mimeType,
              height: format.height,
              width: format.width,
              qualityLabel: format.qualityLabel
            });
          }
        });
      }
      
      if (videoFormats.length === 0) {
        throw new Error('İndirilebilir video formatı bulunamadı');
      }

      // Kalitelere göre sırala (yüksekten düşüğe)
      videoFormats.sort((a, b) => {
        const aHeight = a.height || 0;
        const bHeight = b.height || 0;
        return bHeight - aHeight;
      });

      setVideoInfo({
        title: response.data.title || 'YouTube Video',
        thumbnail: response.data.thumbnail || '',
        formats: videoFormats
      });

      setLoading(false);
    } catch (err) {
      console.error('Video bilgileri alınırken hata:', err);
      setError('Video bilgileri alınırken bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  const handleDownload = async (videoUrl: string, quality: string, title: string) => {
    try {
      // Yükleniyor mesajı göster
      setSnackbarMessage('Video indiriliyor, lütfen bekleyin...');
      setSnackbarOpen(true);
      
      // Filename oluştur
      const filename = `${title.replace(/[^\w\s]/gi, '')}-${quality}`;
      
      // YouTube video URL'sini kontrol et
      const isYoutubeUrl = url.includes('youtube.com') || url.includes('youtu.be');
      const downloadUrl = isYoutubeUrl
        ? `${PROXY_URL}?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}&format=video`
        : `${PROXY_URL}?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(filename)}&format=video`;
      
      // Yeni sekmede aç (indirme başlayacak)
      window.open(downloadUrl, '_blank');
      
      setSnackbarMessage('İndirme başlatıldı!');
    } catch (error) {
      console.error('İndirme hatası:', error);
      setSnackbarMessage('Video indirme başlatılamadı. Lütfen tekrar deneyin.');
      setSnackbarOpen(true);
    }
  };

  const handleCopyUrl = (urlToCopy: string) => {
    // URL'yi hiç değiştirmeden tam olarak kopyala
    navigator.clipboard.writeText(urlToCopy)
      .then(() => {
        setSnackbarMessage('Video bağlantısı panoya kopyalandı. Tarayıcıda açarak indirebilirsiniz.');
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

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" align="center" gutterBottom color="primary">
        YouTube Video İndirici
      </Typography>
      
      <Typography variant="body1" align="center" paragraph sx={{ mb: 4 }}>
        YouTube videolarını HD kalitede indirmek için video URL'sini yapıştırın.
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
            onClick={handleGetVideoInfo}
            disabled={loading || !url}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'İşleniyor...' : 'Video Bilgilerini Getir'}
          </Button>
        </Box>
      </Paper>

      {videoInfo && (
        <Card sx={{ mb: 4 }}>
          <CardMedia
            component="img"
            height="360"
            image={videoInfo.thumbnail}
            alt={videoInfo.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://via.placeholder.com/480x360?text=Video+Thumbnail';
            }}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {videoInfo.title}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Mevcut Video Kaliteleri:</Typography>
              
              {videoInfo.formats.map((format, index) => (
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
                    {format.quality} {format.height && format.width ? `(${format.width}x${format.height})` : ''}
                  </Typography>
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleDownload(format.url, format.quality, videoInfo.title)}
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
                Video indirmek için kalite seçeneğinin yanındaki indirme butonuna tıklayın.
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
              İndirmek istediğiniz video kalitesinin yanındaki kopyala butonuna tıklayın
            </Typography>
          </li>
          <li>
            <Typography paragraph>
              Kopyalanan bağlantıyı yeni bir tarayıcı sekmesinde açarak indirme işlemini başlatın
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

export default YoutubeDownloader; 