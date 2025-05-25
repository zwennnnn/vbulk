const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const ytdl = require('@distube/ytdl-core');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS ayarları
app.use(cors());

// Instagram görsellerini proxy etmek için endpoint
app.get('/api/proxy-image', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).send('URL parametresi gerekli');
    }
    
    const response = await axios({
      method: 'GET',
      url: decodeURIComponent(url),
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Content-Type header'ını ayarla
    res.set('Content-Type', response.headers['content-type']);
    
    // Stream olarak yanıtı gönder
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy hatası:', error);
    res.status(500).send('Görsel alınırken bir hata oluştu');
  }
});

// YouTube medya içeriğini proxy etmek için endpoint
app.get('/api/proxy-youtube', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).send('URL parametresi gerekli');
    }
    
    const response = await axios({
      method: 'GET',
      url: decodeURIComponent(url),
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.youtube.com/',
        'Origin': 'https://www.youtube.com'
      }
    });
    
    // Content-Type header'ını ayarla
    res.set('Content-Type', response.headers['content-type']);
    
    // İndirme için Content-Disposition header'ı ekle
    if (req.query.download === 'true') {
      const filename = req.query.filename || 'youtube-media';
      res.set('Content-Disposition', `attachment; filename="${filename}"`);
    }
    
    // Stream olarak yanıtı gönder
    response.data.pipe(res);
  } catch (error) {
    console.error('YouTube proxy hatası:', error);
    res.status(500).send('YouTube medya içeriği alınırken bir hata oluştu');
  }
});

