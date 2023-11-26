import React, { useEffect, useState } from 'react';

const HighlightTextWidget = (props) => {
    const { keyword, text, highlightStyle } = props;
    const [same, setSame] = useState('');
    const [first, setFirst] = useState('');
    const [second, setSecond] = useState('');
    useEffect(() => {

        const regex = new RegExp(`(${keyword})`, 'gi');

        // Replace all instances of the keyword with the keyword wrapped in a <span> element
        const result = text.split(regex).filter(Boolean);
        // console.log(result);
        // console.log("highlightedText; ", text," /  ", result, " ///", keyword)
        if (result.length > 2) {
            setSame(result[1]);
            setFirst(result[0]);
            setSecond(result.slice(2).join(''))
        } else if (result.length == 2) {
            setSame(result[0].toLowerCase() == keyword.toLowerCase() ? result[0] : result[1]);
            setFirst(result[0].toLowerCase() == keyword.toLowerCase() ? "" : result[0]);
            setSecond(result[0].toLowerCase() == keyword.toLowerCase() ? result[1] : "")
        } else {
            if (text.toLowerCase().trim() == keyword.toLowerCase().trim()) {
                setSame(text);
                setFirst('');
                setSecond('');
            } else {
                setSame("");
                setFirst(text);
                setSecond('');
            }
        }

    }, [keyword, text]);


    return (
        <span>
            <span >{first}</span>
            <span style={highlightStyle ? highlightStyle : { background: "#7CACF8f0", }}>{same}</span>
            <span >{second}</span>
        </span>
    );
};

export default HighlightTextWidget;