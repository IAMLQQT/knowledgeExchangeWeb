/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";

import "highlight.js/styles/github.css"; // Choose a style from the available highlight.js styles
import hljs from "highlight.js";

const CodeComponent = ({ codeString }) => {
  const codeRef = useRef(null);
  const detectedLanguage = useRef(""); // Default language

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightBlock(codeRef.current);
      detectedLanguage.current = hljs.highlightAuto(codeString).language;
      console.log(detectedLanguage.current); // Output the detected language to console
    }
  }, [codeString]);
  if (!codeString) return null;
  return (
    <pre>
      <code
        ref={codeRef}
        className={`language-${detectedLanguage.current}`}
        lang={detectedLanguage.current}
      >
        <div>{codeString}</div>
      </code>
    </pre>
  );
};

export default CodeComponent;