// YouTube video/ses dosyasını ytdl-core kullanarak indirip kullanıcıya gönderen endpoint
app.get('/api/download-youtube', async (req, res) => {
  try {
    const { url, filename, format } = req.query;
    
    if (!url) {
      return res.status(400).send('URL parametresi gerekli');
    }
    
    console.log(`YouTube indirme isteği: ${url}`);
    
    // URL tipini kontrol et
    const isDirectDownloadUrl = url.includes('googlevideo.com') || 
                               url.includes('videoplayback') || 
                               url.includes('redirector');
    
    if (isDirectDownloadUrl) {
      // Doğrudan indirme URL'si ise, axios ile indir
      try {
        console.log('Doğrudan indirme URL algılandı, axios ile indiriliyor...');
        
        const response = await axios({
          method: 'GET',
          url: decodeURIComponent(url),
          responseType: 'stream',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://www.youtube.com/',
            'Origin': 'https://www.youtube.com',
            'Accept': '*/*',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Mode': 'navigate'
          },
          timeout: 30000 // 30 saniye timeout
        });
        
        // Content-Type header'ını ayarla
    const contentType = response.headers['content-type'];
    res.set('Content-Type', contentType);
    
        // Dosya uzantısını belirle
        const fileExt = format === 'audio' || format === 'mp3' ? '.mp3' : '.mp4';
        
        // Content-Disposition header'ı ekle (indirme için)
        const outputFilename = `${filename || 'youtube-media'}${fileExt}`;
        res.set('Content-Disposition', `attachment; filename="${outputFilename}"`);
        
        // Stream olarak yanıtı gönder
        response.data.pipe(res);
        
        console.log(`İndirme başlatıldı: ${outputFilename}`);
        
      } catch (axiosError) {
        console.error('Axios indirme hatası:', axiosError);
        throw new Error('Doğrudan indirme başarısız oldu');
      }
    } else {
      // YouTube video URL'si veya ID'si ise, ytdl-core kullan
      try {
        // URL'den video ID'yi ayıkla veya doğrudan URL'yi kullan
        let videoID = url;
        
        // YouTube video ID'sini çıkar
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          // Mevcut URL'yi kullan
          videoID = url;
        } else if (/^[a-zA-Z0-9-_]{11}$/.test(url)) {
          // ID verilmişse, tam URL oluştur
          videoID = `https://www.youtube.com/watch?v=${url}`;
        } else {
          throw new Error('Geçersiz YouTube URL formatı');
        }
        
        console.log(`ytdl-core ile işleniyor: ${videoID}`);
        
        // Video bilgilerini al
        const info = await ytdl.getInfo(videoID);
        console.log(`Video bilgileri alındı: ${info.videoDetails.title}`);
        
        // Formatı belirle
        const isAudioOnly = format === 'audio' || format === 'mp3';
        
        // Dosya adını belirle
        const safeTitle = info.videoDetails.title.replace(/[^\w\s]/gi, '') || 'youtube-video';
        const outputFilename = filename || safeTitle;
        
        if (isAudioOnly) {
          // Ses formatı için (MP3)
          res.header('Content-Disposition', `attachment; filename="${outputFilename}.mp3"`);
          res.header('Content-Type', 'audio/mpeg');
          
          console.log(`MP3 indirme başlatıldı: ${outputFilename}.mp3`);
          
          ytdl(videoID, { 
            quality: 'highestaudio',
            filter: 'audioonly'
          }).pipe(res);
        } else {
          // Video formatı için (MP4)
          res.header('Content-Disposition', `attachment; filename="${outputFilename}.mp4"`);
          res.header('Content-Type', 'video/mp4');
          
          console.log(`Video indirme başlatıldı: ${outputFilename}.mp4`);
          
          ytdl(videoID, { 
            quality: 'highest',
            filter: format === 'videoonly' ? 'videoonly' : 'videoandaudio'
          }).pipe(res);
        }
      } catch (ytdlError) {
        console.error('ytdl-core hatası:', ytdlError);
        
        // YouTube Shorts için alternatif yöntem
        if (url.includes('shorts')) {
          console.log('YouTube Shorts tespit edildi, alternatif yöntem deneniyor...');
          
          // Shorts için video ID'yi çıkar
          const shortsMatch = url.match(/shorts\/([^/?&]+)/);
          if (shortsMatch && shortsMatch[1]) {
            const shortsID = shortsMatch[1];
            const fullURL = `https://www.youtube.com/watch?v=${shortsID}`;
            
            console.log(`Shorts ID: ${shortsID}, tam URL: ${fullURL}`);
            
            const info = await ytdl.getInfo(fullURL);
            const safeTitle = info.videoDetails.title.replace(/[^\w\s]/gi, '') || 'youtube-shorts';
            const outputFilename = filename || safeTitle;
            
            if (format === 'audio' || format === 'mp3') {
              res.header('Content-Disposition', `attachment; filename="${outputFilename}.mp3"`);
              res.header('Content-Type', 'audio/mpeg');
              
              ytdl(fullURL, { 
                quality: 'highestaudio',
                filter: 'audioonly'
              }).pipe(res);
            } else {
              res.header('Content-Disposition', `attachment; filename="${outputFilename}.mp4"`);
              res.header('Content-Type', 'video/mp4');
              
              ytdl(fullURL, { 
                quality: 'highest'
              }).pipe(res);
            }
          } else {
            throw new Error('Shorts ID alınamadı');
          }
        } else {
          throw ytdlError;
        }
      }
    }
  } catch (error) {
    console.error('YouTube indirme hatası:', error);
    res.status(500).send('Medya dosyası indirilemedi. Lütfen tekrar deneyin.');
  }
});

