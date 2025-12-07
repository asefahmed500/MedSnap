
import React, { useRef, useState, useEffect } from 'react';
import { X, Zap, Upload, Image as ImageIcon, Camera, RefreshCw } from 'lucide-react';
import { Language } from '../types';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
  selectedLanguage: Language;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel, selectedLanguage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Initialize Camera
  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      // Check if browser supports mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (mounted) {
          setHasCamera(false);
          setCameraError("Browser does not support camera access. Please use upload.");
        }
        return;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        if (mounted) {
          setStream(mediaStream);
          setHasCamera(true);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err) {
        console.warn("Camera access denied or unavailable:", err);
        if (mounted) {
          setHasCamera(false);
          setCameraError("Camera access denied. Please upload an image.");
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle Capture Logic
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Match canvas size to video stream
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset to allow re-selecting same file
      fileInputRef.current.click();
    }
  };

  const handleShutterClick = () => {
    if (hasCamera) {
      setCountdown(3);
    } else {
      handleUploadClick();
    }
  };

  // Countdown Effect for Camera
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      capturePhoto();
      setCountdown(null);
    }
  }, [countdown]);

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onCapture(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onCapture(file);
      } else {
        alert("Please upload an image file.");
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex flex-col animate-in fade-in duration-300"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* Top Bar */}
      <div className="flex justify-between items-center p-6 text-white z-20">
        <button onClick={onCancel} className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition">
            <X size={24} />
        </button>
        <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
            <span className="text-sm font-medium">{selectedLanguage.nativeName}</span>
        </div>
        <button className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition">
            <Zap size={24} />
        </button>
      </div>

      {/* Main Viewfinder Area */}
      <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
        
        {/* Real Video Feed */}
        {hasCamera ? (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-slate-900">
             <Camera size={64} className="mb-4 opacity-50" />
             <p className="text-lg font-medium">Camera unavailable</p>
             <p className="text-sm opacity-70 mt-1 max-w-xs text-center">{cameraError || "Use the button below or drag & drop an image"}</p>
          </div>
        )}

        {/* Drag Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500/50 z-40 flex items-center justify-center border-4 border-blue-400 border-dashed m-4 rounded-3xl backdrop-blur-sm">
             <div className="text-white text-center">
                <Upload size={64} className="mx-auto mb-2" />
                <p className="text-2xl font-bold">Drop Image Here</p>
             </div>
          </div>
        )}

        {/* Document Guide Frame */}
        <div className="relative w-full aspect-[3/4] max-w-sm rounded-3xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] overflow-hidden z-10 pointer-events-none">
            {!hasCamera && <div className="absolute inset-0 bg-white/5"></div>}
            
            {/* Corner Markers */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#0066F5] rounded-tl-xl"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#0066F5] rounded-tr-xl"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#0066F5] rounded-bl-xl"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#0066F5] rounded-br-xl"></div>
        </div>

        {/* Status Text / Countdown */}
        <div className="absolute bottom-12 text-center w-full z-20 pointer-events-none">
           {countdown !== null && countdown > 0 ? (
               <div className="flex flex-col items-center">
                   <div className="w-20 h-20 rounded-full border-4 border-[#0066F5] flex items-center justify-center text-4xl font-bold text-white mb-2 bg-black/40 backdrop-blur-sm animate-pulse">
                       {countdown}
                   </div>
                   <p className="text-white font-bold text-xl drop-shadow-md">Hold steady...</p>
               </div>
           ) : (
               <p className="text-white/90 font-medium text-lg drop-shadow-md bg-black/30 px-6 py-2 rounded-full inline-block backdrop-blur-sm border border-white/10">
                   {hasCamera ? "Align document within frame" : "Upload document from PC"}
               </p>
           )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-black/80 backdrop-blur-xl p-8 pb-12 rounded-t-[2.5rem] flex justify-between items-center z-20 border-t border-white/10">
         <button 
           onClick={handleUploadClick}
           className="flex flex-col items-center gap-1 text-white hover:text-blue-200 transition-colors group"
         >
           <div className="p-4 rounded-2xl bg-white/10 group-hover:bg-white/20 transition border border-white/10">
             <ImageIcon size={24} />
           </div>
           <span className="text-[10px] font-bold uppercase tracking-wide mt-1">Upload File</span>
         </button>

         {/* Shutter Button - Handles Camera or File Input */}
         <button 
            onClick={handleShutterClick}
            className="w-20 h-20 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/20 relative mx-4"
         >
            <div className="w-16 h-16 bg-white border-2 border-black/10 rounded-full"></div>
            {!hasCamera && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <Upload size={24} />
              </div>
            )}
         </button>

         <button 
           onClick={() => hasCamera ? setHasCamera(false) : window.location.reload()} // Simple reload to re-init camera or reset state
           className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors group"
         >
           <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition">
             <RefreshCw size={24} />
           </div>
           <span className="text-[10px] font-bold uppercase tracking-wide mt-1">Reset</span>
         </button>
      </div>

      {/* Hidden Elements */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
