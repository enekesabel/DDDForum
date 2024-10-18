import { z } from 'zod';
import { Request } from 'express';
import { RequestValidator } from '../../shared';
import { CreateUserCommandSchema } from './CreateUserCommand';

const RequestParamsSchema = z.object({
  userId: z
    .string()
    .regex(/^[0-9]+$/)
    .or(z.number())
    .transform(Number),
});
const RequestBodySchema = CreateUserCommandSchema.partial();
const UpdateUserCommandSchema = RequestBodySchema.merge(RequestParamsSchema);

type Props = z.infer<typeof UpdateUserCommandSchema>;

export class UpdateUserCommand {
  static FromRequest(request: Request) {
    const { userId } = RequestValidator.ValidateParams(request, RequestParamsSchema);
    const body = RequestValidator.ValidateRequestBody(request, RequestBodySchema);
    return new UpdateUserCommand({ userId, ...body });
  }

  static Create(value: Props) {
    return new UpdateUserCommand(value);
  }

  readonly value: Props;

  private constructor(value: Props) {
    this.value = UpdateUserCommandSchema.parse(value);
  }
}