// YouTube video bilgilerini getiren endpoint
app.get('/api/youtube-info', async (req, res) => {
  try {
    const { url, format } = req.query;
    
    if (!url) {
      return res.status(400).send('URL parametresi gerekli');
    }
    
    console.log(`YouTube bilgi isteği: ${url}`);
    
    try {
      // Video bilgilerini al
      const info = await ytdl.getInfo(url);
      
      // Yanıt nesnesini oluştur
      const response = {
        title: info.videoDetails.title,
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
        formats: []
      };
      
      // Format tipine göre filtreleme
      if (format === 'audio') {
        // Ses formatlarını filtrele ve gruplandır
        const audioFormats = info.formats
          .filter(format => format.hasAudio && !format.hasVideo);
        
        // Bitrate'e göre gruplandır ve en fazla 3 farklı kalite göster
        const audioGroups = {};
        
        // Önce tüm bitrateleri topla ve sırala
        const allBitrates = audioFormats
          .map(format => format.audioBitrate || 0)
          .filter(bitrate => bitrate > 0)
          .sort((a, b) => b - a);
        
        // Tekrarları kaldır
        const uniqueBitrates = [...new Set(allBitrates)];
        
        // En yüksek, orta ve düşük kalite için 3 bitrate seç
        let selectedBitrates = [];
        if (uniqueBitrates.length > 0) {
          // En yüksek kalite
          selectedBitrates.push(uniqueBitrates[0]);
          
          // Orta kalite (varsa)
          if (uniqueBitrates.length > 2) {
            const middleIndex = Math.floor(uniqueBitrates.length / 2);
            selectedBitrates.push(uniqueBitrates[middleIndex]);
          }
          
          // En düşük kalite (varsa)
          if (uniqueBitrates.length > 1) {
            selectedBitrates.push(uniqueBitrates[uniqueBitrates.length - 1]);
          }
        }
        
        // Seçilen bitratelere göre formatları ekle
        audioFormats.forEach(format => {
          const bitrate = format.audioBitrate || 0;
          if (selectedBitrates.includes(bitrate)) {
            if (!audioGroups[bitrate]) {
              audioGroups[bitrate] = {
                url: format.url,
                mimeType: format.mimeType,
                audioQuality: format.audioQuality,
                audioBitrate: format.audioBitrate,
                audioSampleRate: format.audioSampleRate,
                quality: format.audioBitrate ? `${Math.round(format.audioBitrate/1000)}kbps` : format.audioQuality
              };
            }
          }
        });
        
        response.formats = Object.values(audioGroups);
        
        // Bitrate'e göre sırala (yüksekten düşüğe)
        response.formats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));
      } else {
        // Video formatlarını çözünürlüğe göre gruplandır
        // Sadece standart çözünürlükleri seçelim: 1080p, 720p, 480p, 360p, 240p, 144p
        const standardResolutions = [1080, 720, 480, 360, 240, 144];
        const videoGroups = {};
        
        info.formats
          .filter(format => format.hasVideo)
          .forEach(format => {
            if (!format.height) return; // Geçersiz format
            
            // En yakın standart çözünürlüğü bul
            let resolution = format.height;
            
            // Tam olarak standart çözünürlükler varsa onları seç
            if (standardResolutions.includes(resolution)) {
              const resolutionKey = `${resolution}p`;
              
              // Eğer bu çözünürlük için henüz bir format yoksa veya
              // mevcut formattan daha iyi bir format bulunduysa (sesli)
              if (!videoGroups[resolutionKey] || 
                  (videoGroups[resolutionKey].hasAudio === false && format.hasAudio === true)) {
                videoGroups[resolutionKey] = {
                  url: format.url,
                  mimeType: format.mimeType,
                  width: format.width,
                  height: format.height,
                  hasAudio: format.hasAudio,
                  qualityLabel: format.qualityLabel || `${format.height}p`,
                  quality: format.qualityLabel || `${format.height}p`
                };
              }
            }
          });
        
        response.formats = Object.values(videoGroups);
        
        // Çözünürlüğe göre sırala (yüksekten düşüğe)
        response.formats.sort((a, b) => (b.height || 0) - (a.height || 0));
      }
      
      // Sonuçları gönder
      res.json(response);
      
    } catch (ytdlError) {
      console.error('YouTube bilgi hatası:', ytdlError);
      
      // YouTube Shorts için alternatif yöntem
      if (url.includes('shorts')) {
        try {
          // Shorts için video ID'yi çıkar
          const shortsMatch = url.match(/shorts\/([^/?&]+)/);
          if (shortsMatch && shortsMatch[1]) {
            const shortsID = shortsMatch[1];
            const fullURL = `https://www.youtube.com/watch?v=${shortsID}`;
            
            console.log(`Shorts ID: ${shortsID}, tam URL: ${fullURL}`);
            
            const info = await ytdl.getInfo(fullURL);
            
            // Yanıt nesnesini oluştur
            const response = {
              title: info.videoDetails.title,
              thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
              formats: []
            };
            
            // Format tipine göre filtreleme ve gruplandırma
            if (format === 'audio') {
              // Ses formatlarını filtrele ve gruplandır
              const audioFormats = info.formats
                .filter(format => format.hasAudio && !format.hasVideo);
              
              // Bitrate'e göre gruplandır ve en fazla 3 farklı kalite göster
              const audioGroups = {};
              
              // Önce tüm bitrateleri topla ve sırala
              const allBitrates = audioFormats
                .map(format => format.audioBitrate || 0)
                .filter(bitrate => bitrate > 0)
                .sort((a, b) => b - a);
              
              // Tekrarları kaldır
              const uniqueBitrates = [...new Set(allBitrates)];
              
              // En yüksek, orta ve düşük kalite için 3 bitrate seç
              let selectedBitrates = [];
              if (uniqueBitrates.length > 0) {
                // En yüksek kalite
                selectedBitrates.push(uniqueBitrates[0]);
                
                // Orta kalite (varsa)
                if (uniqueBitrates.length > 2) {
                  const middleIndex = Math.floor(uniqueBitrates.length / 2);
                  selectedBitrates.push(uniqueBitrates[middleIndex]);
                }
                
                // En düşük kalite (varsa)
                if (uniqueBitrates.length > 1) {
                  selectedBitrates.push(uniqueBitrates[uniqueBitrates.length - 1]);
                }
              }
              
              // Seçilen bitratelere göre formatları ekle
              audioFormats.forEach(format => {
                const bitrate = format.audioBitrate || 0;
                if (selectedBitrates.includes(bitrate)) {
                  if (!audioGroups[bitrate]) {
                    audioGroups[bitrate] = {
                      url: format.url,
                      mimeType: format.mimeType,
                      audioQuality: format.audioQuality,
                      audioBitrate: format.audioBitrate,
                      audioSampleRate: format.audioSampleRate,
                      quality: format.audioBitrate ? `${Math.round(format.audioBitrate/1000)}kbps` : format.audioQuality
                    };
                  }
                }
              });
              
              response.formats = Object.values(audioGroups);
              
              // Bitrate'e göre sırala (yüksekten düşüğe)
              response.formats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));
            } else {
              // Video formatlarını çözünürlüğe göre gruplandır
              // Sadece standart çözünürlükleri seçelim: 1080p, 720p, 480p, 360p, 240p, 144p
              const standardResolutions = [1080, 720, 480, 360, 240, 144];
              const videoGroups = {};
              
              info.formats
                .filter(format => format.hasVideo)
                .forEach(format => {
                  if (!format.height) return; // Geçersiz format
                  
                  // En yakın standart çözünürlüğü bul
                  let resolution = format.height;
                  
                  // Tam olarak standart çözünürlükler varsa onları seç
                  if (standardResolutions.includes(resolution)) {
                    const resolutionKey = `${resolution}p`;
                    
                    // Eğer bu çözünürlük için henüz bir format yoksa veya
                    // mevcut formattan daha iyi bir format bulunduysa (sesli)
                    if (!videoGroups[resolutionKey] || 
                        (videoGroups[resolutionKey].hasAudio === false && format.hasAudio === true)) {
                      videoGroups[resolutionKey] = {
                        url: format.url,
                        mimeType: format.mimeType,
                        width: format.width,
                        height: format.height,
                        hasAudio: format.hasAudio,
                        qualityLabel: format.qualityLabel || `${format.height}p`,
                        quality: format.qualityLabel || `${format.height}p`
                      };
                    }
                  }
                });
              
              response.formats = Object.values(videoGroups);
              
              // Çözünürlüğe göre sırala (yüksekten düşüğe)
              response.formats.sort((a, b) => (b.height || 0) - (a.height || 0));
            }
            
            // Sonuçları gönder
            return res.json(response);
          }
        } catch (shortsError) {
          console.error('Shorts bilgi hatası:', shortsError);
          throw new Error('Shorts video bilgileri alınamadı');
        }
      }
      
      throw ytdlError;
    }
  } catch (error) {
    console.error('YouTube bilgi API hatası:', error);
    res.status(500).json({ error: 'Video bilgileri alınamadı', message: error.message });
  }
});

