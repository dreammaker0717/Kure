import { useEffect, useState, } from 'react';
import SouthIcon from '@mui/icons-material/South';
import './styles.css'

const RoundedBox = ({ color, bgcolor, data, ...props }) => {

  return (
    <>
      <div
        className={color === "blueBox" ? "boxes blue-box" : color === 'yellowBox' ? 'boxes yellow-box' : color === 'blackBox' ? 'boxes black-box' : 'boxes'}>
        {data.map((item, i) => {
          return (
            <>
              <div className='head-content'>
                {item.Icon}
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                </div>
              </div>
              <div className=''>
                <h2>{item.price}<span className='price-growth'>{item.priceGrowth}</span></h2>
              </div>
              <div className='bottom-content'>
                <div className='d-flex align-items-center'><SouthIcon/> {item.upPrice} <span
                  className='currency'>USD</span></div>
                <div className='d-flex align-items-center'><SouthIcon/> {item.downPrice} <span
                  className='currency'>USD</span></div>
              </div>
            </>
          )
        })}
      </div>
    </>
  )
}

export default RoundedBox;