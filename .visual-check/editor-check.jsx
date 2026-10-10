import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import RichTextEditor from '/src/components/editor/RichTextEditor.jsx';
import '/src/styles/globals.css';import './styles/components.css';import './styles/gallery.css';
function Check(){const [value,setValue]=useState('<p>Selected text for formatting</p>');return <RichTextEditor name="content" value={value} onChange={e=>{setValue(e.target.value);window.editorValue=e.target.value}}/>}
createRoot(document.getElementById('root')).render(<Check/>);
