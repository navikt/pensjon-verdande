import type { Meta, StoryObj } from '@storybook/react'
import { renderWithLoader } from '../../.storybook/mocks/router'
import ManglendeForeignKeyIndexer from './manglende-foreign-key-indexer'

const mockData = {
  manglendeForeignKeyIndexer: [
    {
      tableName: 'T_VEDTAK',
      foreignKeyName: 'FK_VEDTAK_SAK',
      foreignKeyColumns: 'SAK_ID',
      referencedTableName: 'T_SAK',
      referencedColumns: 'SAK_ID',
    },
    {
      tableName: 'T_KRAV',
      foreignKeyName: 'FK_KRAV_PERSON',
      foreignKeyColumns: 'PERSON_ID',
      referencedTableName: 'T_PERSON',
      referencedColumns: 'PERSON_ID',
    },
  ],
}

const meta: Meta = {
  title: 'Sider/Vedlikehold/Manglende FK-indexer',
  component: ManglendeForeignKeyIndexer,
}

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => renderWithLoader(ManglendeForeignKeyIndexer, mockData),
}

export const Empty: Story = {
  render: () =>
    renderWithLoader(ManglendeForeignKeyIndexer, {
      manglendeForeignKeyIndexer: [],
    }),
}
