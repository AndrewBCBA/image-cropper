import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import "cropperjs/dist/cropper.css";
import { Upload, Maximize2, MinusSquare, PlusSquare, Download, Copy, Check, CreditCard as Edit3, Crop, QrCode, X, ArrowBigRight } from 'lucide-react';

const SOCIAL_MEDIA_PRESETS = {
  Instagram: [
    { name: 'Profile Photo', width: 320, height: 320 },
    { name: 'Square Post', width: 1080, height: 1080 },
    { name: 'Portrait Post', width: 1080, height: 1350 },
    { name: 'Landscape Post', width: 1080, height: 566 },
    { name: 'Story / Reel Cover', width: 1080, height: 1920 },
    { name: 'Highlight Cover', width: 1080, height: 1080 },
  ],
  Facebook: [
    { name: 'Profile Photo', width: 400, height: 400 },
    { name: 'Page Cover', width: 820, height: 312 },
    { name: 'Group Cover', width: 1640, height: 856 },
    { name: 'Post Image', width: 1200, height: 630 },
    { name: 'Story', width: 1080, height: 1920 },
    { name: 'Event Cover', width: 1920, height: 1005 },
  ],
  'X (Twitter)': [
    { name: 'Profile Photo', width: 400, height: 400 },
    { name: 'Header / Banner', width: 1500, height: 500 },
    { name: 'Post Image', width: 1600, height: 900 },
    { name: 'Link Preview Card', width: 1200, height: 628 },
  ],
  LinkedIn: [
    { name: 'Profile Photo', width: 400, height: 400 },
    { name: 'Personal Cover', width: 1584, height: 396 },
    { name: 'Company Logo', width: 300, height: 300 },
    { name: 'Company Cover', width: 1128, height: 191 },
    { name: 'Post Image', width: 1200, height: 627 },
    { name: 'Article Header', width: 1200, height: 644 },
  ],
  YouTube: [
    { name: 'Channel Profile', width: 800, height: 800 },
    { name: 'Channel Banner', width: 2560, height: 1440 },
    { name: 'Thumbnail', width: 1280, height: 720 },
    { name: 'Shorts Thumbnail', width: 1080, height: 1920 },
  ],
  TikTok: [
    { name: 'Profile Photo', width: 200, height: 200 },
    { name: 'Video / Post', width: 1080, height: 1920 },
    { name: 'Cover Image', width: 1080, height: 1920 },
  ],
  Pinterest: [
    { name: 'Profile Photo', width: 165, height: 165 },
    { name: 'Pin Image', width: 1000, height: 1500 },
    { name: 'Board Cover', width: 600, height: 600 },
  ],
  Snapchat: [
    { name: 'Story / Post', width: 1080, height: 1920 },
    { name: 'Ad Image', width: 1080, height: 1920 },
  ],
  'Common Universal Formats': [
    { name: 'Avatar / Profile Image', width: 512, height: 512 },
    { name: 'Website Hero', width: 1920, height: 1080 },
    { name: 'Blog Featured Image', width: 1200, height: 630 },
    { name: 'Square Icon', width: 1024, height: 1024 },
    { name: 'Email Header', width: 600, height: 200 },
    { name: 'Presentation Slide', width: 1920, height: 1080 },
  ],
};

