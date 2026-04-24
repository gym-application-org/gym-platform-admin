import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { ApiClientService } from '../../services/api/api-client';
import { Page } from '../../services/api/models/page';
import { Exercise, CreateExerciseRequest, UpdateExerciseRequest } from '../../services/api/models/exercise';
import { ExerciseRepository } from './exercise-repository';

@Injectable()
export class ExerciseRepositoryRemote implements ExerciseRepository {
  constructor(private apiClient: ApiClientService) {}

  getExercises(pageIndex: number, pageSize: number): Observable<Result<Page<Exercise>>> {
    return this.apiClient.getExercises(pageIndex, pageSize);
  }

  createExercise(request: CreateExerciseRequest): Observable<Result<Exercise>> {
    return this.apiClient.createExercise(request);
  }

  updateExercise(id: number, request: UpdateExerciseRequest): Observable<Result<Exercise>> {
    return this.apiClient.updateExercise(id, request);
  }

  deleteExercise(id: number): Observable<Result<void>> {
    return this.apiClient.deleteExercise(id);
  }
}
