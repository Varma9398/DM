import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, RepeatType } from 'framer-motion';
import { Upload, Download, Play, Pause, RotateCcw, Palette, Sparkles, Zap, Settings } from 'lucide-react';
import { CardData } from '../types';
import { themes, animations } from '../data/builderData';
import { CanvasRenderer, AnimationFrameGenerator } from '../utils/canvasRenderer';

interface CardBuilderProps {
  onAddToFavorites: (card: CardData) => void;
}

const CardBuilder: React.FC<CardBuilderProps> = ({ onAddToFavorites }) => {
  const [title, setTitle] = useState('Your Hook Here');
  const [message, setMessage] = useState('Your cold DM message goes here. Make it compelling and personal.');
  const [logo, setLogo] = useState<string | null>(null);
  const [cta, setCta] = useState('Get Started');
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [selectedAnimation, setSelectedAnimation] = useState(animations[0]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [ctaLink, setCtaLink] = useState('');
  const [exportFormat, setExportFormat] = useState<'gif' | 'mp4' | 'png' | 'svg'>('gif');
  const [isExporting, setIsExporting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [cardWidth, setCardWidth] = useState(360);
  const [cardHeight, setCardHeight] = useState(640);
  const [animationKey, setAnimationKey] = useState(0);
  const [exportProgress, setExportProgress] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(1); // 1x speed
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Animation control
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
    if (!isAnimating) {
      setAnimationKey(prev => prev + 1);
    }
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsAnimating(true);
      setAnimationKey(prev => prev + 1);
    }, 100);
  };

  // Typewriter effect for text
  const TypewriterText: React.FC<{ text: string; delay?: number; className?: string; style?: any }> = ({ 
    text, 
    delay = 0, 
    className = '', 
    style = {} 
  }) => {
    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
      if (!isAnimating || selectedAnimation.type !== 'typewriter') {
        setDisplayText(text);
        setShowCursor(false);
        return;
      }

      setDisplayText('');
      setCurrentIndex(0);
      setShowCursor(true);

      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          setCurrentIndex((prevIndex) => {
            if (prevIndex < text.length) {
              setDisplayText(text.slice(0, prevIndex + 1));
              return prevIndex + 1;
            } else {
              clearInterval(interval);
              setShowCursor(false);
              return prevIndex;
            }
          });
        }, 80); // Slower typing for better visibility

        return () => clearInterval(interval);
      }, delay);

      return () => clearTimeout(timer);
    }, [text, delay, isAnimating, selectedAnimation.type, animationKey]);

    return (
      <span className={className} style={style}>
        {displayText}
        {selectedAnimation.type === 'typewriter' && isAnimating && showCursor && currentIndex <= text.length && (
          <span className="animate-pulse text-cyan-400">|</span>
        )}
      </span>
    );
  };

  // Export as GIF using proper canvas rendering
  const exportAsGIF = async () => {
    try {
      setExportProgress(10);
      
      // Dynamic import of gif.js
      const GIF = (await import('gif.js')).default;
      
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: cardWidth,
        height: cardHeight,
        workerScript: '/gif.worker.js'
      });

      setExportProgress(20);

      // Generate animation frames
      const frameGenerator = new AnimationFrameGenerator(
        cardWidth, 
        cardHeight, 
        selectedAnimation.duration,
        20 // Lower FPS for smaller file size
      );

      setExportProgress(30);

      const frames = await frameGenerator.generateAnimationFrames(
        title,
        message,
        cta,
        selectedTheme,
        selectedAnimation.type,
        logo || undefined
      );

      setExportProgress(60);

      // Add frames to GIF
      for (let i = 0; i < frames.length; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = cardWidth;
        canvas.height = cardHeight;
        const ctx = canvas.getContext('2d')!;
        
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            gif.addFrame(canvas, { delay: 100 });
            resolve();
          };
          img.src = URL.createObjectURL(frames[i]);
        });
        
        setExportProgress(60 + (i / frames.length) * 30);
      }

      setExportProgress(95);

      // Render GIF
      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `cold-dm-card-${Date.now()}.gif`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setExportProgress(100);
      });

      gif.render();
    } catch (error) {
      console.error('GIF export failed:', error);
      // Fallback to PNG
      await exportAsPNG();
    }
  };

  // Export as MP4 using canvas-based recording
  const exportAsMP4 = async () => {
    try {
      setExportProgress(10);

      // Generate animation frames
      const frameGenerator = new AnimationFrameGenerator(
        cardWidth, 
        cardHeight, 
        selectedAnimation.duration,
        30 // Higher FPS for smoother video
      );

      setExportProgress(20);

      const frames = await frameGenerator.generateAnimationFrames(
        title,
        message,
        cta,
        selectedTheme,
        selectedAnimation.type,
        logo || undefined
      );

      setExportProgress(50);

      // Create video using MediaRecorder with canvas stream
      const canvas = document.createElement('canvas');
      canvas.width = cardWidth;
      canvas.height = cardHeight;
      const ctx = canvas.getContext('2d')!;
      
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `cold-dm-card-${Date.now()}.webm`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        setExportProgress(100);
      };

      mediaRecorder.start();
      setExportProgress(60);

      // Play frames
      const frameDuration = selectedAnimation.duration / frames.length;
      for (let i = 0; i < frames.length; i++) {
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.clearRect(0, 0, cardWidth, cardHeight);
            ctx.drawImage(img, 0, 0);
            setTimeout(resolve, frameDuration);
          };
          img.src = URL.createObjectURL(frames[i]);
        });
        
        setExportProgress(60 + (i / frames.length) * 30);
      }

      setExportProgress(95);
      mediaRecorder.stop();

    } catch (error) {
      console.error('MP4 export failed:', error);
      // Fallback to PNG
      await exportAsPNG();
    }
  };

  // Export as PNG
  const exportAsPNG = async () => {
    try {
      setExportProgress(50);
      
      const renderer = new CanvasRenderer(cardWidth, cardHeight);
      
      // Clear with background
      renderer.clear(selectedTheme.colors.background);
      
      // Draw logo if provided
      if (logo) {
        await renderer.drawImage(logo, 30, 30, 48, 48);
      }
      
      setExportProgress(70);
      
      // Draw title
      renderer.drawText(title, cardWidth / 2, 150, {
        fontSize: 32,
        fontFamily: selectedTheme.font,
        color: selectedTheme.colors.text,
        textAlign: 'center'
      });
      
      // Draw message
      renderer.drawText(message, cardWidth / 2, cardHeight / 2, {
        fontSize: 16,
        fontFamily: selectedTheme.font,
        color: selectedTheme.colors.text,
        textAlign: 'center',
        maxWidth: cardWidth - 60,
        lineHeight: 24
      });
      
      setExportProgress(85);
      
      // Draw CTA button
      const buttonY = cardHeight - 120;
      const buttonWidth = 200;
      const buttonHeight = 50;
      const buttonX = (cardWidth - buttonWidth) / 2;
      
      renderer.drawRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12, selectedTheme.colors.primary);
      renderer.drawText(cta, cardWidth / 2, buttonY + 32, {
        fontSize: 16,
        fontFamily: selectedTheme.font,
        color: '#ffffff',
        textAlign: 'center'
      });
      
      // Draw footer
      renderer.drawText('Built with Cold DM Battlecards', cardWidth / 2, cardHeight - 30, {
        fontSize: 12,
        fontFamily: selectedTheme.font,
        color: selectedTheme.colors.text,
        textAlign: 'center'
      });
      
      setExportProgress(95);
      
      // Download
      const blob = await renderer.getBlob('image/png');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `cold-dm-card-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      
      setExportProgress(100);
    } catch (error) {
      console.error('PNG export failed:', error);
    }
  };

  // Export as SVG (with clickable CTA link if provided)
  const exportAsSVG = async () => {
    try {
      setExportProgress(50);
      // Build SVG markup
      const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='${cardWidth}' height='${cardHeight}' viewBox='0 0 ${cardWidth} ${cardHeight}' style='font-family:${selectedTheme.font};'>
        <defs>
          <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stop-color='${selectedTheme.colors.background.split(' ')[1] || selectedTheme.colors.background}' />
            <stop offset='100%' stop-color='${selectedTheme.colors.background.split(' ')[3] || selectedTheme.colors.background}' />
          </linearGradient>
        </defs>
        <rect width='100%' height='100%' rx='24' fill='url(#bg)' />
        ${logo ? `<image href='${logo}' x='30' y='30' width='48' height='48' />` : ''}
        <text x='50%' y='150' text-anchor='middle' font-size='32' fill='${selectedTheme.colors.text}' font-family='${selectedTheme.font}' font-weight='bold' style='text-shadow: ${textShadow}'>${title.replace(/&/g, '&amp;')}</text>
        <foreignObject x='30' y='${cardHeight / 2 - 60}' width='${cardWidth - 60}' height='120'>
          <div xmlns='http://www.w3.org/1999/xhtml' style='color:${selectedTheme.colors.text};font-size:16px;text-align:center;line-height:1.5;text-shadow: ${textShadow}'>${message.replace(/&/g, '&amp;')}</div>
        </foreignObject>
        <a href='${ctaLink || '#'}' target='_blank' rel='noopener noreferrer'>
          <rect x='${(cardWidth - 200) / 2}' y='${cardHeight - 120}' rx='12' width='200' height='50' fill='${selectedTheme.colors.primary}' />
          <text x='50%' y='${cardHeight - 88}' text-anchor='middle' font-size='16' fill='#fff' font-family='${selectedTheme.font}' font-weight='bold' style='text-shadow: ${textShadow}'>${cta.replace(/&/g, '&amp;')}</text>
        </a>
        <text x='50%' y='${cardHeight - 30}' text-anchor='middle' font-size='12' fill='${selectedTheme.colors.text}' font-family='${selectedTheme.font}' style='text-shadow: ${textShadow}'>Built with Cold DM Battlecards</text>
      </svg>
      `;
      // Download SVG
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `cold-dm-card-${Date.now()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      setExportProgress(100);
    } catch (error) {
      console.error('SVG export failed:', error);
    }
  };

  // Main export handler
  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      switch (exportFormat) {
        case 'gif':
          await exportAsGIF();
          break;
        case 'mp4':
          await exportAsMP4();
          break;
        case 'png':
          await exportAsPNG();
          break;
        case 'svg':
          await exportAsSVG();
          break;
      }
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
    }
  };

  // Save to favorites
  const handleSaveToFavorites = () => {
    const cardData: CardData = {
      title,
      message,
      tags: ['custom', 'created', selectedTheme.name.toLowerCase()],
      tip: `Custom card created with ${selectedTheme.name} theme`,
      rarity: 'common',
      category: 'custom',
      tone: 'custom',
      goal: 'custom'
    };
    
    onAddToFavorites(cardData);
  };

  // Animation variants
  const getAnimationVariant = () => {
    if (!isAnimating) return { initial: {}, animate: {}, transition: {} };
    switch (selectedAnimation.type) {
      case 'fade':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: [0, 1, 0.8, 1], scale: [0.8, 1, 0.95, 1] },
          transition: { duration: selectedAnimation.duration / 1000, repeat: Infinity, repeatType: 'loop' as RepeatType }
        };
      case 'swipe':
        return {
          initial: { x: -100, opacity: 0 },
          animate: { x: [ -100, 0, 100, 0 ], opacity: [0, 1, 0.8, 1] },
          transition: { duration: selectedAnimation.duration / 1000, repeat: Infinity, repeatType: 'loop' as RepeatType }
        };
      case 'punch':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: [0.8, 1.1, 0.95, 1], opacity: [0, 1, 0.8, 1] },
          transition: { duration: selectedAnimation.duration / 1000, repeat: Infinity, repeatType: 'loop' as RepeatType }
        };
      case 'glitch':
        return {
          initial: { opacity: 0, x: 0 },
          animate: { 
            opacity: [0, 1, 0.7, 1], 
            x: [0, -2, 2, -1, 1, 0],
            filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(0deg)', 'hue-rotate(0deg)']
          },
          transition: { 
            duration: selectedAnimation.duration / 1000,
            times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            repeat: Infinity,
            repeatType: 'loop' as RepeatType
          }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: [0, 1, 0.8, 1] },
          transition: { duration: selectedAnimation.duration / 1000, repeat: Infinity, repeatType: 'loop' as RepeatType }
        };
    }
  };

  // Helper to get animation variant for content elements
  const getContentAnimationVariant = () => {
    // Only use for non-typewriter
    if (selectedAnimation.type === 'typewriter' || !isAnimating) {
      return { initial: {}, animate: {}, transition: {} };
    }
    return getAnimationVariant();
  };

  // Helper to get animation props for content elements
  const getContentAnimationProps = () => {
    if (!animationEnabled || !isAnimating || selectedAnimation.type === 'typewriter') return {};
    const duration = (selectedAnimation.duration / animationSpeed) / 1000;
    switch (selectedAnimation.type) {
      case 'fade':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: [0, 1, 0.8, 1], scale: [0.8, 1, 0.95, 1] },
          transition: { duration, repeat: Infinity, repeatType: 'loop' as RepeatType }
        };
      case 'swipe':
        return {
          initial: { x: -100, opacity: 0 },
          animate: { x: [-100, 0, 100, 0], opacity: [0, 1, 0.8, 1] },
          transition: { duration, repeat: Infinity, repeatType: 'loop' as RepeatType }
        };
      case 'punch':
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: [0.8, 1.1, 0.95, 1], opacity: [0, 1, 0.8, 1] },
          transition: { duration, repeat: Infinity, repeatType: 'loop' as RepeatType }
        };
      case 'glitch':
        return {
          initial: { opacity: 0, x: 0 },
          animate: { opacity: [0, 1, 0.7, 1], x: [0, -2, 2, -1, 1, 0], filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(0deg)', 'hue-rotate(0deg)'] },
          transition: { duration, times: [0, 0.2, 0.4, 0.6, 0.8, 1], repeat: Infinity, repeatType: 'loop' as RepeatType }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: [0, 1, 0.8, 1] },
          transition: { duration, repeat: Infinity, repeatType: 'loop' as RepeatType }
        };
    }
  };

  // Helper to determine if the background is light or dark for text shadow
  const isBgLight = () => {
    // Use the first color stop in the gradient to guess
    const bg = selectedTheme.colors.background;
    const match = bg.match(/#([0-9a-fA-F]{6})/);
    if (!match) return false;
    const hex = match[1];
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Perceived brightness
    return (r * 299 + g * 587 + b * 114) / 1000 > 180;
  };
  const textShadow = isBgLight()
    ? '0 2px 8px rgba(0,0,0,0.25)'
    : '0 2px 8px rgba(0,0,0,0.5)';

  // Style for dropdown options to ensure visibility
  const dropdownOptionStyle = { backgroundColor: 'rgba(255,255,255,0.95)', color: '#111' };

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Card Builder</h1>
        <p className="text-gray-300 text-lg">Create stunning animated cards for your cold DMs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls Panel */}
        <div className="space-y-6">
          {/* Content Inputs */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Content</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title/Hook</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="Enter your attention-grabbing title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                  placeholder="Enter your cold DM message"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">CTA/Link Text</label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="Call to action text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">CTA Link (Optional)</label>
                <input
                  type="text"
                  value={ctaLink}
                  onChange={(e) => setCtaLink(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="https://your-link.com (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Logo (Optional)</label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Logo</span>
                  </button>
                  {logo && (
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                      <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
                    </div>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Card Dimensions */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Card Dimensions
            </h3>
            
            {/* Aspect Ratio Presets */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio Presets</label>
              <select
                onChange={e => {
                  const [w, h] = e.target.value.split(':').map(Number);
                  setCardWidth(w);
                  setCardHeight(h);
                }}
                className="w-full px-3 py-2 bg-white/90 border border-white/10 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-cyan-500/50 mb-2"
                defaultValue=""
              >
                <option value="" disabled style={dropdownOptionStyle}>Select a preset</option>
                <option value="360:640" style={dropdownOptionStyle}>9:16 (360×640)</option>
                <option value="400:400" style={dropdownOptionStyle}>1:1 (400×400)</option>
                <option value="640:360" style={dropdownOptionStyle}>16:9 (640×360)</option>
                <option value="360:800" style={dropdownOptionStyle}>10:16 (360×800)</option>
                <option value="400:500" style={dropdownOptionStyle}>4:5 (400×500)</option>
                <option value="400:600" style={dropdownOptionStyle}>2:3 (400×600)</option>
                <option value="600:800" style={dropdownOptionStyle}>3:4 (600×800)</option>
                <option value="800:600" style={dropdownOptionStyle}>4:3 (800×600)</option>
                <option value="500:400" style={dropdownOptionStyle}>5:4 (500×400)</option>
                <option value="840:360" style={dropdownOptionStyle}>21:9 (840×360)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Width (px)</label>
                <input
                  type="number"
                  value={cardWidth}
                  onChange={(e) => setCardWidth(Math.max(100, parseInt(e.target.value) || 360))}
                  min="100"
                  max="2000"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Height (px)</label>
                <input
                  type="number"
                  value={cardHeight}
                  onChange={(e) => setCardHeight(Math.max(100, parseInt(e.target.value) || 640))}
                  min="100"
                  max="3000"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-400">
              Aspect Ratio: <span className="text-cyan-400 font-mono">{(cardWidth / cardHeight).toFixed(2)} : 1</span>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Theme
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => setSelectedTheme(theme)}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    selectedTheme.name === theme.name
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <span className="text-white text-sm font-medium">{theme.name}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{theme.style}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Animation Selection */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Animation
            </h3>
            
            {/* Enable/Disable Animation Toggle */}
            <div className="mb-4 flex items-center">
              <input
                id="enable-animation"
                type="checkbox"
                checked={animationEnabled}
                onChange={e => setAnimationEnabled(e.target.checked)}
                className="accent-purple-500 mr-2"
              />
              <label htmlFor="enable-animation" className="text-sm text-gray-300 select-none">Enable Animations</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {animations.map((animation) => (
                <button
                  key={animation.name}
                  onClick={() => setSelectedAnimation(animation)}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    selectedAnimation.name === animation.name
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-white text-sm font-medium">{animation.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Animation Speed Control */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Animation Speed</label>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-400">0.5x</span>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.05}
                  value={animationSpeed}
                  onChange={e => setAnimationSpeed(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <span className="text-xs text-gray-400">2x</span>
                <span className="ml-2 text-sm text-purple-400 font-semibold">{animationSpeed.toFixed(2)}x</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={toggleAnimation}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
              >
                {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isAnimating ? 'Pause' : 'Play'}</span>
              </button>
              <button
                onClick={resetAnimation}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Export
            </h3>
            
            {/* PNG clickable link warning */}
            {exportFormat === 'png' && ctaLink && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 text-sm">
                <b>Note:</b> PNG does not support clickable links. To export a card with a clickable CTA, use SVG export instead.
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'gif' | 'mp4' | 'png' | 'svg')}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="png" className="bg-gray-800">PNG (Static Image)</option>
                  <option value="gif" className="bg-gray-800">GIF (Animated)</option>
                  <option value="mp4" className="bg-gray-800">MP4/WebM (Video)</option>
                  <option value="svg" className="bg-gray-800">SVG (Clickable Link)</option>
                </select>
              </div>

              {isExporting && (
                <div className="w-full bg-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Exporting...</span>
                    <span className="text-sm text-cyan-400">{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}</span>
                </button>
                <button
                  onClick={handleSaveToFavorites}
                  className="flex items-center space-x-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card Preview */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Preview</h3>
            
            <div className="flex justify-center">
              <div 
                className="bg-black rounded-[2rem] p-4 shadow-2xl"
                style={{ 
                  width: Math.min(cardWidth + 32, 400),
                  height: Math.min(cardHeight + 32, 600)
                }}
              >
                {animationEnabled ? (
                  <motion.div
                    key={animationKey}
                    ref={cardRef}
                    className="w-full h-full rounded-[1.5rem] overflow-hidden relative flex flex-col"
                    style={{
                      background: selectedTheme.colors.background,
                      fontFamily: selectedTheme.font,
                      width: cardWidth,
                      height: cardHeight
                    }}
                    {...getAnimationVariant()}
                  >
                    {/* Card Content - Invitation Style Layout */}
                    <div className="h-full flex flex-col justify-between p-6">
                      {/* Logo Centered at Top */}
                      <div className="flex flex-col items-center mb-4">
                        {logo && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2 shadow-md"
                          >
                            <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                          </motion.div>
                        )}
                      </div>

                      {/* Title */}
                      <div className="flex flex-col items-center mb-2">
                        {selectedAnimation.type === 'typewriter' && animationEnabled ? (
                          <motion.h1
                            className="text-3xl font-extrabold text-center mb-2 tracking-tight"
                            style={{ color: selectedTheme.colors.text, textShadow }}
                          >
                            <TypewriterText 
                              text={title} 
                              delay={400}
                              style={{ color: selectedTheme.colors.text }}
                            />
                          </motion.h1>
                        ) : (
                          <motion.h1
                            className="text-3xl font-extrabold text-center mb-2 tracking-tight"
                            style={{ color: selectedTheme.colors.text, textShadow }}
                            {...getContentAnimationProps()}
                          >
                            {title}
                          </motion.h1>
                        )}
                        <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full my-2" />
                      </div>

                      {/* Message */}
                      <div className="flex-1 flex flex-col justify-center items-center">
                        {selectedAnimation.type === 'typewriter' && animationEnabled ? (
                          <motion.div
                            className="text-center leading-relaxed px-4 text-lg mb-4"
                            style={{ color: selectedTheme.colors.text, textShadow }}
                          >
                            <TypewriterText 
                              text={message} 
                              delay={1200}
                              style={{ color: selectedTheme.colors.text }}
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            className="text-center leading-relaxed px-4 text-lg mb-4"
                            style={{ color: selectedTheme.colors.text, textShadow }}
                            {...getContentAnimationProps()}
                          >
                            {message}
                          </motion.div>
                        )}
                      </div>

                      {/* CTA Button/Link at Bottom */}
                      <div className="flex flex-col items-center mt-4 mb-2">
                        {selectedAnimation.type === 'typewriter' && animationEnabled ? (
                          <motion.button
                            className="mx-auto px-10 py-3 rounded-2xl font-semibold text-white shadow-lg text-lg"
                            style={{ backgroundColor: selectedTheme.colors.primary }}
                          >
                            <TypewriterText 
                              text={cta} 
                              delay={2000}
                              style={{ color: 'white', textShadow }}
                            />
                          </motion.button>
                        ) : ctaLink ? (
                          <motion.a
                            href={ctaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mx-auto px-10 py-3 rounded-2xl font-semibold text-white shadow-lg text-lg inline-block text-center"
                            style={{ backgroundColor: selectedTheme.colors.primary, textDecoration: 'none', textShadow }}
                            {...getContentAnimationProps()}
                          >
                            {cta}
                          </motion.a>
                        ) : (
                          <motion.button
                            className="mx-auto px-10 py-3 rounded-2xl font-semibold text-white shadow-lg text-lg"
                            style={{ backgroundColor: selectedTheme.colors.primary, textShadow }}
                            {...getContentAnimationProps()}
                          >
                            {cta}
                          </motion.button>
                        )}
                      </div>

                      {/* Footer branding */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.0 }}
                        className="text-center mt-2"
                      >
                        <p className="text-xs opacity-60" style={{ color: selectedTheme.colors.text, textShadow }}>
                          Built with Cold DM Battlecards
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <div
                    ref={cardRef as any}
                    className="w-full h-full rounded-[1.5rem] overflow-hidden relative flex flex-col"
                    style={{
                      background: selectedTheme.colors.background,
                      fontFamily: selectedTheme.font,
                      width: cardWidth,
                      height: cardHeight
                    }}
                  >
                    {/* Card Content - Invitation Style Layout */}
                    <div className="h-full flex flex-col justify-between p-6">
                      {/* Logo Centered at Top */}
                      <div className="flex flex-col items-center mb-4">
                        {logo && (
                          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-2 shadow-md">
                            <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <div className="flex flex-col items-center mb-2">
                        <h1 className="text-3xl font-extrabold text-center mb-2 tracking-tight" style={{ color: selectedTheme.colors.text, textShadow }}>{title}</h1>
                        <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full my-2" />
                      </div>

                      {/* Message */}
                      <div className="flex-1 flex flex-col justify-center items-center">
                        <div className="text-center leading-relaxed px-4 text-lg mb-4" style={{ color: selectedTheme.colors.text, textShadow }}>{message}</div>
                      </div>

                      {/* CTA Button/Link at Bottom */}
                      <div className="flex flex-col items-center mt-4 mb-2">
                        {ctaLink ? (
                          <a
                            href={ctaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mx-auto px-10 py-3 rounded-2xl font-semibold text-white shadow-lg text-lg inline-block text-center"
                            style={{ backgroundColor: selectedTheme.colors.primary, textDecoration: 'none', textShadow }}
                          >
                            {cta}
                          </a>
                        ) : (
                          <button
                            className="mx-auto px-10 py-3 rounded-2xl font-semibold text-white shadow-lg text-lg"
                            style={{ backgroundColor: selectedTheme.colors.primary, textShadow }}
                          >
                            {cta}
                          </button>
                        )}
                      </div>
                      <div className="text-center mt-2">
                        <p className="text-xs opacity-60" style={{ color: selectedTheme.colors.text, textShadow }}>
                          Built with Cold DM Battlecards
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardBuilder;