import type { Decorator } from '@storybook/react'
import type React from 'react'
import { createRoutesStub } from 'react-router'
import type { MeResponse } from '~/brukere/brukere'
import Layout from '~/layout'
import { mockMeResponse } from './data'

/**
 * Wraps stories in a React Router context with an empty route at "/".
 * Use for components that rely on router hooks (useNavigate, useLocation, etc.).
 */
export const withRouter: Decorator = (Story) => {
  const Stub = createRoutesStub([
    {
      path: '/',
      Component: Story,
    },
  ])
  return <Stub initialEntries={['/']} />
}

/**
 * Renders a route component inside createRoutesStub with mock loader data.
 * Use in `render` for route pages that consume `loaderData` from props.
 *
 * @example
 * ```tsx
 * export const Default: StoryObj = {
 *   render: () => renderWithLoader(MyPage, { items: [], count: 0 }),
 * }
 * ```
 */
export function renderWithLoader<T>(Component: React.ComponentType<any>, loaderData: T, path = '/') {
  const Stub = createRoutesStub([
    {
      path,
      Component,
      loader: () => loaderData,
    },
  ])
  return <Stub initialEntries={[path]} />
}

/**
 * Renders a route component with mock action data (for pages that display actionData).
 * Wraps the component inside a router context and injects actionData as a prop.
 */
export function renderWithAction<T>(Component: React.ComponentType<any>, actionData: T, path = '/') {
  const Wrapper = (props: any) => <Component {...props} actionData={actionData} />
  const Stub = createRoutesStub([
    {
      path,
      Component: Wrapper,
    },
  ])
  return <Stub initialEntries={[path]} />
}

/**
 * Renders a page component nested inside the Layout wrapper (NavHeader + VenstreMeny).
 * Produces a full-page view with header and sidebar for documentation screenshots.
 *
 * @example
 * ```tsx
 * export const FullPage: StoryObj = {
 *   render: () => renderWithLayout(Dashboard, { items: [], count: 0 }),
 * }
 * ```
 */
export function renderWithLayout<T>(
  Component: React.ComponentType<any>,
  loaderData: T,
  options?: { path?: string; me?: Partial<MeResponse>; env?: string },
) {
  const path = options?.path ?? '/'
  const me = mockMeResponse({
    tilganger: [
      'LESE',
      'SKRIVE',
      'SE_BEHANDLINGER',
      'BATCH_KJORINGER',
      'BEHANDLINGSERIE',
      'REGULERING_LES',
      'AVSTEMMING_LES',
      'INNTEKTSKONTROLL',
      'KONTROLLERE_SAERSKILT_SATS',
      'OMREGN_YTELSER',
      'ADHOC_BREVBESTILLING',
    ],
    verdandeRoller: ['VERDANDE_ADMIN'],
    ...options?.me,
  })

  const Stub = createRoutesStub([
    {
      path: '/',
      Component: Layout as any,
      loader: () => ({
        env: options?.env ?? 'q2',
        me,
        schedulerStatus: { schedulerEnabled: true, schedulerLocal: false },
        darkmode: false,
      }),
      children: [
        {
          path: path === '/' ? undefined : path.replace(/^\//, ''),
          index: path === '/',
          Component,
          loader: () => loaderData,
        },
      ],
    },
  ])
  return <Stub initialEntries={[path]} />
}