// TikTok video bilgilerini getiren endpoint
app.get('/api/tiktok-info', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).send('URL parametresi gerekli');
    }
    
    console.log(`TikTok bilgi isteği: ${url}`);
    
    try {
      const options = {
        method: 'GET',
        url: 'https://tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com/index',
        params: { url: url },
        headers: {
          'x-rapidapi-key': 'KEY GIRINIZ',
          'x-rapidapi-host': 'tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com'
        }
      };
      
      const response = await axios.request(options);
      
      // Yanıtı düzenle
      const result = {
        title: response.data.description?.[0] || 'TikTok Video',
        author: response.data.author?.[0] || 'Unknown',
        thumbnail: response.data.cover?.[0] || response.data.dynamic_cover?.[0] || '',
        formats: [
          {
            type: 'video',
            quality: 'HD',
            url: response.data.video?.[0] || '',
            label: 'Video (watermark yok)'
          }
        ]
      };
      
      // Eğer müzik varsa, müzik formatını da ekle
      if (response.data.music && response.data.music[0]) {
        result.formats.push({
          type: 'audio',
          quality: 'mp3',
          url: response.data.music[0],
          label: 'Müzik'
        });
      }
      
      // Eğer orijinal watermarked video varsa, onu da ekle
      if (response.data.OriginalWatermarkedVideo && response.data.OriginalWatermarkedVideo[0]) {
        result.formats.push({
          type: 'video',
          quality: 'Original',
          url: response.data.OriginalWatermarkedVideo[0],
          label: 'Video (orijinal, watermarklı)'
        });
      }
      
      res.json(result);
    } catch (error) {
      console.error('TikTok API hatası:', error);
      res.status(500).json({ error: 'TikTok video bilgileri alınamadı', message: error.message });
    }
  } catch (error) {
    console.error('TikTok bilgi API hatası:', error);
    res.status(500).json({ error: 'TikTok video bilgileri alınamadı', message: error.message });
  }
});

