import ReactQuill from 'react-quill';
import React from "react";

// Define supported formats for the editor
const quillFormats = ['bold', 'italic', 'underline', 'list', 'bullet', 'link', 'direction', 'size', 'color'];

// Custom CSS for RTL support
const rtlStyles = `
    .ql-editor .ql-direction-rtl {
        direction: rtl;
        text-align: right;
        font-size: initial !important;
    }
    .ql-editor {
        direction: rtl;
        text-align: right;
    }
    .ql-editor li:not(.ql-direction-rtl)::before {
        margin-left: .5em;
        margin-right: .3em;
        text-align: right;
    }

.ql-snow .ql-picker.ql-size .ql-picker-label::before, .ql-snow .ql-picker.ql-size .ql-picker-item::before {
content: "Normal";
padding-right: 1.5em;
}
    p {
        color: black;
        font-size: initial;
    }
`;

// Define toolbar options
const toolbarOptions = [
    ['bold', 'italic', 'underline'],       // Text styling
    [{'list': 'ordered'}, {'list': 'bullet'}], // Lists
    [{'size': ['small', false, 'large', 'huge']}], // Font sizes
    [{'color': []}],                        // Text colors
    [{'direction': 'rtl'}]                 // RTL support
];

// Define Quill modules
const quillModules = {
    toolbar: toolbarOptions,
};

// HebrewEditor component
const HebrewEditor = ({value, onChange}) => {
    const handleTextBlur = () => {
        // Add any blur event logic here if needed
    };

    return (
        <>
            <style>{rtlStyles}</style>
            <ReactQuill
                theme="snow"
                value={value}
                modules={quillModules}
                formats={quillFormats}
                onChange={onChange}
                onBlur={handleTextBlur}
                style={{direction: 'rtl'}}
            />
        </>
    );
};

export default HebrewEditor;
