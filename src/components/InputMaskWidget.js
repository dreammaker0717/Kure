import React from 'react';
import { IMaskInput } from 'react-imask';

const InputMaskWidget = React.forwardRef(function InputMaskWidget(props, ref) {
    const { onChange, mask, definitions, ...other } = props;

    return (
        <IMaskInput
            {...other}
            mask={mask === undefined ? '000-000-0000' : mask}
            definitions={
                definitions === undefined
                    ? {
                          '#': /[1-9]/
                      }
                    : definitions
            }
            inputRef={ref}
            onAccept={(value) => {
                onChange({ target: { name: props.name, value } });
            }}
            overwrite
        />
    );
});

export default InputMaskWidget;
