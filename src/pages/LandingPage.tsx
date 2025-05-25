import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Card,
  CardContent,
  Stack,
  useTheme,
  styled,
  keyframes
} from '@mui/material';
import { Link } from 'react-router-dom';
import YouTubeIcon from '@mui/icons-material/YouTube';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import InstagramIcon from '@mui/icons-material/Instagram';
import MusicVideoIcon from '@mui/icons-material/MusicVideo';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

// Animasyon keyframe'leri
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(rgba(230,169,84,0.1), rgba(230,169,84,0.05)), url('/hero-background.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  padding: theme.spacing(12, 0),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(230,169,84,0.1) 0%, rgba(255,255,255,0) 70%)',
    zIndex: 1
  }
}));

const AnimatedTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'delay'
})<{ delay?: number }>(({ theme, delay = 0 }) => ({
  animation: `${fadeIn} 0.8s ease-out ${delay}s both`,
}));

const FeatureCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'index'
})<{ index?: number }>(({ theme, index = 0 }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  textDecoration: 'none',
  transition: 'transform 0.3s, box-shadow 0.3s',
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  animation: `${fadeIn} 0.6s ease-out ${0.2 + index * 0.1}s both`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10]
  }
}));

const FeatureCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  textAlign: 'center',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
  display: 'flex',
  justifyContent: 'center',
  animation: `${float} 6s ease-in-out infinite`
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  transition: 'all 0.3s ease',
  animation: `${pulse} 2s infinite`,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 25px rgba(230, 169, 84, 0.4)',
  }
}));

const StepPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'index'
})<{ index?: number }>(({ theme, index = 0 }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  position: 'relative',
  overflow: 'hidden',
  animation: `${fadeIn} 0.6s ease-out ${0.3 + index * 0.2}s both`,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: theme.palette.primary.main
  }
}));

const StepNumber = styled(Typography)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  fontWeight: 'bold',
  position: 'relative',
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: '50%',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    opacity: 0.5,
    zIndex: -1,
    animation: `${pulse} 2s infinite`
  }
}));

const StyledLink = styled(Link)({
  textDecoration: 'none',
  display: 'block',
  height: '100%'
});

const FeaturesContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: theme.spacing(4),
  marginTop: theme.spacing(4)
}));

const StepsContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: theme.spacing(4),
  marginTop: theme.spacing(4)
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  textAlign: 'center',
  marginBottom: theme.spacing(6),
  position: 'relative',
  '&::after': {
    content: '""',
    display: 'block',
    width: '60px',
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    margin: '16px auto 0',
    borderRadius: theme.shape.borderRadius
  }
}));

