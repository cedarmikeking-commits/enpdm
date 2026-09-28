import React from 'react';
import '@wangeditor/editor/dist/css/style.css';

interface Props {
  content: string;
}

const RichTextRender: React.FC<Props> = ({ content }) => {
  return (
    <div
      className="w-e-text"
      style={{
        padding: '10px',
        lineHeight: '1.5',
        // 防止长文本/长表格撑破布局
        wordBreak: 'break-word'
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default RichTextRender;
