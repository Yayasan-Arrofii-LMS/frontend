import Image from "@tiptap/extension-image"
import type { ImageOptions } from "@tiptap/extension-image"
import { Plugin, TextSelection } from "@tiptap/pm/state"
import { handleImageUpload } from "@/lib/tiptap-utils"

export interface ImageUploadExtensionOptions
  extends Partial<Pick<ImageOptions, "inline" | "HTMLAttributes" | "allowBase64">> {
  upload?: (file: File) => Promise<string>
  onError?: (error: Error) => void
  onSuccess?: (url: string) => void
}

async function uploadAndInsertImage(
  file: File,
  view: { state: any; dispatch: (tr: any) => void },
  options: ImageUploadExtensionOptions
) {
  try {
    const uploadFn = options.upload || handleImageUpload
    const url = await uploadFn(file)

    const imageNode = view.state.schema.nodes.image.create({ src: url })
    const tr = view.state.tr.replaceSelectionWith(imageNode).scrollIntoView()
    view.dispatch(tr)

    options.onSuccess?.(url)
  } catch (error) {
    options.onError?.(
      error instanceof Error ? error : new Error("Image upload failed")
    )
  }
}

export const ImageUploadExtension = Image.extend<ImageUploadExtensionOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      allowBase64: false,
      upload: handleImageUpload,
      onError: undefined,
      onSuccess: undefined,
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const items = event.clipboardData?.items
            if (!items) return false

            for (const item of items) {
              if (item.type.startsWith("image/")) {
                const file = item.getAsFile()
                if (!file) continue
                event.preventDefault()
                void uploadAndInsertImage(file, view, this.options)
                return true
              }
            }

            return false
          },
          handleDrop: (view, event) => {
            const files = event.dataTransfer?.files
            if (!files || files.length === 0) return false

            const file = files[0]
            if (!file.type.startsWith("image/")) return false

            event.preventDefault()

            const coords = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            })

            if (coords?.pos != null) {
              const tr = view.state.tr.setSelection(
                TextSelection.create(view.state.doc, coords.pos)
              )
              view.dispatch(tr)
            }

            void uploadAndInsertImage(file, view, this.options)
            return true
          },
        },
      }),
    ]
  },
})

export default ImageUploadExtension
