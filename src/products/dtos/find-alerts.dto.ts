import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dtos/pagination.dto.ts';
import { enumMessage, enumValues } from '../../common/index.ts';
import { StatusAlert } from '../../generated/proto/products.ts';

const ALERT_STATUSES = enumValues(StatusAlert);

export class FindAlertsDto extends PaginationDto {
    @IsIn(ALERT_STATUSES, { message: enumMessage('estado', ALERT_STATUSES) })
    @IsOptional()
    public estado?: StatusAlert;
}
