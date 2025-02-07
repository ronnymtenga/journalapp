// ReadOnlyEditor.tsx
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface ReadOnlyEditorProps {
  markdown: string;
  className?: string; // Optional extra styling classes
}

const ReadOnlyEditor: React.FC<ReadOnlyEditorProps> = ({ markdown, className = "" }) => {
  return (
    <div
      className={`${className}`}
    >
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
};

export default ReadOnlyEditor;
