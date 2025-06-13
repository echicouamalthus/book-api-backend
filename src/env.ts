import { z, ZodError } from "zod"
import { config } from 'dotenv'
import { expand } from 'dotenv-expand'

expand(config())

const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(9999),
    BASE_API_URL: z.string().url()
})

export type env = z.infer<typeof EnvSchema>

let env: env

try {
    env = EnvSchema.parse(process.env)
} catch (e) {
    const error  = e as ZodError
    console.error('❌ Invalid environment variables')
    console.error(error.flatten())
    process.exit(1)
}

export default env