export function ImageCropper() {
  const [image, setImage] = useState<string>('');
  const [originalFileName, setOriginalFileName] = useState<string>('');
  const [dimensions, setDimensions] = useState({ width: 360, height: 175 });
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [tempDimensions, setTempDimensions] = useState({ width: 360, height: 175 });
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [coffeeVisible, setCoffeeVisible] = useState(false);
  const cropperRef = useRef<any>(null);
  const coffeeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const width = parseInt(urlParams.get('width') || '360');
    const height = parseInt(urlParams.get('height') || '175');
    
    if (width > 0 && height > 0) {
      setDimensions({ width, height });
      setTempDimensions({ width, height });
    }
  }, []);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !coffeeVisible) {
          setCoffeeVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (coffeeRef.current) {
      observer.observe(coffeeRef.current);
    }

    return () => {
      if (coffeeRef.current) {
        observer.unobserve(coffeeRef.current);
      }
    };
  }, [coffeeVisible]);


  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCropData = () => {
    if (cropperRef.current?.cropper) {
      const canvas = cropperRef.current.cropper.getCroppedCanvas({
        width: dimensions.width,
        height: dimensions.height,
      });
      
      // Create filename from original name
      let downloadName = 'image';
      if (originalFileName) {
        // Remove extension from original filename
        const nameWithoutExt = originalFileName.replace(/\.[^/.]+$/, '');
        downloadName = `${nameWithoutExt}_cropped_${dimensions.width}x${dimensions.height}`;
      } else {
        downloadName = `cropped-image-${dimensions.width}x${dimensions.height}`;
      }
      
      const link = document.createElement('a');
      link.download = `${downloadName}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const zoomIn = () => {
    cropperRef.current?.cropper.zoom(0.1);
  };

  const zoomOut = () => {
    cropperRef.current?.cropper.zoom(-0.1);
  };

  const refreshPreview = () => {
    if (cropperRef.current?.cropper) {
      cropperRef.current.cropper.reset();
    }
  };

  const openNewWindow = () => {
    const params = `?width=${dimensions.width}&height=${dimensions.height}`;
    const currentUrl = window.location.origin + window.location.pathname + params;
    window.open(currentUrl, '_blank');
  };

  const getCurrentUrl = () => {
    const params = `?width=${dimensions.width}&height=${dimensions.height}`;
    return window.location.origin + window.location.pathname + params;
  };

  const openQRModal = () => {
    setShowQRModal(true);
  };

  const closeQRModal = () => {
    setShowQRModal(false);
  };

  const openSocialModal = () => {
    setShowSocialModal(true);
  };

  const closeSocialModal = () => {
    setShowSocialModal(false);
  };

  const selectSocialPreset = (preset: { width: number; height: number }) => {
    setDimensions(preset);
    setTempDimensions(preset);
    setIsEditing(false);

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('width', preset.width.toString());
    url.searchParams.set('height', preset.height.toString());
    window.history.replaceState({}, '', url.toString());

    closeSocialModal();
  };

  const handleDimensionChange = (field: 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || 0;
    setTempDimensions(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const applyDimensions = () => {
    if (tempDimensions.width > 0 && tempDimensions.height > 0) {
      setDimensions(tempDimensions);
      setIsEditing(false);
      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set('width', tempDimensions.width.toString());
      url.searchParams.set('height', tempDimensions.height.toString());
      window.history.replaceState({}, '', url.toString());
    }
  };

  const cancelEdit = () => {
    setTempDimensions(dimensions);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 md:py-12">
      <div className="max-w-5xl mx-auto md:px-6">
        <div className="md:bg-white/80 md:backdrop-blur-sm md:rounded-2xl md:shadow-2xl md:border md:border-white/20 overflow-hidden">
          <div className="text-center mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 pb-8 md:pb-12 pt-4 md:pt-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Crop className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent leading-normal py-2">
                EasyCrop.app
              </h1>
            </div>
            <p className="text-xl text-gray-700 mb-4 font-medium px-4">
              EasyCrop.app is a simple, focused tool built to do one thing exceptionally well.
            </p>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed mb-6 md:mb-8 px-4">
              Crop and resize your images to exact pixel dimensions quickly and accurately.
            </p>

            <div className="flex items-start md:items-center justify-center gap-6 mt-6 md:mt-8 mb-1 md:mb-0 max-w-3xl mx-auto px-4">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                  1
                </div>
                <p className="text-sm font-semibold text-gray-700">Upload Image</p>
              </div>
              <div className="flex-shrink-0 hidden md:block">
                <ArrowBigRight className="w-14 h-14 text-blue-400 -mt-6" />
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                  2
                </div>
                <p className="text-sm font-semibold text-gray-700">Pan and Zoom to Select</p>
              </div>
              <div className="flex-shrink-0 hidden md:block">
                <ArrowBigRight className="w-14 h-14 text-blue-400 -mt-6" />
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                  3
                </div>
                <p className="text-sm font-semibold text-gray-700">Download</p>
              </div>
            </div>
          </div>

          <div className="px-4 md:px-8 pt-0 md:py-6">
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div className="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto">
                  {isEditing ? (
                    <div className="flex flex-col md:flex-row md:flex-wrap items-center gap-3 md:bg-gray-50 md:px-4 md:py-2 md:rounded-lg md:border w-full md:w-auto">
                      <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
                        <span className="text-sm font-semibold text-gray-700">Width:</span>
                        <input
                          type="number"
                          value={tempDimensions.width}
                          onChange={(e) => handleDimensionChange('width', e.target.value)}
                          className="w-[60px] md:w-20 pl-2 pr-1 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="1"
                        />
                        <span className="text-sm font-semibold text-gray-700">Height:</span>
                        <input
                          type="number"
                          value={tempDimensions.height}
                          onChange={(e) => handleDimensionChange('height', e.target.value)}
                          className="w-[60px] md:w-20 pl-2 pr-1 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="1"
                        />
                        <span className="text-sm font-medium text-gray-600 hidden md:inline">pixels</span>
                      </div>
                      <div className="flex justify-center gap-3 w-full md:w-auto">
                        <button
                          onClick={applyDimensions}
                          className="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
                        >
                          Apply
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 text-sm bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                      <p className="text-sm font-semibold text-gray-800">
                        Output Size: {dimensions.width} x {dimensions.height} pixels
                      </p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-all"
                        title="Edit dimensions"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center md:justify-end gap-3 flex-wrap w-full md:w-auto">
                  <button
                    onClick={openQRModal}
                    className="flex items-center gap-2 text-sm bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 px-3 py-2 rounded-lg transition-all shadow-sm border border-purple-200"
                    title="Show QR code for current settings"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QR Code</span>
                  </button>
                  <button
                    onClick={openNewWindow}
                    className="flex items-center gap-2 text-sm bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-700 px-3 py-2 rounded-lg transition-all shadow-sm border border-blue-200"
                    title="Open in new window with current settings"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>New Window</span>
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md border-l-4 border-blue-200 hidden md:block">
                Use URL parameters to customize dimensions: ?width=400&height=200. Click "New Window" to bookmark specific settings.
              </p>
              <div className="text-center mt-3">
                <p className="text-sm text-gray-600">
                  Cropping for{' '}
                  <button
                    onClick={openSocialModal}
                    className="text-blue-600 hover:text-blue-700 font-semibold underline hover:no-underline"
                  >
                    Social Media
                  </button>
                  ?
                </p>
              </div>
            </div>

            {!image ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 md:p-16 text-center bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 md:mx-8 mb-6 md:mb-8">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={onFileChange}
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
                      <Upload className="w-12 h-12 text-white" />
                    </div>
                    <span className="text-lg font-medium text-gray-700">
                      Click to upload <span className="hidden md:inline">or paste an image from clipboard (Ctrl+V)</span>
                    </span>
                    <span className="text-sm text-gray-500 hidden md:block">
                      Supports JPG, PNG, GIF and other common formats
                    </span>
                  </div>
                </label>
              </div>
            ) : (
              <>
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden mb-6 md:mb-8 shadow-lg md:mx-8">
                  <Cropper
                    ref={cropperRef}
                    src={image}
                    style={{ height: 450, width: "100%" }}
                    aspectRatio={dimensions.width/dimensions.height}
                    guides={true}
                    viewMode={1}
                    dragMode="move"
                    scalable={true}
                    zoomable={true}
                  />
                </div>

                <div className="flex justify-center gap-4 mb-6 md:mb-8 md:mx-8">
                  <button
                    onClick={zoomOut}
                    className="p-3 rounded-xl bg-white hover:bg-gray-50 shadow-md border border-gray-200 hover:shadow-lg transition-all"
                    title="Zoom Out"
                  >
                    <MinusSquare className="w-6 h-6 text-gray-600" />
                  </button>
                  <button
                    onClick={zoomIn}
                    className="p-3 rounded-xl bg-white hover:bg-gray-50 shadow-md border border-gray-200 hover:shadow-lg transition-all"
                    title="Zoom In"
                  >
                    <PlusSquare className="w-6 h-6 text-gray-600" />
                  </button>
                  <button
                    onClick={refreshPreview}
                    className="p-3 rounded-xl bg-white hover:bg-gray-50 shadow-md border border-gray-200 hover:shadow-lg transition-all"
                    title="Reset"
                  >
                    <Maximize2 className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                <div className="flex justify-center pb-6 md:pb-8">
                  <button
                    onClick={getCropData}
                    className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    <Download className="w-6 h-6" />
                    Download Cropped Image
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* QR Code Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">QR Code</h3>
                <button
                  onClick={closeQRModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
              <div className="text-center">
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getCurrentUrl())}`}
                    alt="QR Code"
                    className="mx-auto border-2 border-gray-200 rounded-lg shadow-sm"
                  />
                </div>
                <p className="text-base font-medium text-gray-700 mb-2">
                  Scan to open EasyCrop.app with current settings:
                </p>
                <p className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  {dimensions.width} x {dimensions.height} pixels
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Social Media Presets Modal */}
        {showSocialModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
                <h3 className="text-2xl font-bold text-gray-800">Social Media Image Sizes</h3>
                <button
                  onClick={closeSocialModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {Object.entries(SOCIAL_MEDIA_PRESETS).map(([platform, presets]) => (
                  <div key={platform} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-gray-50 to-white">
                    <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {platform}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {presets.map((preset) => (
                        <button
                          key={`${platform}-${preset.name}`}
                          onClick={() => selectSocialPreset(preset)}
                          className="text-left px-4 py-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all shadow-sm hover:shadow-md"
                        >
                          <div className="font-semibold text-gray-800 text-sm">{preset.name}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {preset.width} × {preset.height} pixels
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={coffeeRef} className="mt-4 text-center">
          <p className="text-lg text-gray-700 mb-4 font-medium">
            Enjoying EasyCrop.app?
          </p>
          <a href="https://www.buymeacoffee.com/productcoach" target="_blank" rel="noopener noreferrer" className="inline-block">
            <img
              src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
              alt="Buy Me A Coffee"
              className={`h-[60px] w-[217px] ${coffeeVisible ? 'animate-wobble' : ''}`}
            />
          </a>
        </div>
      </div>
    </div>
  );
}