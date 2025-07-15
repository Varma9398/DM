// Canvas-based rendering utilities for proper export
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
  }

  // Clear canvas with background
  clear(background: string) {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Handle gradient backgrounds
    if (background.includes('gradient')) {
      const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
      // Parse gradient - simplified for common cases
      if (background.includes('667eea') && background.includes('764ba2')) {
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
      } else if (background.includes('2c3e50') && background.includes('4a6741')) {
        gradient.addColorStop(0, '#2c3e50');
        gradient.addColorStop(1, '#4a6741');
      } else if (background.includes('74b9ff') && background.includes('81ecec')) {
        gradient.addColorStop(0, '#74b9ff');
        gradient.addColorStop(1, '#81ecec');
      } else if (background.includes('0c0c0c') && background.includes('1e1e1e')) {
        gradient.addColorStop(0, '#0c0c0c');
        gradient.addColorStop(1, '#1e1e1e');
      } else if (background.includes('f8f9fa') && background.includes('e9ecef')) {
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
      } else if (background.includes('0d1117') && background.includes('1a1a2e')) {
        gradient.addColorStop(0, '#0d1117');
        gradient.addColorStop(1, '#1a1a2e');
      } else {
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
      }
      this.ctx.fillStyle = gradient;
    } else {
      this.ctx.fillStyle = background;
    }
    
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  // Draw text with proper styling
  drawText(text: string, x: number, y: number, options: {
    fontSize: number;
    fontFamily: string;
    color: string;
    textAlign?: CanvasTextAlign;
    maxWidth?: number;
    lineHeight?: number;
  }) {
    this.ctx.font = `${options.fontSize}px ${options.fontFamily}`;
    this.ctx.fillStyle = options.color;
    this.ctx.textAlign = options.textAlign || 'center';
    
    if (options.maxWidth && text.length > 50) {
      // Multi-line text
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = this.ctx.measureText(testLine);
        
        if (metrics.width > options.maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      
      const lineHeight = options.lineHeight || options.fontSize * 1.4;
      const totalHeight = lines.length * lineHeight;
      const startY = y - (totalHeight / 2) + (lineHeight / 2);
      
      lines.forEach((line, index) => {
        this.ctx.fillText(line, x, startY + (index * lineHeight));
      });
    } else {
      this.ctx.fillText(text, x, y);
    }
  }

  // Draw rounded rectangle
  drawRoundedRect(x: number, y: number, width: number, height: number, radius: number, fillStyle: string) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fillStyle = fillStyle;
    this.ctx.fill();
  }

  // Draw image (logo)
  async drawImage(src: string, x: number, y: number, width: number, height: number) {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.ctx.drawImage(img, x, y, width, height);
        resolve();
      };
      img.onerror = () => resolve(); // Continue even if image fails
      img.src = src;
    });
  }

  // Get canvas as blob
  getBlob(type: string = 'image/png', quality: number = 1): Promise<Blob> {
    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => {
        resolve(blob!);
      }, type, quality);
    });
  }

  // Get canvas element
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}

// Animation frame generator
export class AnimationFrameGenerator {
  private renderer: CanvasRenderer;
  private totalFrames: number;
  private fps: number;

  constructor(width: number, height: number, duration: number, fps: number = 30) {
    this.renderer = new CanvasRenderer(width, height);
    this.totalFrames = Math.ceil((duration / 1000) * fps);
    this.fps = fps;
  }

  // Generate frames for typewriter animation
  async generateTypewriterFrames(
    title: string,
    message: string,
    cta: string,
    theme: any,
    logo?: string
  ): Promise<Blob[]> {
    const frames: Blob[] = [];
    const titleChars = title.split('');
    const messageChars = message.split('');
    const ctaChars = cta.split('');
    
    // Animation timing
    const titleStartFrame = 10;
    const messageStartFrame = titleStartFrame + titleChars.length + 10;
    const ctaStartFrame = messageStartFrame + messageChars.length + 10;
    const totalAnimationFrames = ctaStartFrame + ctaChars.length + 20;
    
    for (let frame = 0; frame < Math.max(this.totalFrames, totalAnimationFrames); frame++) {
      // Clear canvas
      this.renderer.clear(theme.colors.background);
      
      // Draw logo if provided
      if (logo) {
        await this.renderer.drawImage(logo, 30, 30, 48, 48);
      }
      
      // Draw title (typewriter effect)
      let currentTitle = '';
      if (frame >= titleStartFrame) {
        const titleProgress = Math.min(frame - titleStartFrame, titleChars.length);
        currentTitle = titleChars.slice(0, titleProgress).join('');
        if (titleProgress < titleChars.length) currentTitle += '|'; // Cursor
      }
      
      if (currentTitle) {
        this.renderer.drawText(currentTitle, this.renderer.getCanvas().width / 2, 150, {
          fontSize: 32,
          fontFamily: theme.font,
          color: theme.colors.text,
          textAlign: 'center'
        });
      }
      
      // Draw message (typewriter effect)
      let currentMessage = '';
      if (frame >= messageStartFrame) {
        const messageProgress = Math.min(frame - messageStartFrame, messageChars.length);
        currentMessage = messageChars.slice(0, messageProgress).join('');
        if (messageProgress < messageChars.length) currentMessage += '|'; // Cursor
      }
      
      if (currentMessage) {
        this.renderer.drawText(currentMessage, this.renderer.getCanvas().width / 2, this.renderer.getCanvas().height / 2, {
          fontSize: 16,
          fontFamily: theme.font,
          color: theme.colors.text,
          textAlign: 'center',
          maxWidth: this.renderer.getCanvas().width - 60,
          lineHeight: 24
        });
      }
      
      // Draw CTA button (typewriter effect)
      let currentCta = '';
      if (frame >= ctaStartFrame) {
        const ctaProgress = Math.min(frame - ctaStartFrame, ctaChars.length);
        currentCta = ctaChars.slice(0, ctaProgress).join('');
        if (ctaProgress < ctaChars.length) currentCta += '|'; // Cursor
      }
      
      if (currentCta) {
        const buttonY = this.renderer.getCanvas().height - 120;
        const buttonWidth = 200;
        const buttonHeight = 50;
        const buttonX = (this.renderer.getCanvas().width - buttonWidth) / 2;
        
        // Draw button background
        this.renderer.drawRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12, theme.colors.primary);
        
        // Draw button text
        this.renderer.drawText(currentCta, this.renderer.getCanvas().width / 2, buttonY + 32, {
          fontSize: 16,
          fontFamily: theme.font,
          color: '#ffffff',
          textAlign: 'center'
        });
      }
      
      // Draw footer
      this.renderer.drawText('Built with Cold DM Battlecards', this.renderer.getCanvas().width / 2, this.renderer.getCanvas().height - 30, {
        fontSize: 12,
        fontFamily: theme.font,
        color: theme.colors.text,
        textAlign: 'center'
      });
      
      // Get frame as blob
      const blob = await this.renderer.getBlob('image/png');
      frames.push(blob);
    }
    
