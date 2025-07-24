import React, { useRef, useState, useEffect } from "react";

// Type for SpeechRecognition

const filterPresets = [
  { id: "b1", label: "Grayscale", filter: { grayscale: 100, blur: 0, contrast: 100, sepia: 0, bright: 1 } },
  { id: "b2", label: "Blur", filter: { grayscale: 0, blur: 2, contrast: 100, sepia: 0, bright: 1 } },
  { id: "b3", label: "Contrast", filter: { grayscale: 0, blur: 0, contrast: 150, sepia: 0, bright: 1 } },
  { id: "b4", label: "Sepia", filter: { grayscale: 0, blur: 0, contrast: 100, sepia: 100, bright: 1 } },
  { id: "b5", label: "Reset", filter: { grayscale: 0, blur: 0, contrast: 100, sepia: 0, bright: 1 } },
];

type FilterState = {
  grayscale: number;
  blur: number;
  contrast: number;
  sepia: number;
  bright: number;
};

const defaultFilter: FilterState = {
  grayscale: 0,
  blur: 0,
  contrast: 100,
  sepia: 0,
  bright: 1,
};

interface VoiceImageEditorProps {
  image?: { id: number; src: string; [key: string]: any } | null;
  onImageUpdate?: (updatedImage: any) => void;
}

const VoiceImageEditor: React.FC<VoiceImageEditorProps> = ({ image = null, onImageUpdate }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(image ? image.src : null);
  const [filter, setFilter] = useState<FilterState>({ ...defaultFilter });
  const [activePreset, setActivePreset] = useState<string>("b5");
  const [recognizing, setRecognizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync with selected image
  useEffect(() => {
    if (image && image.src !== imageUrl) {
      setImageUrl(image.src);
      setFilter({ ...defaultFilter });
      setActivePreset("b5");
    }
    if (!image) {
      setImageUrl(null);
      setFilter({ ...defaultFilter });
      setActivePreset("b5");
    }
  }, [image]);

  // Compose CSS filter string
  const filterString = `grayscale(${filter.grayscale}%) blur(${filter.blur}px) contrast(${filter.contrast}%) sepia(${filter.sepia}%) brightness(${filter.bright})`;

  // Handle file input (only if not controlled)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  // Handle filter preset click
  const handlePreset = (id: string) => {
    const preset = filterPresets.find((p) => p.id === id);
    if (preset) {
      setFilter({ ...preset.filter });
      setActivePreset(id);
      if (id === "b5" && image && onImageUpdate && image.originalSrc) {
        setImageUrl(image.originalSrc);
        onImageUpdate({ ...image, src: image.originalSrc });
      }
    }
  };

  // Apply filter and update wall image
  const handleApply = () => {
    if (!imgRef.current || !image || !onImageUpdate) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = imgRef.current.naturalWidth;
    canvas.height = imgRef.current.naturalHeight;
    if (ctx) {
      ctx.filter = filterString;
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
      const newSrc = canvas.toDataURL();
      onImageUpdate({ ...image, src: newSrc });
    }
  };

  // Voice recognition logic
  const startRecognition = () => {
    const SpeechRecognition =
      (typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.onstart = () => {
      setRecognizing(true);
    };
    recognition.onend = () => {
      setRecognizing(false);
    };
    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1][0].transcript.toLowerCase();
      // Voice commands
      if (result.includes("brighten")) {
        setFilter((f) => ({ ...f, bright: Math.min(f.bright + 0.2, 2) }));
        setActivePreset("");
      } else if (result.includes("darken")) {
        setFilter((f) => ({ ...f, bright: Math.max(f.bright - 0.2, 0.2) }));
        setActivePreset("");
      } else if (result.includes("apply")) {
        handleApply();
      } else if (result.includes("black and white")) {
        setFilter((f) => ({ ...f, grayscale: 100, blur: 0, contrast: 100, sepia: 0 }));
        setActivePreset("b1");
      } else if (result.includes("blur")) {
        setFilter((f) => ({ ...f, blur: 2, grayscale: 0, contrast: 100, sepia: 0 }));
        setActivePreset("b2");
      } else if (result.includes("contrast")) {
        setFilter((f) => ({ ...f, contrast: 150, grayscale: 0, blur: 0, sepia: 0 }));
        setActivePreset("b3");
      } else if (result.includes("sepia")) {
        setFilter((f) => ({ ...f, sepia: 100, grayscale: 0, blur: 0, contrast: 100 }));
        setActivePreset("b4");
      } else if (result.includes("reset")) {
        setFilter({ ...defaultFilter });
        setActivePreset("b5");
        if (image && onImageUpdate && image.originalSrc) {
          setImageUrl(image.originalSrc);
          onImageUpdate({ ...image, src: image.originalSrc });
        }
      }
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecognizing(false);
  };

  const handleVoiceButton = () => {
    if (recognizing) {
      stopRecognition();
    } else {
      startRecognition();
    }
  };

  return (
    <div className="max-w-xl mx-auto p-3 bg-white rounded-lg shadow-lg mt-2">
      <h2 className="text-xl font-bold mb-2">Voice Image Editor</h2>
      <div className="flex flex-col items-center gap-2">
        {/* Image Preview */}
        <div className="w-full flex flex-col items-center">
          {imageUrl ? (
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Preview"
              style={{ filter: filterString, maxWidth: "100%", maxHeight: 220 }}
              className="imge rounded shadow"
            />
          ) : (
            <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded text-sm">No image selected</div>
          )}
        </div>
        {/* Controls */}
        <div className="flex gap-1 flex-wrap justify-center mt-1 mb-1">
          {filterPresets.map((preset) => (
            <button
              key={preset.id}
              className={`option px-2 py-1 rounded text-xs border ${activePreset === preset.id ? "bg-indigo-500 text-white active" : "bg-gray-200 text-gray-700"}`}
              style={{ minWidth: 0 }}
              onClick={() => handlePreset(preset.id)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        {/* File input (only if not controlled) */}
        {!image && (
          <div className="flex gap-1 mt-1">
            <button
              className="choose px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Image
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="file-input hidden"
              onChange={handleFileChange}
            />
          </div>
        )}
        {/* Apply button */}
        <div className="flex gap-1 mt-1">
          {image && onImageUpdate && (
            <button
              className="apply px-2 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600"
              onClick={handleApply}
              disabled={!imageUrl}
            >
              Apply to Wall
            </button>
          )}
        </div>
        {/* Voice Recognition */}
        <button
          id="startRecognition"
          className={`mt-2 px-2 py-1 text-xs rounded ${recognizing ? "bg-red-500 actived text-white" : "bg-purple-500 text-white"}`}
          onClick={handleVoiceButton}
          disabled={!imageUrl}
        >
          {recognizing ? "Stop Voice Filtering" : "Start Voice Filtering"}
        </button>
        <div className="text-xs text-gray-500 mt-1 text-center">
          Voice commands: brighten, darken, apply, black and white, blur, contrast, sepia, reset
        </div>
      </div>
    </div>
  );
};

export default VoiceImageEditor; 