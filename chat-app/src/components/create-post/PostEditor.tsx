import React, { useRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface PostEditorProps {
  content: string;
  onChange: (val: string) => void;
}

export const PostEditor: React.FC<PostEditorProps> = ({
  content,
  onChange,
}) => {
  const quillRef = useRef<ReactQuill>(null);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result as string;
        try {
          const apiUrl =
            import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
          const token =
            localStorage.getItem('token') ||
            localStorage.getItem('chatSessionId');
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }

          const response = await fetch(`${apiUrl}/posts/upload`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ image: base64Image }),
          });

          if (!response.ok) throw new Error('Upload failed');
          const data = await response.json();

          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection(true);
            const index = range ? range.index : quill.getLength();
            quill.insertEmbed(index, 'image', data.url);
            quill.setSelection(index + 1, 0);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
        }
      };
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: { image: imageHandler },
      },
    }),
    []
  );

  return (
    <div className="mt-4 mb-8">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={onChange}
        modules={modules}
        className="bg-background min-h-[400px] border border-border/80 rounded-md [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-border/80 [&_.ql-toolbar]:rounded-t-md [&_.ql-container]:border-none [&_.ql-container]:text-base [&_.ql-editor]:min-h-[350px] [&_.ql-toolbar]:bg-muted/30"
        placeholder="Write your post content here..."
      />
    </div>
  );
};
