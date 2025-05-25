import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  Divider
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import DownloadIcon from '@mui/icons-material/Download';
import InstagramIcon from '@mui/icons-material/Instagram';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

interface InstagramUserID {
  user_id: string;
  username: string;
}

interface InstagramPost {
  id: string;
  caption?: string;
  media_url: string;
  media_type: string;
  thumbnail_url?: string;
  permalink: string;
  carousel_media?: {
    media_url: string;
    media_type: string;
    thumbnail_url?: string;
  }[];
  is_carousel: boolean;
}

interface InstagramProfileInfo {
  pk: number;
  username: string;
  full_name: string;
  is_private: boolean;
  profile_pic_url: string;
  is_verified: boolean;
  media_count: number;
  follower_count: number;
  following_count: number;
  biography?: string;
  external_url?: string;
  posts?: InstagramPost[];
}

const InstagramDownloader: React.FC = () => {
  const [username, setUsername] = useState('');
  const [userID, setUserID] = useState<InstagramUserID | null>(null);
  const [profileInfo, setProfileInfo] = useState<InstagramProfileInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [selectedCarouselTab, setSelectedCarouselTab] = useState<{[key: string]: number}>({});

  const RAPID_API_KEY = 'KEY GIRINIZ';
  const RAPID_API_HOST = 'instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com';
  
  // Proxy server URL'i - gerçek ortamda bu değişebilir
  const PROXY_URL = process.env.NODE_ENV === 'production' 
    ? '/api/proxy-image' 
    : 'http://localhost:3001/api/proxy-image';

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setUserID(null);
    setProfileInfo(null);
    setError(null);
  };

  // Kullanıcı ID'yi arka planda almak için yardımcı fonksiyon
  const fetchUserID = async (username: string): Promise<string | null> => {
    try {
      const options = {
        method: 'GET',
        url: 'https://instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com/user_id_by_username',
        params: { username },
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': RAPID_API_HOST
        }
      };

      const response = await axios.request(options);
      return response.data.UserID?.toString();
    } catch (err) {
      console.error('Kullanıcı ID alınırken hata:', err);
      return null;
    }
  };

  // Profil bilgilerini almak için fonksiyon
  const getProfileInfo = async () => {
    if (!username) {
      setError('Lütfen bir Instagram kullanıcı adı girin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Önce kullanıcı ID'sini arka planda al
      const userId = await fetchUserID(username);
      
      if (!userId) {
        setError('Kullanıcı ID bilgisi alınamadı. Hesap açık/public olmalıdır.');
        setLoading(false);
        return;
      }

      // ID'yi state'e kaydet ama gösterme
      setUserID({
        user_id: userId,
        username: username
      });

      // Profil bilgilerini al
      const profileOptions = {
        method: 'GET',
        url: 'https://instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com/profile_by_user_id',
        params: { user_id: userId },
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': RAPID_API_HOST
        }
      };

      const profileResponse = await axios.request(profileOptions);
      
      // Profil bilgilerinin varlığını kontrol et
      if (!profileResponse.data) {
        setError('Profil bilgileri alınamadı.');
        setLoading(false);
        return;
      }
      
      // Eksik değerler için varsayılan değerler ayarla
      const profileData = {
        ...profileResponse.data,
        media_count: profileResponse.data.media_count || 0,
        follower_count: profileResponse.data.follower_count || 0,
        following_count: profileResponse.data.following_count || 0,
        posts: [] // Başlangıçta boş post listesi
      };
      
      // Profil bilgilerini ayarla
      setProfileInfo(profileData);

      // Şimdi gönderileri getir
      await fetchUserPosts(userId);
      
      setLoading(false);
    } catch (err) {
      console.error('Profil bilgileri alınırken hata:', err);
      setError('Profil bilgileri alınırken bir hata oluştu. Hesap açık/public olmalıdır.');
      setLoading(false);
    }
  };

  // Kullanıcının gönderilerini getiren fonksiyon
  const fetchUserPosts = async (userId: string) => {
    setPostsLoading(true);
    
    try {
      // Gönderileri almak için doğru API endpointini kullan
      const options = {
        method: 'GET',
        url: 'https://instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com/posts_by_user_id',
        params: { user_id: userId },
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': RAPID_API_HOST
        }
      };
      
      const response = await axios.request(options);
      
      // API yanıtı ve gönderi kontrolü
      if (!response.data || !response.data.items || !Array.isArray(response.data.items) || response.data.items.length === 0) {
        console.log("Kullanıcının gönderisi bulunamadı veya özel hesap");
        setProfileInfo(prevInfo => {
          if (prevInfo) {
            return {
              ...prevInfo,
              posts: [] // Boş dizi ile güncelle
            };
          }
          return prevInfo;
        });
        setPostsLoading(false);
        return;
      }
      
      // Sadece ilk 12 gönderiyi al (veya daha az varsa tümünü)
      const limitedItems = response.data.items.slice(0, 12);
      
      // API'den gelen gönderi verilerini uygun formata dönüştür
      const formattedPosts: InstagramPost[] = limitedItems.map((post: any) => {
        // Media type: 1=resim, 2=video, 8=carousel
        const mediaType = post.media_type === 1 ? 'IMAGE' : 
                         post.media_type === 2 ? 'VIDEO' :
                         post.media_type === 8 ? 'CAROUSEL_ALBUM' : 'IMAGE';
        
        // Gönderi resmi veya videosu için URL
        let mediaUrl = '';
        let thumbnailUrl = '';
        let carouselMedia = [];
        let isCarousel = mediaType === 'CAROUSEL_ALBUM';
        
        // Resim URL'sini al
        if (post.image_versions2 && post.image_versions2.candidates && post.image_versions2.candidates.length > 0) {
          mediaUrl = post.image_versions2.candidates[0].url;
          thumbnailUrl = post.image_versions2.candidates[0].url;
        }
        
        // Video ise video URL'sini al
        if (mediaType === 'VIDEO' && post.video_versions && post.video_versions.length > 0) {
          mediaUrl = post.video_versions[0].url;
        }
        
        // Carousel ise tüm medyaları al
        if (isCarousel && post.carousel_media && post.carousel_media.length > 0) {
          carouselMedia = post.carousel_media.map((item: any) => {
            const itemMediaType = item.media_type === 1 ? 'IMAGE' : 
                                item.media_type === 2 ? 'VIDEO' : 'IMAGE';
            
            let itemMediaUrl = '';
            let itemThumbnailUrl = '';
            
            // Resim URL'sini al
            if (item.image_versions2 && item.image_versions2.candidates && item.image_versions2.candidates.length > 0) {
              itemMediaUrl = item.image_versions2.candidates[0].url;
              itemThumbnailUrl = item.image_versions2.candidates[0].url;
            }
            
            // Video ise video URL'sini al
            if (itemMediaType === 'VIDEO' && item.video_versions && item.video_versions.length > 0) {
              itemMediaUrl = item.video_versions[0].url;
            }
            
            return {
              media_url: itemMediaUrl,
              media_type: itemMediaType,
              thumbnail_url: itemThumbnailUrl
            };
          });
          
          // İlk öğenin URL'sini ana URL olarak ayarla
          if (post.carousel_media[0].image_versions2 && 
              post.carousel_media[0].image_versions2.candidates && 
              post.carousel_media[0].image_versions2.candidates.length > 0) {
            mediaUrl = post.carousel_media[0].image_versions2.candidates[0].url;
            thumbnailUrl = post.carousel_media[0].image_versions2.candidates[0].url;
          }
        }
        
        return {
          id: post.id || post.pk || String(Math.random()),
          caption: post.caption ? post.caption.text : '',
          media_url: mediaUrl,
          media_type: mediaType,
          thumbnail_url: thumbnailUrl,
          permalink: `https://www.instagram.com/p/${post.code}/`,
          carousel_media: carouselMedia,
          is_carousel: isCarousel
        };
      });
      
      // Profil bilgilerine gönderileri ekle - sakin yükleme için 500ms gecikme ekle
      setTimeout(() => {
        setProfileInfo(prevInfo => {
          if (prevInfo) {
            return {
              ...prevInfo,
              posts: formattedPosts
            };
          }
          return prevInfo;
        });
        setPostsLoading(false);
      }, 500);
      
    } catch (err) {
      console.error('Gönderiler alınırken hata:', err);
      setPostsLoading(false);
      // Hata durumunda boş gönderi dizisi
      setProfileInfo(prevInfo => {
        if (prevInfo) {
          return {
            ...prevInfo,
            posts: []
          };
        }
        return prevInfo;
      });
    }
  };


  const formatCount = (count: number) => {
    if (count === undefined || count === null) {
      return '0';
    }
    
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Görselleri proxy üzerinden getirmek için yardımcı fonksiyon
  const getProxiedImageUrl = (originalUrl: string | undefined) => {
    if (!originalUrl) return 'https://via.placeholder.com/100x100?text=Instagram';
    
    // URL'yi encode et ve proxy üzerinden getir
    return `${PROXY_URL}?url=${encodeURIComponent(originalUrl)}`;
  };

  // Carousel tab değiştirme fonksiyonu
  const handleCarouselTabChange = (postId: string, newValue: number) => {
    setSelectedCarouselTab(prev => ({
      ...prev,
      [postId]: newValue
    }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" align="center" gutterBottom color="primary">
        Instagram Görüntüleyici
      </Typography>
      
      <Typography variant="body1" align="center" paragraph sx={{ mb: 4 }}>
        Instagram fotoğraf, video ve profil bilgilerini görüntülemek için araçlar
      </Typography>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2 }}>
          <PersonIcon sx={{ color: '#E1306C', mr: 1, my: 0.5 }} />
          <TextField
            fullWidth
            label="Instagram Kullanıcı Adı"
            variant="outlined"
            value={username}
            onChange={handleUsernameChange}
            placeholder="kullanici_adi"
            error={!!error}
            helperText={error}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={getProfileInfo}
            disabled={loading || !username}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading ? 'İşleniyor...' : 'Profil Bilgilerini Getir'}
          </Button>
        </Box>
      </Paper>

      {profileInfo && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar 
                src={getProxiedImageUrl(profileInfo.profile_pic_url)} 
                alt={profileInfo.username}
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mr: 3,
                  border: '2px solid #E1306C',
                  bgcolor: '#E1306C20' // Hafif pembe arkaplan
                }}
                imgProps={{
                  onError: (e) => {
                    // Resim yüklenemezse hata durumunda fallback resmi
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Sonsuz döngüyü önle
                    target.src = 'https://via.placeholder.com/100x100?text=Instagram';
                  }
                }}
              />
              <Box>
                <Typography variant="h5">
                  {profileInfo.full_name || profileInfo.username}
                  {profileInfo.is_verified && ' ✓'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  @{profileInfo.username}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', mb: 3 }}>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="h6">
                  {formatCount(profileInfo.media_count)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gönderiler
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="h6">
                  {formatCount(profileInfo.follower_count)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Takipçiler
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'center' }}>
                <Typography variant="h6">
                  {formatCount(profileInfo.following_count)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Takip Edilen
                </Typography>
              </Box>
            </Box>
            
            {profileInfo.biography && (
              <Typography variant="body1" paragraph>
                {profileInfo.biography}
              </Typography>
            )}
            
            {profileInfo.external_url && (
              <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                <a href={profileInfo.external_url} target="_blank" rel="noopener noreferrer">
                  {profileInfo.external_url}
                </a>
              </Typography>
            )}
            
            <Typography variant="body2" color={profileInfo.is_private ? 'error' : 'success'} sx={{ mb: 3 }}>
              {profileInfo.is_private ? 'Bu hesap gizlidir' : 'Bu hesap herkese açıktır'}
            </Typography>

            {/* Kullanıcı gönderileri - sadece gönderi varsa göster */}
            {profileInfo?.posts && profileInfo.posts.length > 0 ? (
              <>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Son Gönderiler
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  {profileInfo.posts.map(post => {
                    // Her gönderi için aktif carousel tab'ını al, yoksa 0 kullan
                    const activeCarouselTab = selectedCarouselTab[post.id] || 0;
                    
                    return (
                      <Card key={post.id} sx={{ height: '100%' }}>
                        {post.is_carousel && post.carousel_media && post.carousel_media.length > 0 ? (
                          // Carousel gönderi için
                          <Box sx={{ position: 'relative' }}>
                            {/* Carousel gösterge */}
                            <Box 
                              sx={{ 
                                position: 'absolute', 
                                top: 8, 
                                right: 8, 
                                bgcolor: 'rgba(0,0,0,0.5)', 
                                color: 'white',
                                borderRadius: '50%',
                                width: 24,
                                height: 24,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                zIndex: 10
                              }}
                            >
                              {post.carousel_media.length}
                            </Box>
                            
                            {/* Aktif medyayı göster */}
                            <CardMedia
                              component="img"
                              image={getProxiedImageUrl(
                                activeCarouselTab < post.carousel_media.length 
                                  ? post.carousel_media[activeCarouselTab].media_url
                                  : post.media_url
                              )}
                              alt={post.caption || 'Instagram gönderi'}
                              sx={{ aspectRatio: '1/1', objectFit: 'cover' }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = 'https://via.placeholder.com/300x300?text=Cannot+Load';
                              }}
                            />
                            
                            {/* Carousel tab'ları */}
                            <Box sx={{ 
                              position: 'absolute',
                              bottom: 0,
                              width: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              p: 1,
                              bgcolor: 'rgba(0,0,0,0.3)'
                            }}>
                              {post.carousel_media.map((_, index) => (
                                <Box
                                  key={index}
                                  onClick={() => handleCarouselTabChange(post.id, index)}
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    mx: 0.5,
                                    bgcolor: index === activeCarouselTab ? 'white' : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer'
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        ) : (
                          // Normal gönderi için
                          <CardMedia
                            component="img"
                            image={
                              post.media_type === 'VIDEO' 
                                ? getProxiedImageUrl(post.thumbnail_url) 
                                : getProxiedImageUrl(post.media_url)
                            }
                            alt={post.caption || 'Instagram gönderi'}
                            sx={{ aspectRatio: '1/1', objectFit: 'cover' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'https://via.placeholder.com/300x300?text=Cannot+Load';
                            }}
                          />
                        )}
                        
                        {post.caption && (
                          <CardContent sx={{ p: 1 }}>
                            <Typography variant="body2" noWrap>
                              {post.caption}
                            </Typography>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </Box>
                
                {postsLoading && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                )}
              </>
            ) : null}
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
              Bilgilerini görüntülemek istediğiniz Instagram kullanıcı adını girin
            </Typography>
          </li>
          <li>
            <Typography paragraph>
              "Profil Bilgilerini Getir" butonuna tıklayarak kullanıcının profil bilgilerini ve gönderilerini görüntüleyin
            </Typography>
          </li>
          <li>
            <Typography paragraph>
              Profil sayfasında kullanıcının son 12 gönderisi gösterilir
            </Typography>
          </li>
          <li>
            <Typography paragraph>
              Çoklu fotoğraf/video içeren gönderilerde (carousel) tüm medyalar gösterilir
            </Typography>
          </li>
          <li>
            <Typography paragraph>
              Not: Sadece herkese açık (public) profiller için bilgiler görüntülenebilir
            </Typography>
          </li>
        </ol>
      </Box>
    </Container>
  );
};

export default InstagramDownloader; 