import { TextMono } from '@carrot-kpi/ui'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { ReactElement } from 'react'

import { MenuBar } from './menu-bar'

interface MarkdownInputProps {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export const MarkdownInput = ({
  id,
  label,
  placeholder,
  value,
  onChange,
}: MarkdownInputProps): ReactElement => {
  const editor = useEditor({
    content: value,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:absolute before:opacity-50 text-sm font-normal',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none font-mono',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="flex min-h-full flex-col gap-2">
      <label className="block" htmlFor={id}>
        <TextMono size="sm" className="font-medium">
          {label}
        </TextMono>
      </label>
      <div className="rounded-2xl border border-black">
        {editor && <MenuBar editor={editor} />}
        <EditorContent
          className="scrollbar prose h-44 overflow-auto p-3 text-sm font-normal outline-none"
          editor={editor}
        />
      </div>
    </div>
  )
}
