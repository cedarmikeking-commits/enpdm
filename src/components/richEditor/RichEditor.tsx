import React, { useState, useEffect } from 'react';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import { IDomEditor, IEditorConfig, IToolbarConfig, SlateEditor } from '@wangeditor/editor';
import '@wangeditor/editor/dist/css/style.css'; // 导入样式

interface RichEditorProps {
  value?: string;           // 修改为可选，适配 Form.Item
  onChange?: (val: string) => void; // 修改为可选
  placeholder?: string;
  className?: string;
}

const RichEditor: React.FC<RichEditorProps> = ({
  value = '',
  onChange,
  placeholder,
  className = ""
}) => {
  const [editor, setEditor] = useState<IDomEditor | null>(null);

  const toolbarConfig: Partial<IToolbarConfig> = {
      excludeKeys: [
        'insertVideo', // 隐藏「插入视频」按钮
        'group-video'  // 如有分组，也排除
      ]
  };
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: placeholder || '请输入内容...',
    autoFocus: false,
    MENU_CONF: {
      uploadImage: {
        customUpload(file: File, insertFn: any) {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            insertFn(base64, file.name, base64);
          };
          reader.readAsDataURL(file);
        },
        maxFileSize: 5 * 1024 * 1024,
      }
    }
  };
  // 点击空白处定位到末尾的方法
  const handleContainerClick = (e: React.MouseEvent) => {
    // 只有点击到“空白外层”时才触发，防止干扰点击文本内部的操作
    if (editor && e.target === e.currentTarget) {
      editor.focus(); // 先聚焦

      // 获取文档最后的位置
      const { children } = editor;
      if (children.length > 0) {
        const lastIndex = children.length - 1;
        // 选中最后一个节点的末尾
        // 使用 Slate 的 API 进行精准定位
        const endPoint = SlateEditor.end(editor, [lastIndex]);
        editor.select(endPoint);
      }
    }
  };

  // 及时销毁编辑器
  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  return (
    <div className={`wangeditor-container border border-gray-200 rounded-lg flex flex-col ${className}`} style={{ minHeight: '350px', zIndex: 10 }}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        className="border-b border-gray-200"
      />
      <div
        className="flex-1 overflow-hidden cursor-text"
        onClick={handleContainerClick}
        style={{ paddingBottom: '20px' }} // 给底部留一点内边距更好触发
      >
        <Editor
          defaultConfig={editorConfig}
          value={value}
          onCreated={setEditor}
          onChange={editor => {
            if (onChange) onChange(editor.getHtml());
          }}
          mode="default"
          style={{ flex: 1, overflow: 'hidden' }}
        />
      </div>
    </div>
  );
};

export default RichEditor;
