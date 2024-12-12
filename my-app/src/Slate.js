import React, { useMemo } from 'react'
import { useCallback, useState } from 'react';
import './App.css';
import { createEditor, Editor, Transforms } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'

const CustomEditor = {
    isBoldMarkActive(editor) {
      const marks = Editor.marks(editor)
      return marks ? marks.bold === true : false
    },

    isItalicMarkActive(editor) {
        const marks = Editor.marks(editor)
        return marks ? marks.italic === true : false
      },
    isHeadingMarkActive(editor) {
        const marks = Editor.marks(editor)
        return marks ? marks.H1 === true : false
      },
    // isH2MarkActive(editor) {
    //     const marks = Editor.marks(editor)
    //     return marks ? marks.H2 === true : false
    //   },
    // isH3MarkActive(editor) {
    //     const marks = Editor.marks(editor)
    //     return marks ? marks.H3 === true : false
    //   },
  
    isCodeBlockActive(editor) {
      const [match] = Editor.nodes(editor, {
        match: n => n.type === 'code',
      })
  
      return !!match
    },
  
    toggleBoldMark(editor) {
      const isActive = CustomEditor.isBoldMarkActive(editor)
      if (isActive) {
        Editor.removeMark(editor, 'bold')
      } else {
        Editor.addMark(editor, 'bold', true)
      }
    },

    toggleItalicMark(editor) {
      const isActive = CustomEditor.isItalicMarkActive(editor)
      if (isActive) {
        Editor.removeMark(editor, 'italic')
      } else {
        Editor.addMark(editor, 'italic', true)
      }
    },
    toggleHeadingMark(editor) {
      const isActive = CustomEditor.isHeadingMarkActive(editor)
      if (isActive) {
        Editor.removeMark(editor, 'H1')
      } else {
        Editor.addMark(editor, 'H1', true)
      }
    },  
    toggleCodeBlock(editor) {
      const isActive = CustomEditor.isCodeBlockActive(editor)
      Transforms.setNodes(
        editor,
        { type: isActive ? null : 'code' },
        { match: n => Editor.isBlock(editor, n) }
      )
    },
  }


  
  
  const SlateEditor = () => {
      
      const [editor] = useState(() => withReact(createEditor()))
      const [option,setoption] = useState(false)
      
      const initialValue = useMemo(
        () =>
          JSON.parse(localStorage.getItem('content')) || [
            {
              type: 'paragraph',
              children: [{ text: 'A line of text in a paragraph.' }],
            },
          ],
        []
      )
  const renderElement = useCallback(props => {
    switch (props.element.type) {
      case 'code':
        return <CodeElement {...props} />
      default:
        return <DefaultElement {...props} />
    }
  }, [])

  const renderLeaf = useCallback(props => {
    return (
    <Leaf {...props} />
    )
  }, [])

    const CodeElement = props => {
        return (
          <pre {...props.attributes}>
            <code>{props.children}</code>
          </pre>
        )
      }
      
      const DefaultElement = props => {
        return <p {...props.attributes}>{props.children}</p>
      }
      
      const Leaf = props => {
        return (
          <span
            {...props.attributes}
            style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal', fontStyle: props.leaf.italic ? 'italic' : 'normal', fontSize: props.leaf.H1 ? 20 : 14 }}
          >
            {props.children}
          </span>
        )
      }

  return (
    <div>
      <Slate editor={editor} initialValue={initialValue} onChange={value => {
        const isAstChange = editor.operations.some(
          op => 'set_selection' !== op.type
        )
        if (isAstChange) {
          // Save the value to Local Storage.
          const content = JSON.stringify(value)
          localStorage.setItem('content', content)
        }
    }}>
      <div onMouseEnter={() => {setoption(true)}}
      onMouseLeave={() => {setoption(false)}} className={`${option ? "" : "hidden"}`}>
        <button
          onMouseDown={event => {
            event.preventDefault()
            CustomEditor.toggleBoldMark(editor)
          }}
        >
          Bold
        </button>
        <button
          onMouseDown={event => {
            event.preventDefault()
            CustomEditor.toggleItalicMark(editor)
          }}
        >
          Italic
        </button>
        <button
          onMouseDown={event => {
            event.preventDefault()
            CustomEditor.toggleHeadingMark(editor)
          }}
        >
          Heading
        </button>
      </div>
      <Editable
      onMouseEnter={() => {setoption(true)}}
      onMouseLeave={() => {setoption(false)}}
       className='on'
        renderElement={renderElement}
        // Pass in the `renderLeaf` function.
        renderLeaf={renderLeaf}
        onKeyDown={event => {
          if (!event.ctrlKey) {
            return
          }

          switch (event.key) {
            case '`': {
              event.preventDefault()
              const [match] = Editor.nodes(editor, {
                match: n => n.type === 'code',
              })
              Transforms.setNodes(
                editor,
                { type: match ? null : 'code' },
                { match: n => Editor.isBlock(editor, n) }
              )
              break
            }

            case 'b': {
              event.preventDefault()
              Editor.addMark(editor, 'bold', true)
              break
            }

            case 'i': {
              event.preventDefault()
              Editor.addMark(editor, 'italic', true)
              break
            }

            case 'h': {
              event.preventDefault()
              Editor.addMark(editor, 'Heading', true)
              break
            }
          }
        }}
      />
    </Slate>
    </div>
  )
}

export default SlateEditor
