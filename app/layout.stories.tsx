import type { Meta, StoryObj } from '@storybook/react'
import { createRoutesStub } from 'react-router'
import { mockMeResponse } from '../.storybook/mocks/data'
import Layout, { ErrorBoundary } from './layout'

const meta: Meta = {
  title: 'Sider/Layout',
}

export default meta
type Story = StoryObj

export const NotFound: Story = {
  tags: ['error-expected'],
  render: () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => null,
        loader: () => {
          throw new Response('Siden ble ikke funnet', { status: 404, statusText: 'Not Found' })
        },
        ErrorBoundary,
      },
    ])
    return <Stub initialEntries={['/']} />
  },
}

export const IkkeTilgang: Story = {
  tags: ['error-expected'],
  render: () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => null,
        loader: () => {
          throw new Response('Du har ikke tilgang til denne operasjonen', {
            status: 403,
            statusText: 'Forbidden',
          })
        },
        ErrorBoundary,
      },
    ])
    return <Stub initialEntries={['/']} />
  },
}

export const BehandlingslosningenAvslaatt: Story = {
  render: () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: Layout as any,
        loader: () => ({
          env: 'q2',
          me: mockMeResponse(),
          schedulerStatus: { schedulerEnabled: false, schedulerLocal: false },
          darkmode: false,
        }),
      },
    ])
    return <Stub initialEntries={['/']} />
  },
}

export const Serverfeil: Story = {
  tags: ['error-expected'],
  render: () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => null,
        loader: () => {
          throw new Response(
            JSON.stringify({
              status: 500,
              message: 'Internal Server Error',
              detail: 'Kunne ikke koble til databasen',
              path: '/api/behandling/123',
              timestamp: '2024-06-01T10:00:00',
            }),
            {
              status: 500,
              statusText: 'Internal Server Error',
              headers: { 'Content-Type': 'application/json' },
            },
          )
        },
        ErrorBoundary,
      },
    ])
    return <Stub initialEntries={['/']} />
  },
}
