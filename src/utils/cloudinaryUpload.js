import axiosInstance from '../api/axiosInstance';

async function getCloudinarySignature(resourceType) {
  const { data } = await axiosInstance.post('/uploads/cloudinary-sign', { resourceType });
  return data.data;
}

export async function uploadFileToCloudinary(file, resourceType = 'image', onProgress) {
  const sign = await getCloudinarySignature(resourceType);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sign.apiKey);
  formData.append('timestamp', String(sign.timestamp));
  formData.append('signature', sign.signature);
  formData.append('folder', sign.folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${sign.cloudName}/${sign.resourceType}/upload`;

  const result = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300 && json.secure_url) {
          resolve({ url: json.secure_url, publicId: json.public_id });
          return;
        }
        reject(new Error(json.error?.message || 'Cloudinary upload failed'));
      } catch (err) {
        reject(err);
      }
    };
    xhr.onerror = () => reject(new Error('Cloudinary upload network error'));
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
    }
    xhr.send(formData);
  });

  return result;
}

export async function uploadFilesToCloudinary(files, resourceType = 'image', onProgress) {
  const queue = Array.from(files || []).filter(Boolean);
  const uploaded = [];

  for (let index = 0; index < queue.length; index += 1) {
    const file = queue[index];
    uploaded.push(
      await uploadFileToCloudinary(file, resourceType, (fileProgress) => {
        onProgress?.(Math.round(((index + fileProgress / 100) / Math.max(queue.length, 1)) * 100));
      })
    );
    onProgress?.(Math.round(((index + 1) / Math.max(queue.length, 1)) * 100));
  }

  return uploaded;
}

export async function uploadDailyReportMedia({ photos = [], videos = [], onProgress } = {}) {
  const photoFiles = photos.map((item) => item.file).filter(Boolean);
  const videoFiles = videos.map((item) => item.file).filter(Boolean);
  const total = photoFiles.length + videoFiles.length;
  let completed = 0;

  const bump = () => {
    completed += 1;
    onProgress?.(Math.round((completed / Math.max(total, 1)) * 100));
  };

  const uploadedPhotos = [];
  for (const file of photoFiles) {
    uploadedPhotos.push(await uploadFileToCloudinary(file, 'image'));
    bump();
  }

  const uploadedVideos = [];
  for (const file of videoFiles) {
    uploadedVideos.push(await uploadFileToCloudinary(file, 'video'));
    bump();
  }

  return { photos: uploadedPhotos, videos: uploadedVideos };
}
