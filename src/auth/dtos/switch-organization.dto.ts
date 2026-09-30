import { IsMongoId } from 'class-validator';

export class SwitchOrganizationDto {
  @IsMongoId()
  public organization_id: string;
}
