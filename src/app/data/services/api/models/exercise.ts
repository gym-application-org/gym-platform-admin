import type { DifficultyLevel } from './enum-labels';

export interface Exercise {
  id: number;
  name: string;
  description: string;
  muscleGroup: string;
  equipment: string;
  difficultyLevel: DifficultyLevel;
  videoUrl: string;
  thumbnailUrl: string;
  isActive: boolean;
}

export interface CreateExerciseRequest {
  name: string;
  description: string;
  muscleGroup: string;
  equipment: string;
  difficultyLevel: DifficultyLevel;
  videoUrl: string;
  thumbnailUrl: string;
  isActive: boolean;
}

export interface UpdateExerciseRequest {
  id: number;
  name: string;
  description: string;
  muscleGroup: string;
  equipment: string;
  difficultyLevel: DifficultyLevel;
  videoUrl: string;
  thumbnailUrl: string;
  isActive: boolean;
}
