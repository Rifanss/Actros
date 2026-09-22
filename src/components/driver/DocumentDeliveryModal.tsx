import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, X, AlertCircle, Upload, ShieldCheck, MapPin, Phone, User, Truck } from 'lucide-react';
import { Delivery } from '../../types';
import { useWaterData } from '../../context/WaterDataContext';

interface DocumentDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  delivery: Delivery | null;
  onSuccess?: () => void;
}

export const DocumentDeliveryModal: React.FC<DocumentDeliveryModalProps> = ({
  isOpen,
  onClose,
  delivery,
  onSuccess,
}) => {
  const { documentDelivery } = useWaterData();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start rear camera stream when modal opens
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (isOpen && !capturedImage) {
      setCameraError(null);
      setIsCapturing(true);

      const startCamera = async () => {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: false,
            });

            activeStream = mediaStream;
            setStream(mediaStream);

            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
              videoRef.current.play().catch((err) => {
                console.warn('Video play error:', err);
              });
            }
          } else {
            setCameraError('الكاميرا المباشرة غير مدعومة في هذا المتصفح، يمكنك التقاط صورة عبر زر الكاميرا أدناه');
          }
        } catch (err: any) {
          console.warn('Camera access error:', err);
          setCameraError('لم نتمكن من فتح الكاميرا المباشرة (قد يتطلب إذناً)، يمكنك استخدام زر التقاط الصورة من هاتفك مباشرة.');
        } finally {
          setIsCapturing(false);
        }
      };

      startCamera();
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, capturedImage]);

  // Clean up stream when closing
  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setNotes('');
    onClose();
  };

  // Capture frame from video element
  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Watermark with order info and timestamp
        const now = new Date();
        const dateStr = now.toLocaleDateString('ar-SA');
        const timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(
          `نبع لتوريد المياه - طلب #${delivery?.order_number || delivery?.sequence_num} - ${dateStr} ${timeStr}`,
          canvas.width - 15,
          canvas.height - 15
        );

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);

        // Stop live stream after capture
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      }
    }
  };

  // Handle native file input fallback (works on iOS & Android camera directly via capture="environment")
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCapturedImage(result);

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
  };

  // Confirm delivery approval
  const handleConfirmDelivery = async () => {
    if (!delivery) return;
    if (!capturedImage) {
      alert('يرجى التقاط صورة إثبات التوريد أولاً');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = documentDelivery({
        deliveryId: delivery.id,
        proofImage: capturedImage,
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
        setCapturedImage(null);
        if (onSuccess) onSuccess();
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !delivery) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#03457a] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sky-400/20 text-sky-200 flex items-center justify-center border border-sky-300/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">توثيق التوريد بالكاميرا</h3>
              <p className="text-[10px] text-sky-200 font-mono">
                طلب رقم: {delivery.order_number || `NB-${delivery.sequence_num}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Details Banner */}
        <div className="bg-sky-50 px-3.5 py-2.5 border-b border-sky-100 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-slate-800 text-[12px]">{delivery.customer_name}</div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              <span>{delivery.location || 'الطائف'}</span>
            </div>
          </div>
          <div className="text-left">
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#03457a] text-white">
              {delivery.supply_type} ({delivery.tank_capacity})
            </span>
            <div className="text-[10px] font-bold text-emerald-700 font-mono mt-0.5">
              {delivery.price} ريال ({delivery.payment_method})
            </div>
          </div>
        </div>

        {/* Camera / Preview Viewport */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 flex flex-col justify-center">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-4/3 flex items-center justify-center border-2 border-dashed border-slate-700">
            {/* Live Video Stream Viewfinder */}
            {!capturedImage && (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Camera Overlay Guide */}
                <div className="absolute inset-0 pointer-events-none border-2 border-white/20 m-4 rounded-xl flex items-center justify-center">
                  <div className="text-center text-white/70 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-xs text-[11px]">
                    وجّه الكاميرا نحو عداد المياه أو موقع الخزان
                  </div>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-4 text-center text-white">
                    <Camera className="w-10 h-10 text-sky-400 mb-2 opacity-80" />
                    <p className="text-xs font-bold mb-1">التقاط صورة من جوالك</p>
                    <p className="text-[10px] text-slate-300 max-w-xs mb-3">{cameraError}</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition"
                    >
                      <Camera className="w-4 h-4" />
                      <span>فتح كاميرا الهاتف</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Captured Photo Preview */}
            {capturedImage && (
              <div className="relative w-full h-full">
                <img
                  src={capturedImage}
                  alt="صورة إثبات التوريد"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>تم التقاط الإثبات</span>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Hidden file input for native camera */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Notes input */}
          {capturedImage && (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                ملاحظة السائق عند التوريد (اختياري):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: تم التعبئة في الخزان الأرضي بنجاح"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200">
          {!capturedImage ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={takeSnapshot}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-98 transition cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>التقاط الصورة 📸</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="فتح كاميرا الجوال مباشرة أو اختيار صورة"
                className="px-3 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">من الجوال</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRetake}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة التصوير</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmDelivery}
                disabled={isSubmitting}
                className="flex-2 py-2.5 bg-[#03457a] hover:bg-[#023561] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isSubmitting ? 'جارٍ الاعتماد...' : 'اعتماد التوريد ✓'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
