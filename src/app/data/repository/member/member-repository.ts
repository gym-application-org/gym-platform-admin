import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { Page } from '../../services/api/models/page';
import { Member, MembersFilter } from '../../services/api/models/member';

export interface MemberRepository {
  getMembers(filter: MembersFilter): Observable<Result<Page<Member>>>;
  getMemberById(id: string): Observable<Result<Member>>;
}
