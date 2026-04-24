import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { ApiClientService } from '../../services/api/api-client';
import { Page } from '../../services/api/models/page';
import { Member, MembersFilter } from '../../services/api/models/member';
import { MemberRepository } from './member-repository';

@Injectable()
export class MemberRepositoryRemote implements MemberRepository {
  constructor(private apiClient: ApiClientService) {}

  getMembers(filter: MembersFilter): Observable<Result<Page<Member>>> {
    return this.apiClient.getMembers(filter);
  }

  getMemberById(id: string): Observable<Result<Member>> {
    return this.apiClient.getMemberById(id);
  }
}
