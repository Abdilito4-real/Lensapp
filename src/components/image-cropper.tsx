
'use client';

import { useState, useRef } from 'react';
import ReactCrop, {
  type Crop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from './ui/dialog';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageUrl: string) => void;
  onClose: () => void;
}

// Function to crop the image client-side
function getCroppedImg(
  image: HTMLImageElement,
  crop: Crop,
): Promise<string> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return Promise.reject('Could not get canvas context');
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject('Canvas is empty');
        return;
      }
      const fileUrl = window.URL.createObjectURL(blob);
      resolve(fileUrl);
    }, 'image/jpeg');
  });
}

export function ImageCropper({
  imageSrc,
  onCropComplete,
  onClose,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    setCrop({
      unit: '%',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });
  }

  async function handleCrop() {
    if (completedCrop && imgRef.current) {
      try {
        const croppedImageUrl = await getCroppedImg(
          imgRef.current,
          completedCrop
        );
        onCropComplete(croppedImageUrl);
      } catch (e) {
        console.error('Crop failed', e);
      }
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Photo</DialogTitle>
          <DialogDescription>
            Adjust the selection to crop your photo.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center my-4">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={c => setCompletedCrop(c)}
            className="max-h-[60vh]"
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={imageSrc}
              onLoad={onImageLoad}
              style={{ maxHeight: '60vh' }}
            />
          </ReactCrop>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCrop}>Apply Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
