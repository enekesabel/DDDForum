import { z } from 'zod';
import { ValidationError } from '../errors';
import { createCommand } from './createCommand';

describe('createCommand', () => {
  it('should successfully parse data matching the schema', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });
    const data = { name: 'John Doe', age: 30 };
    const dto = createCommand(schema, data);
    expect(dto).toEqual({ name: 'John Doe', age: 30 });
  });

  it('should throw a ValidationError if data does not match the schema', () => {
    const schema = z.object({
      name: z.number(),
      age: z.number(),
    });
    const data = { name: 'John Doe', age: 'thirty' };

    // @ts-expect-error: data does not match schema
    expect(() => createCommand(schema, data)).toThrow(ValidationError);
  });
});
