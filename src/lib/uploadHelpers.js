import uploadService from '@/services/upload.service';

export function extractUploadUrl(response) {
  const data = response?.data;
  return data?.url || data?.upload?.url || data?.path || '';
}

export async function uploadFile(file) {
  const response = await uploadService.upload(file);
  const url = extractUploadUrl(response);
  if (!url) throw new Error('Upload succeeded but no file URL was returned');
  return url;
}
