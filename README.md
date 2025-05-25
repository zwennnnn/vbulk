# VBULK - Sosyal Medya İçerik İndirme ve Görüntüleme Uygulaması

VBULK, popüler sosyal medya platformlarından içerik indirmeye yarayan modern ve kullanımı kolay bir web uygulamasıdır. Instagram, YouTube ve TikTok platformlarından video, resim ve ses dosyalarını hızlı ve kolay bir şekilde indirebilirsiniz,görüntüleyebilirsiniz.


## 🚀 Özellikler

### Instagram Görüntüleme
- Kullanıcı adından profil bilgilerini ve gönderileri çekme
- Kullanıcı bilgilerini görüntüleme (takipçi sayısı, gönderi sayısı, vb.)
- Profil resmini ve son 12 gönderiyi görüntüleme
- Carousel (çoklu) gönderilerde tüm medyaları görüntüleme
- Görselleri ve videoları yüksek kalitede indirme
- CORS sorunlarını aşmak için proxy sunucusu kullanımı

### YouTube İndirme
- Video ve shorts (kısa video) indirme desteği
- URL'den video ID çıkarma ve bilgilerini getirme
- Farklı kalite seçenekleriyle video indirme
- MP3 formatına dönüştürme ve ses dosyası olarak indirme

### TikTok İndirme
- TikTok video ve müziklerini filigransız indirme
- Farklı kalite seçenekleri sunma
- Hem video hem de sadece ses formatında indirme

## 🔧 Teknolojiler

- **Frontend:** React, TypeScript, Material UI
- **Backend:** Node.js, Express
- **API Entegrasyonu:** Instagram, Tiktok RapidAPI ve @distube/ytdl-core
- **Paket Yönetimi:** npm

## 📋 Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/zwennnnn/vbulk.git
cd vbulk
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. İlgili API Keyleri yerleştirin: 
```
Tiktok API Linki: https://rapidapi.com/7scorp-7scorp-default/api/tiktok-downloader-download-tiktok-videos-without-watermark

Link üzerinden subscribe oluyorsunuz ve RapidAPI keyinizi projede server.js de "KEY GIRINIZ" yazan yere yapıştırıyorsunuz.

Instagram API Linki: https://rapidapi.com/SocialScrapper/api/instagram-scrapper-posts-reels-stories-downloader

Link üzerinden subscribe oluyorsunuz ve RapidAPI keyinizi projede InstagramDownloader.tsx de "KEY GIRINIZ" yazan yere yapıştırıyorsunuz.
```
4. Geliştirme modunda çalıştırın:
```bash
npm run dev
```

5. Tarayıcınızda açın:
```
http://localhost:3000
```

Server varsayılan olarak 3001 portunda çalışacaktır.


## 📝 Kullanım

1. Anasayfadan indirmek istediğiniz platformu seçin (Instagram, YouTube veya TikTok)
2. İndirmek istediğiniz içeriğin URL'sini veya kullanıcı adını girin
3. "Bilgileri Getir" butonuna tıklayın
4. İndirmek istediğiniz içeriği ve kalitesini seçip indirin

## ⚠️ Önemli Not

Bu uygulama yalnızca eğitim amaçlıdır ve telif hakkı sahibinin izni olmadan içerik indirmek için kullanılmamalıdır. İndirilen tüm içerikler için telif hakkı sorumluluğu kullanıcıya aittir.

## 👨‍💻 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inize push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun


## 📞 İletişim

Sorularınız için: [yagizzeke@gmail.com](mailto:yagizzeke@gmail.com)

---

⭐️ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
