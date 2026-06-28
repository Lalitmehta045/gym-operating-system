'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { UploadCloud, X, File as FileIcon, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MediaUploaderProps {
  onUpload: (files: File[]) => Promise<void> | void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: Record<string, string[]>;
  className?: string;
  isUploading?: boolean;
}

export function MediaUploader({
  onUpload,
  maxFiles = 1,
  maxSizeMB = 5,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
  },
  className,
  isUploading = false,
}: MediaUploaderProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setError(null);

      if (fileRejections.length > 0) {
        const err = fileRejections[0].errors[0];
        if (err.code === 'file-too-large') {
          setError(`File is too large. Max size is ${maxSizeMB}MB.`);
        } else if (err.code === 'too-many-files') {
          setError(`Too many files. Max allowed is ${maxFiles}.`);
        } else {
          setError(err.message);
        }
        return;
      }

      const newPreviews = acceptedFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));

      if (maxFiles === 1) {
        setPreviews(newPreviews);
      } else {
        setPreviews((prev) => {
          const combined = [...prev, ...newPreviews];
          return combined.slice(0, maxFiles);
        });
      }
    },
    [maxFiles, maxSizeMB]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: maxSizeMB * 1024 * 1024,
    accept,
    disabled: isUploading,
  });

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const newPrev = [...prev];
      URL.revokeObjectURL(newPrev[index].url);
      newPrev.splice(index, 1);
      return newPrev;
    });
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;
    try {
      await onUpload(previews.map((p) => p.file));
      previews.forEach((p) => URL.revokeObjectURL(p.url));
      setPreviews([]);
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative overflow-hidden flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-colors cursor-pointer group',
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
          isUploading && 'opacity-50 cursor-not-allowed pointer-events-none'
        )}
      >
        <input {...getInputProps()} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-2 text-center"
        >
          <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <UploadCloud className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm font-medium mt-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-xs text-muted-foreground">
            or click to browse (Max {maxSizeMB}MB)
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-destructive mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {previews.length > 0 && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <AnimatePresence>
              {previews.map((preview, index) => (
                <motion.div
                  key={preview.url}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-square rounded-lg overflow-hidden border bg-muted"
                >
                  {preview.file.type.startsWith('image/') ? (
                    <img
                      src={preview.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2">
                      <FileIcon className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-[10px] text-center truncate w-full text-muted-foreground">
                        {preview.file.name}
                      </span>
                    </div>
                  )}
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePreview(index);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background text-foreground shadow-sm transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm Upload
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
