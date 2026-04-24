import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { Page } from '../../services/api/models/page';
import { Exercise, CreateExerciseRequest, UpdateExerciseRequest } from '../../services/api/models/exercise';

export interface ExerciseRepository {
  getExercises(pageIndex: number, pageSize: number): Observable<Result<Page<Exercise>>>;
  createExercise(request: CreateExerciseRequest): Observable<Result<Exercise>>;
  updateExercise(id: number, request: UpdateExerciseRequest): Observable<Result<Exercise>>;
  deleteExercise(id: number): Observable<Result<void>>;
}
