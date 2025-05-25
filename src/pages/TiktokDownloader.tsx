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
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import MusicVideoIcon from '@mui/icons-material/MusicVideo';
import axios from 'axios';

interface TikTokFormat {
  type: string;
  quality: string;
  url: string;
  label: string;
}

interface TikTokInfo {
  title: string;
  author: string;
  thumbnail: string;
  formats: TikTokFormat[];
}

const TiktokDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [tikTokInfo, setTikTokInfo] = useState<TikTokInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // API URL'leri
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:3001/api';
  
  const INFO_URL = `${API_BASE_URL}/tiktok-info`;
  const DOWNLOAD_URL = `${API_BASE_URL}/download-tiktok`;

  // URL değiştiğinde state'i güncelle
  const handleURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    setTikTokInfo(null);
    setError(null);
  };

  // TikTok video bilgilerini getir
  const handleGetVideoInfo = async () => {
    if (!url) {
      setError('Lütfen bir TikTok URL adresi girin');
      return;
    }

    // TikTok URL formatını kontrol et
    if (!url.includes('tiktok.com')) {
      setError('Geçersiz TikTok URL formatı. Lütfen doğru bir TikTok URL adresi girin.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TikTok video bilgilerini al
      const response = await axios.get(INFO_URL, { 
        params: { url }
      });

      if (!response.data || !response.data.formats || response.data.formats.length === 0) {
        throw new Error('Video bilgileri alınamadı veya geçersiz format');
      }

      setTikTokInfo(response.data);
      setLoading(false);
    } catch (err) {
      console.error('TikTok bilgileri alınırken hata:', err);
      setError('Video bilgileri alınamadı. Lütfen geçerli bir TikTok linki girdiğinizden emin olun.');
      setLoading(false);
    }
  };

  // İndirme işlemi
  const handleDownload = (videoUrl: string, label: string) => {
    try {
      // Yükleniyor mesajı göster
      setSnackbarMessage('TikTok içeriği indiriliyor, lütfen bekleyin...');
      setSnackbarOpen(true);
      
      // Filename oluştur
      const filename = tikTokInfo?.title 
        ? `tiktok-${tikTokInfo.title.replace(/[^\w\s]/gi, '')}-${label}` 
        : `tiktok-${label}`;
      
      // İndirme URL'sini oluştur
      const downloadUrl = `${DOWNLOAD_URL}?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(filename)}`;
      
      // Yeni sekmede aç (indirme başlayacak)
      window.open(downloadUrl, '_blank');
      
      setSnackbarMessage('İndirme başlatıldı!');
    } catch (error) {
      console.error('İndirme hatası:', error);
      setSnackbarMessage('İndirme başlatılamadı. Lütfen tekrar deneyin.');
      setSnackbarOpen(true);
    }
  };

  // Snackbar kapat
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" align="center" gutterBottom color="primary">
        TikTok Video İndirici
      </Typography>
      
      <Typography variant="body1" align="center" paragraph sx={{ mb: 4 }}>
        TikTok videolarını ve müziklerini filigransız indirin.
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2 }}>
          <MusicVideoIcon sx={{ color: '#00f2ea', mr: 1, my: 0.5 }} />
          <TextField
            fullWidth
            label="TikTok Video URL"
            variant="outlined"
            value={url}
            onChange={handleURLChange}
            placeholder="https://www.tiktok.com/@username/video/1234567890123456789"
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

      {tikTokInfo && (
        <Card sx={{ mb: 4 }}>
          <CardMedia
            component="img"
            height="360"
            image={tikTokInfo.thumbnail}
            alt={tikTokInfo.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'https://via.placeholder.com/480x360?text=TikTok+Thumbnail';
            }}
            sx={{ objectFit: 'contain', bgcolor: '#000' }}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {tikTokInfo.title || 'TikTok Video'}
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom color="text.secondary">
              @{tikTokInfo.author}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>İndirme Seçenekleri:</Typography>
              
              {tikTokInfo.formats.map((format, index) => (
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
                    {format.label}
                  </Typography>
                  <Box>
                    <Button
                      variant="contained"
                      color={format.type === 'audio' ? 'secondary' : 'primary'}
                      size="small"
                      onClick={() => handleDownload(format.url, format.label)}
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
                İndirmek istediğiniz formatın yanındaki indirme butonuna tıklayın.
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
              TikTok uygulamasından veya web sitesinden video URL'sini kopyalayın
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
              İndirmek istediğiniz formatın yanındaki indirme butonuna tıklayın
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

export default TiktokDownloader; 