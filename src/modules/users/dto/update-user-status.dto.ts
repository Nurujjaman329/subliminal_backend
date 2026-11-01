import { IsIn } from 'class-validator';
import { UserStatus } from '../../../common/constants/roles';

export class UpdateUserStatusDto {
  @IsIn([UserStatus.ACTIVE, UserStatus.DISABLED], {
    message: 'status must be active or disabled',
  })
  status!: UserStatus.ACTIVE | UserStatus.DISABLED;
}
