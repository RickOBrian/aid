import './FolderTreeDiagram.css'

import type { CSSProperties, ReactNode } from 'react'

interface TreeToken {
  type: 'token'
  name: string
  hint?: string
}

interface TreeFolder {
  type: 'folder'
  name: string
  hint?: string
  children: TreeNode[]
}

type TreeNode = TreeToken | TreeFolder

interface CategoryColumn {
  id: string
  label: string
  bg: string
  border: string
  groups: TreeFolder[]
}

function TreeBranch({ node, segments }: { node: TreeNode; segments: string[] }) {
  if (node.type === 'token') {
    const tokenName = [...segments, node.name].join('-')
    return (
      <div className="folder-tree__token">
        <span className="folder-tree__token-name">{tokenName}</span>
        {node.hint ? <span className="folder-tree__hint">{node.hint}</span> : null}
      </div>
    )
  }

  const folderSegment = node.name.replace(/^\//, '')

  return (
    <div className="folder-tree__branch">
      <div className="folder-tree__folder">
        <span className="folder-tree__folder-name">{node.name}</span>
        {node.hint ? <span className="folder-tree__hint">{node.hint}</span> : null}
      </div>
      <div className="folder-tree__children">
        {node.children.map((child) => (
          <TreeBranch
            key={`${node.name}-${child.type === 'folder' ? child.name : child.name}`}
            node={child}
            segments={[...segments, folderSegment]}
          />
        ))}
      </div>
    </div>
  )
}

function CategoryColumnView({ column }: { column: CategoryColumn }) {
  return (
    <div
      className="folder-tree__column"
      style={
        {
          '--folder-column-bg': column.bg,
          '--folder-column-border': column.border,
        } as CSSProperties
      }
    >
      <div className="folder-tree__column-header">
        <span className="folder-tree__category-label">{column.label}</span>
        <span className="folder-tree__category-icon" aria-hidden="true" />
      </div>
      <div className="folder-tree__groups">
        {column.groups.map((group) => (
          <div key={group.name} className="folder-tree__group">
            <TreeBranch node={group} segments={[column.id]} />
          </div>
        ))}
      </div>
    </div>
  )
}

const BASE_GROUP = (prefix: string): TreeFolder => ({
  type: 'folder',
  name: '/base',
  hint: 'поверхности, на которых располагаются элементы',
  children: [
    { type: 'token', name: 'main', hint: prefix === 'bg' ? 'основная поверхность' : undefined },
    { type: 'token', name: 'main-secondary' },
    ...(prefix === 'bg'
      ? [{ type: 'token' as const, name: 'brand-fade' }]
      : prefix === 'text'
        ? [{ type: 'token' as const, name: 'inverse-static' }]
        : []),
    {
      type: 'folder',
      name: '/card',
      hint: 'островки и карточки',
      children: [
        { type: 'token', name: 'main' },
        { type: 'token', name: 'main-secondary' },
      ],
    },
    ...(prefix === 'bg'
      ? [
          {
            type: 'folder' as const,
            name: '/overlay',
            hint: 'затемнения и осветления фона',
            children: [
              { type: 'token' as const, name: 'main' },
              { type: 'token' as const, name: 'inverse' },
            ],
          },
          {
            type: 'folder' as const,
            name: '/modal',
            hint: 'диалоговые окна и шторки',
            children: [
              { type: 'token' as const, name: 'main' },
              { type: 'token' as const, name: 'main-secondary' },
            ],
          },
        ]
      : []),
  ],
})

const ACCENT_GROUP = (prefix: string): TreeFolder => ({
  type: 'folder',
  name: '/accent',
  hint:
    prefix === 'bg'
      ? 'для покраски фонов элементов в акценты'
      : prefix === 'text'
        ? 'для акцентного текста'
        : prefix === 'icon'
          ? 'для акцентных иконок'
          : 'для акцентных линий',
  children: [
    { type: 'token', name: 'main', hint: prefix === 'bg' ? 'ваш бренд цвет' : undefined },
    { type: 'token', name: 'main-secondary' },
    ...(prefix === 'bg' ? [{ type: 'token' as const, name: 'fade' }] : []),
    {
      type: 'folder',
      name: '/states',
      children: [{ type: 'token', name: 'main-disable' }],
    },
    {
      type: 'folder',
      name: '/product',
      hint: 'продуктовые цвета',
      children: [
        {
          type: 'folder',
          name: '/viv',
          hint: 'всё и везде',
          children: [
            { type: 'token', name: 'main' },
            { type: 'token', name: 'main-secondary' },
          ],
        },
        {
          type: 'folder',
          name: '/status',
          hint: 'статусы',
          children: [
            {
              type: 'folder',
              name: '/attention',
              hint: 'критический',
              children: [
                { type: 'token', name: 'main' },
                { type: 'token', name: 'main-secondary' },
              ],
            },
          ],
        },
        {
          type: 'folder',
          name: '/additional',
          hint: 'дополнительные цвета',
          children: [
            {
              type: 'folder',
              name: '/kenya',
              hint: 'названия цвета',
              children: [
                { type: 'token', name: 'main' },
                { type: 'token', name: 'main-secondary' },
              ],
            },
          ],
        },
      ],
    },
  ],
})

const COMPONENT_GROUP = (prefix: string): TreeFolder => ({
  type: 'folder',
  name: '/component',
  hint: prefix === 'bg' ? 'для фонов групп компонентов' : 'для отдельных компонентов',
  children: [
    { type: 'token', name: 'form' },
    { type: 'token', name: 'control' },
    ...(prefix === 'bg' ? [{ type: 'token' as const, name: 'floating' }] : []),
    {
      type: 'folder',
      name: '/states',
      children: [{ type: 'token', name: 'form-focused' }],
    },
  ],
})

const COLUMNS: CategoryColumn[] = [
  {
    id: 'bg',
    label: 'bg',
    bg: 'var(--folder-bg)',
    border: 'var(--folder-border)',
    groups: [BASE_GROUP('bg'), ACCENT_GROUP('bg'), COMPONENT_GROUP('bg')],
  },
  {
    id: 'text',
    label: 'text',
    bg: 'var(--folder-text-bg)',
    border: 'var(--folder-text-border)',
    groups: [BASE_GROUP('text'), ACCENT_GROUP('text'), COMPONENT_GROUP('text')],
  },
  {
    id: 'icon',
    label: 'icon',
    bg: 'var(--folder-icon-bg)',
    border: 'var(--folder-icon-border)',
    groups: [BASE_GROUP('icon'), ACCENT_GROUP('icon'), COMPONENT_GROUP('icon')],
  },
  {
    id: 'line',
    label: 'line',
    bg: 'var(--folder-line-bg)',
    border: 'var(--folder-line-border)',
    groups: [BASE_GROUP('line'), ACCENT_GROUP('line'), COMPONENT_GROUP('line')],
  },
]

export function FolderTreeDiagram() {
  return (
    <div className="folder-tree">
      {COLUMNS.map((column) => (
        <CategoryColumnView key={column.id} column={column} />
      ))}
    </div>
  )
}

export function TokenSample({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <p className={`token-sample ${className}`.trim()}>{children}</p>
}

export function TokenSampleHighlight({ children }: { children: ReactNode }) {
  return <span className="token-sample__highlight">{children}</span>
}

export function TokenSampleMuted({ children }: { children: ReactNode }) {
  return <span className="token-sample__muted">{children}</span>
}
