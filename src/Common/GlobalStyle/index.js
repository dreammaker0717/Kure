import './GlobalStyle.css';
import PropTypes from 'prop-types';

function GlobalStyle({ children }) {
    return <div className="wrapper">{children}</div>;
}

GlobalStyle.prototype = {
    children: PropTypes.node
};

export default GlobalStyle;
