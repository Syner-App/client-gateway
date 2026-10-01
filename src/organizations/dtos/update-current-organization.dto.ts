import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCurrentOrganizationDto {
  /** The slug stays fixed */
  @IsString()
  @IsNotEmpty()
  public name: string;
}
