import type { Photo, Project } from '../types';

/**
 * Backup data structure v2.0
 */
export interface BackupData {
  version: string;
  exportDate: number;
  projects: ProjectBackup[];
  photos: PhotoBackup[];
}

export interface ProjectBackup {
  id: string;
  name: string;
  type: string;
  createdAt: number;
  updatedAt: number;
  coverPhotoId?: string;
  settings: {
    reminderEnabled: boolean;
    reminderTime?: { hour: number; minute: number };
  };
}

export interface PhotoBackup {
  id: string;
  dataUrl: string;
  timestamp: number;
  date: string;
  projectId: string;
  aspectRatio?: 'video' | 'square' | 'portrait';
}

/**
 * Export photos to JSON file
 */
export const exportBackup = async (photos: readonly Photo[], projects: readonly Project[]): Promise<void> => {
  if (photos.length === 0 && projects.length === 0) {
    throw new Error('내보낼 데이터가 없습니다.');
  }

  const backupData: BackupData = {
    version: '2.0.0',
    exportDate: Date.now(),
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      type: project.type,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      coverPhotoId: project.coverPhotoId,
      settings: project.settings,
    })),
    photos: photos.map((photo) => ({
      id: photo.id,
      dataUrl: photo.dataUrl,
      timestamp: photo.timestamp,
      date: photo.date,
      projectId: photo.projectId,
      aspectRatio: photo.aspectRatio,
    })),
  };

  const json = JSON.stringify(backupData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `daily-pose-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import photos from JSON file
 */
export const importBackup = (file: File): Promise<{ photos: PhotoBackup[]; projects: ProjectBackup[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const backupData: BackupData = JSON.parse(json);

        // Validate backup data structure
        if (!backupData.version || !Array.isArray(backupData.photos)) {
          throw new Error('잘못된 백업 파일 형식입니다.');
        }

        resolve({
          photos: backupData.photos,
          projects: backupData.projects || [],
        });
      } catch {
        reject(new Error('백업 파일을 읽는 중 오류가 발생했습니다.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    };

    reader.readAsText(file);
  });
};

/**
 * Validate backup photo count
 */
export const validateBackupSize = (data: { photos: PhotoBackup[]; projects?: ProjectBackup[] }, maxSize = 100): boolean => {
  return data.photos.length <= maxSize;
};

/**
 * Get backup file info
 */
export const getBackupInfo = (backupData: BackupData): {
  photoCount: number;
  projectCount: number;
  exportDate: string;
  version: string;
} => {
  return {
    photoCount: backupData.photos.length,
    projectCount: backupData.projects?.length || 0,
    exportDate: new Date(backupData.exportDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    version: backupData.version,
  };
};