const ShimmerText = styled(Typography)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.background.paper}, ${theme.palette.primary.light}, ${theme.palette.background.paper})`,
  backgroundSize: '200% 100%',
  animation: `${shimmer} 2s infinite`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent',
}));

const LandingPage: React.FC = () => {
  const theme = useTheme();
  
  const features = [
    {
      title: 'YouTube Video İndirme',
      description: 'HD kalitede YouTube videolarını kolayca indirebilirsiniz.',
      icon: <YouTubeIcon fontSize="large" sx={{ fontSize: '3rem' }} />,
      link: '/youtube-downloader'
    },
    {
      title: 'YouTube MP4 to MP3',
      description: 'YouTube videolarını yüksek kaliteli MP3 formatına dönüştürün.',
      icon: <AudiotrackIcon fontSize="large" sx={{ fontSize: '3rem' }} />,
      link: '/youtube-to-mp3'
    },
    {
      title: 'Instagram Görüntüleme',
      description: 'Instagram fotoğraflarını ve profil bilgilerini görüntüleyebilirsiniz.',
      icon: <InstagramIcon fontSize="large" sx={{ fontSize: '3rem' }} />,
      link: '/instagram-downloader'
    },
    {
      title: 'TikTok İndirme',
      description: 'TikTok videolarını filigransız olarak indirin.',
      icon: <MusicVideoIcon fontSize="large" sx={{ fontSize: '3rem' }} />,
      link: '/tiktok-downloader'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'URL\'yi Yapıştırın',
      description: 'İndirmek istediğiniz YouTube, Instagram veya TikTok içeriğinin bağlantısını kopyalayıp yapıştırın.'
    },
    {
      number: '2',
      title: 'Seçenekleri Belirleyin',
      description: 'İndirmek istediğiniz içerik için kalite ve format seçeneklerini belirleyin.'
    },
    {
      number: '3',
      title: 'İndirin veya Görüntüleyin',
      description: 'İndir butonuna tıklayın ve içeriği hemen cihazınıza kaydedin. Görüntüleme butonuna tıklayın ve içeriği görüntüleyebilirsiniz.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Stack spacing={4} alignItems="center">
            <ShimmerText
              variant="h1"
              align="center"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                letterSpacing: '-0.05em',
                mb: 1,
                textShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              vbulk
            </ShimmerText>
            
            <AnimatedTypography
              variant="h2"
              align="center"
              color="text.primary"
              delay={0.2}
              sx={{
                fontSize: { xs: '1.5rem', md: '2.5rem' },
                fontWeight: 600,
                mb: 2,
                maxWidth: '800px',
              }}
            >
              TikTok, YouTube ve Instagram için En İyi Toplu İndirme ve Görüntüleme Servisi
            </AnimatedTypography>
            
            <AnimatedTypography
              variant="h5"
              align="center"
              color="text.secondary"
              delay={0.4}
              sx={{ 
                mb: 4, 
                maxWidth: '700px',
                fontSize: { xs: '1rem', md: '1.2rem' },
                opacity: 0.9
              }}
            >
              Sosyal medya içeriklerini hızlı ve kolay bir şekilde indirin, görüntüleyin. Ücretsiz, kayıt gerektirmez ve tamamen güvenlidir.
            </AnimatedTypography>
            
            <AnimatedButton
              variant="contained"
              size="large"
              color="primary"
              startIcon={<CloudDownloadIcon />}
              sx={{ 
                py: 1.5, 
                px: 4, 
                fontSize: '1.1rem',
                borderRadius: 2,
                fontWeight: 'bold',
                boxShadow: theme.shadows[5]
              }}
            >
              <Box component={Link} to="/youtube-downloader" sx={{ textDecoration: 'none', color: 'inherit' }}>
                Şimdi Başlayın
              </Box>
            </AnimatedButton>
          </Stack>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <SectionTitle variant="h3">
          Özelliklerimiz
        </SectionTitle>
        
        <FeaturesContainer>
          {features.map((feature, index) => (
            <StyledLink to={feature.link} key={index}>
              <FeatureCard index={index}>
                <FeatureCardContent>
                  <FeatureIcon>{feature.icon}</FeatureIcon>
                  <Typography 
                    gutterBottom 
                    variant="h5" 
                    component="h2" 
                    color="text.primary"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    color="text.secondary"
                    sx={{ fontSize: '1rem', flexGrow: 1 }}
                  >
                    {feature.description}
                  </Typography>
                </FeatureCardContent>
              </FeatureCard>
            </StyledLink>
          ))}
        </FeaturesContainer>
      </Container>

      {/* How It Works */}
      <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <SectionTitle variant="h3">
            Nasıl Çalışır?
          </SectionTitle>
          
          <StepsContainer>
            {steps.map((step, index) => (
              <StepPaper elevation={3} key={index} index={index}>
                <StepNumber variant="h6">{step.number}</StepNumber>
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  {step.title}
                </Typography>
                <Typography color="text.secondary">
                  {step.description}
                </Typography>
              </StepPaper>
            ))}
          </StepsContainer>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) => theme.palette.background.paper,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body1" color="text.secondary" align="center">
            © {new Date().getFullYear()} vbulk. Tüm Hakları Saklıdır.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 