    return frames;
  }

  // Generate frames for other animations
  async generateAnimationFrames(
    title: string,
    message: string,
    cta: string,
    theme: any,
    animationType: string,
    logo?: string
  ): Promise<Blob[]> {
    if (animationType === 'typewriter') {
      return this.generateTypewriterFrames(title, message, cta, theme, logo);
    }
    
    const frames: Blob[] = [];
    
    for (let frame = 0; frame < this.totalFrames; frame++) {
      const progress = frame / this.totalFrames;
      
      // Clear canvas
      this.renderer.clear(theme.colors.background);
      
      // Calculate animation values based on type
      let opacity = 1;
      let scale = 1;
      let translateX = 0;
      let translateY = 0;
      
      switch (animationType) {
        case 'fade':
          opacity = Math.min(1, progress * 2);
          scale = 0.8 + (0.2 * Math.min(1, progress * 2));
          break;
        case 'swipe':
          translateX = -100 * (1 - Math.min(1, progress * 1.5));
          opacity = Math.min(1, progress * 1.5);
          break;
        case 'punch':
          const bounce = progress < 0.5 ? 
            4 * progress * progress * progress : 
            1 - Math.pow(-2 * progress + 2, 3) / 2;
          scale = 0.8 + (0.4 * bounce);
          opacity = Math.min(1, progress * 2);
          break;
        case 'glitch':
          translateX = progress < 0.8 ? (Math.sin(progress * 20) * 5) : 0;
          opacity = progress < 0.2 ? progress * 5 : 1;
          break;
      }
      
      // Apply transformations by adjusting drawing positions
      const centerX = this.renderer.getCanvas().width / 2 + translateX;
      const centerY = this.renderer.getCanvas().height / 2 + translateY;
      
      // Draw logo if provided
      if (logo && opacity > 0) {
        await this.renderer.drawImage(logo, 30 + translateX, 30 + translateY, 48 * scale, 48 * scale);
      }
      
      // Draw title
      if (opacity > 0) {
        this.renderer.getCanvas().getContext('2d')!.globalAlpha = opacity;
        this.renderer.drawText(title, centerX, 150 * scale + translateY, {
          fontSize: 32 * scale,
          fontFamily: theme.font,
          color: theme.colors.text,
          textAlign: 'center'
        });
      }
      
      // Draw message
      if (opacity > 0) {
        this.renderer.drawText(message, centerX, centerY, {
          fontSize: 16 * scale,
          fontFamily: theme.font,
          color: theme.colors.text,
          textAlign: 'center',
          maxWidth: (this.renderer.getCanvas().width - 60) * scale,
          lineHeight: 24 * scale
        });
      }
      
      // Draw CTA button
      if (opacity > 0) {
        const buttonY = (this.renderer.getCanvas().height - 120) * scale + translateY;
        const buttonWidth = 200 * scale;
        const buttonHeight = 50 * scale;
        const buttonX = (this.renderer.getCanvas().width - buttonWidth) / 2 + translateX;
        
        this.renderer.drawRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 12 * scale, theme.colors.primary);
        this.renderer.drawText(cta, centerX, buttonY + 32 * scale, {
          fontSize: 16 * scale,
          fontFamily: theme.font,
          color: '#ffffff',
          textAlign: 'center'
        });
      }
      
      // Reset alpha
      this.renderer.getCanvas().getContext('2d')!.globalAlpha = 1;
      
      // Draw footer
      this.renderer.drawText('Built with Cold DM Battlecards', this.renderer.getCanvas().width / 2, this.renderer.getCanvas().height - 30, {
        fontSize: 12,
        fontFamily: theme.font,
        color: theme.colors.text,
        textAlign: 'center'
      });
      
      const blob = await this.renderer.getBlob('image/png');
      frames.push(blob);
    }
    
    return frames;
  }
}