import { IsEnum } from 'class-validator';

export enum DROPSHIPPER_REVIEW_STATUS {
  approve = 'approve',
  reject = 'reject',
}

export class ReviewDropshipperDto {
  @IsEnum(DROPSHIPPER_REVIEW_STATUS, {
    message: `Status must be "${DROPSHIPPER_REVIEW_STATUS.approve}" or "${DROPSHIPPER_REVIEW_STATUS.reject}"`,
  })
  status!: DROPSHIPPER_REVIEW_STATUS;
}