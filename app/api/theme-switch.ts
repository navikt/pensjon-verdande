import { parseWithZod } from '@conform-to/zod/v4'
import type { ActionFunctionArgs } from 'react-router'
import { data } from 'react-router'
import { ThemeFormSchema } from '~/components/theme-switch/schema'
import { setTheme } from '~/utils/theme.server'

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const submission = parseWithZod(formData, {
    schema: ThemeFormSchema,
  })

  if (submission.status !== 'success') {
    return data({ result: submission.reply() })
  }

  const { theme } = submission.value
  const setThemeHeader = await setTheme(theme)

  return data({ result: submission.reply() }, { headers: { 'Set-Cookie': setThemeHeader } })
}
