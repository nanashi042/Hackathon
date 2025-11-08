import React, { useState, useRef } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Upload, Image, Video, Check, Shield, Brain, Heart } from "lucide-react";
import { CherryBlossomIcon } from "./CherryBlossomIcon";
import { analysisService, chatService } from "../services/analysis";
import { analysisBus } from "../services/bus";

export function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const analyzeFiles = async () => {
    if (uploadedFiles.length === 0) return;
    setIsAnalyzing(true);
    try {
      const results = await Promise.all(
        uploadedFiles.map((file) =>
          file.type.startsWith('image/')
            ? analysisService.uploadImage(file)
            : analysisService.uploadVideo(file)
        )
      );

      const failures = results.filter(r => !r.success);
      if (failures.length) {
        alert(`Some uploads failed: ${failures.map(f => f.error).join(', ')}`);
      } else {
        // Normalize backend analysis payloads
        const normalized = results.map(r => {
          const a: any = r.analysis || {};
          if (a && a.emotions) {
            const entries = Object.entries(a.emotions as Record<string, number>);
            const dominant = entries.length ? entries.reduce((m, e) => (e[1] > m[1] ? e : m))[0] : 'n/a';
            return {
              diagnosis: a.diagnosis ?? 'unknown',
              confidence: typeof a.confidence === 'number' ? a.confidence : undefined,
              dominantEmotion: dominant,
            };
          }
          return {
            diagnosis: a?.risk_level ?? 'unknown',
            confidence: a?.emotional_analysis?.emotion_confidence,
            dominantEmotion: a?.emotional_analysis?.dominant_emotion ?? 'n/a',
          };
        });

        const summaries = normalized.map(n => `Diagnosis: ${n.diagnosis ?? 'unknown'} | Dominant Emotion: ${n.dominantEmotion ?? 'n/a'}`);
        const advices = results.map(r => r.advice).filter(Boolean) as string[];
        const msg = [
          summaries.length ? summaries.join('\n') : 'Upload complete. Analysis finished.',
          advices.length ? `\nGuidance:\n${advices.join('\n\n')}` : ''
        ].join('');
        // Show summary prompt to the user
        alert(msg);

        // After user acknowledges, send the same summary to Gemini for next-step recommendations
        let aiRecommendation: string | undefined;
        try {
          const prompt = `Based on the following emotional analysis, provide 3-5 warm, practical next steps without medical claims. Keep it concise and actionable.\n\n${msg}`;
          aiRecommendation = await chatService.generate(prompt);
        } catch (e) {
          aiRecommendation = undefined;
        }

        // Publish to chat page with the exact summary and Gemini recommendation
        analysisBus.publish({
          source: uploadedFiles[0]?.type.startsWith('image/') ? 'image' : 'video',
          summary: msg,
          advice: aiRecommendation,
        });
      }
    } catch (err) {
      console.error(err);
      alert('Unexpected error during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 sm:space-y-6 lg:space-y-8 max-w-5xl mx-auto px-4">
        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
            <CherryBlossomIcon size={32} className="text-sakura sm:hidden" animated />
            <CherryBlossomIcon size={40} className="text-sakura hidden sm:block lg:hidden" animated />
            <CherryBlossomIcon size={48} className="text-sakura hidden lg:block" animated />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gradient-accent">
              Emotion Analysis
            </h2>
            <CherryBlossomIcon size={32} className="text-indigo sm:hidden" animated />
            <CherryBlossomIcon size={40} className="text-indigo hidden sm:block lg:hidden" animated />
            <CherryBlossomIcon size={48} className="text-indigo hidden lg:block" animated />
          </div>
          <p className="text-xs text-mist font-medium tracking-wider uppercase opacity-75 mb-2 sm:mb-3 lg:mb-4">
            AI-Powered Emotional Analysis
          </p>
          <p className="text-soft max-w-4xl mx-auto text-base sm:text-lg lg:text-xl leading-relaxed px-4 sm:px-0">
            Share your visual story with our gentle AI companion. Upload photos or videos to receive 
            compassionate insights and nurturing guidance for your mental wellness journey.
          </p>
        </div>
        
        {/* Feature highlights with Japanese aesthetic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-12 lg:mt-16">
          <div className="glass-morphism rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center hover-lift group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 gradient-glossy-accent rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 lg:mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h3 className="font-semibold text-indigo-dark mb-2 sm:mb-3 text-base sm:text-lg">Secure</h3>
            <p className="text-subtle leading-relaxed text-sm sm:text-base">Your data flows like cherry petals in the wind - beautiful, private, and never permanently captured</p>
          </div>
          <div className="glass-morphism rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center hover-lift group sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 gradient-secondary rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 lg:mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Brain className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h3 className="font-semibold text-indigo-dark mb-2 sm:mb-3 text-base sm:text-lg">Analysis</h3>
            <p className="text-subtle leading-relaxed text-sm sm:text-base">Gentle AI wisdom that understands the subtle emotions hidden within your visual expressions</p>
          </div>
          <div className="glass-morphism rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center hover-lift group sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 gradient-forest rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 lg:mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h3 className="font-semibold text-indigo-dark mb-2 sm:mb-3 text-base sm:text-lg">Compassion</h3>
            <p className="text-subtle leading-relaxed text-sm sm:text-base">Personalized care that nurtures your inner peace like a traditional Japanese garden</p>
          </div>
        </div>
      </div>

      {/* Main Upload Section */}
      <div className="max-w-6xl mx-auto">
        <Card className="gradient-glossy-card border-2 border-dashed border-sakura/30 shadow-2xl hover-lift">
          <CardHeader className="text-center pb-4 sm:pb-6">
            <CardTitle className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 lg:gap-6 text-xl sm:text-2xl lg:text-3xl text-indigo-dark">
              <div className="p-3 sm:p-4 gradient-glossy-accent rounded-2xl sm:rounded-3xl gradient-glow shadow-xl">
                <CherryBlossomIcon size={24} className="text-white sm:hidden" />
                <CherryBlossomIcon size={32} className="text-white hidden sm:block" />
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold">Upload Your Story</div>
                <div className="text-xs sm:text-sm text-mist font-medium opacity-75 mt-1">Media Analysis Portal</div>
              </div>
              <div className="p-3 sm:p-4 gradient-secondary rounded-2xl sm:rounded-3xl gradient-glow shadow-xl">
                <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </CardTitle>
            <CardDescription className="text-soft text-base sm:text-lg mt-3 sm:mt-4 max-w-2xl mx-auto px-4 sm:px-0">
              Like floating cherry blossoms, let your memories drift gently into our caring hands
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
            <div
              className={`relative border-2 border-dashed rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-20 text-center transition-all duration-500 ${
                dragActive
                  ? 'border-sakura bg-sakura/10 scale-105 gradient-glow'
                  : 'border-sakura/30 hover:border-sakura/50 glass-morphism-soft hover:bg-sakura/5'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                <div className="flex justify-center">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-full gradient-glossy-accent flex items-center justify-center gradient-glow shadow-2xl zen-pulse">
                    <CherryBlossomIcon size={24} className="text-white sm:hidden" animated />
                    <CherryBlossomIcon size={32} className="text-white hidden sm:block lg:hidden" animated />
                    <CherryBlossomIcon size={36} className="text-white hidden lg:block" animated />
                  </div>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-indigo-dark text-lg sm:text-xl lg:text-2xl font-medium px-4">
                    Let your memories bloom here, or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sakura hover:text-indigo underline decoration-2 underline-offset-4 transition-all duration-300 font-semibold"
                    >
                      choose files
                    </button>
                  </p>
                  <div className="glass-morphism-soft rounded-xl sm:rounded-2xl p-4 sm:p-6 inline-block max-w-full">
                    <p className="text-subtle text-sm sm:text-base">
                      Supports: JPG, PNG, MP4, MOV • Maximum 50MB per file
                    </p>
                    <p className="text-mist text-xs sm:text-sm mt-2 opacity-75">
                      Supported formats: Photos and Videos • Max 50MB each
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uploaded Files Section */}
      {uploadedFiles.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <Card className="gradient-glossy-card shadow-2xl hover-lift">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl flex flex-col sm:flex-row items-center gap-2 sm:gap-3 lg:gap-4 text-indigo-dark justify-center">
                <CherryBlossomIcon size={20} className="text-sakura zen-pulse sm:hidden" />
                <CherryBlossomIcon size={24} className="text-sakura zen-pulse hidden sm:block" />
                <div className="text-center">
                  <div>Upload Complete ({uploadedFiles.length})</div>
                  <div className="text-xs sm:text-sm text-mist font-medium opacity-75">Files Ready for Analysis</div>
                </div>
                <div className="h-2 w-2 sm:h-3 sm:w-3 bg-gradient-to-r from-sakura to-indigo rounded-full zen-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
              <div className="space-y-3 sm:space-y-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 lg:p-8 glass-morphism-soft rounded-2xl sm:rounded-3xl border border-soft hover:border-sakura/40 transition-all duration-300 hover:scale-[1.02] group hover-lift gap-4 sm:gap-6">
                    <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 w-full sm:w-auto">
                      <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-xl sm:rounded-2xl gradient-glossy-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl flex-shrink-0">
                        {file.type.startsWith('image/') ? (
                          <Image className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                        ) : (
                          <Video className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                        )}
                      </div>
                      <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
                        <p className="font-semibold text-indigo-dark text-base sm:text-lg lg:text-xl truncate">{file.name}</p>
                        <p className="text-subtle text-sm sm:text-base lg:text-lg">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.startsWith('image/') ? 'Image' : 'Video'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-sakura hover:text-indigo hover:bg-sakura/10 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2 sm:py-3 font-medium transition-all duration-300 text-sm sm:text-base lg:text-lg self-end sm:self-center"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 sm:mt-10 lg:mt-12 flex justify-center">
                <Button
                  onClick={analyzeFiles}
                  disabled={isAnalyzing}
                  className={`px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-6 rounded-2xl sm:rounded-3xl text-base sm:text-lg lg:text-xl font-bold transition-all duration-500 w-full sm:w-auto ${
                    isAnalyzing 
                      ? 'opacity-70 cursor-not-allowed scale-95' 
                      : 'gradient-glossy-accent text-white shadow-2xl gradient-glow hover:scale-110 hover:shadow-3xl'
                  }`}
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-3 sm:gap-4">
                      <CherryBlossomIcon size={20} className="text-white zen-pulse sm:hidden" />
                      <CherryBlossomIcon size={24} className="text-white zen-pulse hidden sm:block" />
                      <span>Analyzing Emotions...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Check className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                      <span>Begin AI Analysis</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Privacy Section */}
      <div className="max-w-5xl mx-auto">
        <Card className="glass-morphism border border-soft shadow-2xl hover-lift">
          <CardContent className="p-4 sm:p-6 lg:p-10">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 lg:gap-8">
              <div className="flex-shrink-0 mt-0 sm:mt-2 mx-auto sm:mx-0">
                <CherryBlossomIcon size={24} className="text-sakura zen-pulse sm:hidden" />
                <CherryBlossomIcon size={32} className="text-sakura zen-pulse hidden sm:block" />
              </div>
              <div className="space-y-4 sm:space-y-6 w-full">
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="font-bold text-indigo-dark text-lg sm:text-xl lg:text-2xl mb-2">Privacy & Security Promise</h3>
                  <p className="text-mist text-xs sm:text-sm opacity-75">Your data is protected and confidential</p>
                </div>
                <p className="text-soft leading-relaxed text-sm sm:text-base lg:text-lg text-center sm:text-left">
                  Like the ephemeral beauty of cherry blossoms, your memories are treated with utmost reverence. 
                  Your media flows through our secure channels with bank-level encryption, analyzed with compassion, 
                  then gently released like petals in the wind. Your mental wellness journey remains sacred and confidential.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <div className="flex items-center gap-2 sm:gap-3 glass-morphism-soft rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-sakura to-indigo rounded-full zen-pulse flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <div className="text-xs sm:text-sm text-subtle">Encryption</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 glass-morphism-soft rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-indigo to-mist rounded-full zen-pulse flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <div className="text-xs sm:text-sm text-subtle">HIPAA Compliant</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 glass-morphism-soft rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 sm:col-span-2 lg:col-span-1">  
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-mist to-sakura rounded-full zen-pulse flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <div className="text-xs sm:text-sm text-subtle">Auto-delete 24h</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}