// TikTok videosu indirme endpoint'i
app.get('/api/download-tiktok', async (req, res) => {
  try {
    const { url, filename } = req.query;
    
    if (!url) {
      return res.status(400).send('URL parametresi gerekli');
    }
    
    console.log(`TikTok indirme isteği: ${url}`);
    
    // İndirme işlemini gerçekleştir
    const response = await axios({
      method: 'GET',
      url: decodeURIComponent(url),
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.tiktok.com/',
        'Accept': '*/*',
      },
      timeout: 30000 // 30 saniye timeout
    });
    
    // Content-Type header'ını ayarla
    const contentType = response.headers['content-type'];
    res.set('Content-Type', contentType);
    
    // Dosya uzantısını belirle
    const fileExt = contentType.includes('audio') ? '.mp3' : '.mp4';
    
    // Content-Disposition header'ı ekle (indirme için)
    const outputFilename = `${filename || 'tiktok-video'}${fileExt}`;
    res.set('Content-Disposition', `attachment; filename="${outputFilename}"`);
    
    // Stream olarak yanıtı gönder
    response.data.pipe(res);
    
    console.log(`TikTok indirme başlatıldı: ${outputFilename}`);
  } catch (error) {
    console.error('TikTok indirme hatası:', error);
    res.status(500).send('TikTok video indirilemedi. Lütfen tekrar deneyin.');
  }
});

// API durumunu kontrol etmek için basit bir endpoint
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', message: 'Proxy server çalışıyor' });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Proxy sunucusu ${PORT} portunda çalışıyor`);
}); 