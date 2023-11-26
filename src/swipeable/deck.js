import { useEffect, useRef, useState } from 'react';
import { useSprings, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import clamp from 'lodash.clamp';
import swap from 'lodash-move';
import styles from './styles.module.css';
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ReactHtmlParser from 'react-html-parser';

const fn = (
  order,
  active = false,
  originalIndex = 0,
  curIndex = 0,
  x = 0
) => (index) =>
    active && index === originalIndex
      ? {
        x: curIndex + x,
        scale: 1.1,
        zIndex: 1,
        shadow: 15,
        immediate: (key) => key === 'zIndex',
        config: (key) => (key === 'x' ? config.stiff : config.default),
      }
      : {
        x: 0,
        scale: 1,
        zIndex: 0,
        shadow: 1,
        immediate: false,
      };

function DraggableList({ initialItems, onClickMessage, onDeleteMessage }) {
  const [items, setItems] = useState(initialItems);
  const order = useRef(items);
  const [springs, api] = useSprings(items.length, fn(order.current));
  let initialDirection = null;
  const [expandedId, setExpandedId] = useState([])
  const [animatedIndex, setAnimatedIndex] = useState(null);
  const boxAnimationStyle = index => ({
    height: animatedIndex === items[index].id ? '0' : expandedId.includes(items[index].id) ? '100%' : '70px',
    width: '100%',
    transition: animatedIndex === items[index].id ? 'height 0.5s ease-in-out' : 'none',
    overflow: 'hidden',
  });

  const bind = useDrag(
    ({
      args: [originalIndex],
      active,
      movement: [x, y],
      direction: [dx, dy],
      cancel,
      first,
      last,
      down,
      velocity
    }) => {
      if (first) {
        initialDirection = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
      }

      if (initialDirection === "vertical") {
        if (last) initialDirection = null;
        return cancel();
      }

      const curIndex = order.current.indexOf(originalIndex);
      const curRow = clamp(Math.round((curIndex * 100 + x) / 100), 0, items.length - 1);
      const newOrder = swap(order.current, curIndex, curRow);
      api.start(fn(newOrder, active, originalIndex, curIndex, x));
      if (!active) order.current = newOrder;

      // Handling swipe events,
      // Adjust threshold and velocity as needed.
      // velocity[0] means the x direction velocity. For y velocity[1].
      // console.log('last: ', last, 'Math.abs(x): ', Math.abs(x), 'velocity[0]: ', velocity[0], 'x: ', x)
      // if (last && Math.abs(x) > 50 && velocity[0] > 0.2) {
      // swipeDirection is used to prevent multiple swipe events.
      if (Math.abs(x) > 50 && velocity[0] > 0.2) {
        if (last) {
          if (x > 0) {
            console.log('Swiped right');
            handleSwipe(originalIndex);
          } else {
            console.log('Swiped left');
            handleSwipe(originalIndex);
          }
        }
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      threshold: 10,
    }
  );

  const handleSwipe = (original_index) => {
    setAnimatedIndex(items[original_index].id);

    onClickMessage(items[original_index]);
  };

  const handleTransitionEnd = (event, original_index) => {
    if (event.target === event.currentTarget) {
      console.log(`Transition ended for item at index ${original_index}`);
      const new_items = items.filter((item, index) => index !== original_index);
      setItems(new_items);

      onDeleteMessage(items[original_index]);
    }
  };

  const setExpandMsg = (i) => {
    let tempoary_ids = [...expandedId]
    if (tempoary_ids.includes(items[i]?.id)) {
      tempoary_ids = tempoary_ids.filter((tmpoary_id) => tmpoary_id != items[i]?.id)
    } else {
      tempoary_ids.push(items[i]?.id)
    }
    setExpandedId(tempoary_ids)
  }

  const convertMessageContent = (message, id) => {
    let lines = "";
    let tempoary_ids = [...expandedId];
    if (tempoary_ids.includes(id)) {
      if (message !== null && message !== undefined) {
        lines = message.replace(/\n/g, '<br>');
      }
    } else {
      lines = message;
    }

    return <div>{ReactHtmlParser(lines)}</div>;
  }

  return (
    // <div className={styles.content} style={{ width: items.length * 100 }}>
    <div className={styles.content}>
      {springs.map(({ zIndex, shadow, x, scale }, i) => (
        <>
          {/*{console.log(items[i])}*/}
          <animated.div
            {...bind(i)}
            key={items[i].id}
            style={{
              // Allow vertical scrolling.
              touchAction: 'pan-y',
              zIndex,
              boxShadow: shadow.to(s => `rgba(0, 0, 0, 0.15) 0px ${s}px ${2 * s}px 0px`),
              x,
              scale,
            }}
          >
            <ListItem style={{
              height: animatedIndex === items[i].id ? '0' : expandedId.includes(items[i].id) ? '100%' : '70px',
              width: '100%',
              transition: animatedIndex === items[i].id ? 'height 0.5s ease-in-out' : 'none',
              overflow: 'hidden',
              cursor: 'pointer'
            }} onTransitionEnd={(event) => handleTransitionEnd(event, i)}>
              <ListItemText
                onClick={() => {
                  onClickMessage(items[i]);
                  setExpandMsg(i)
                }}
                primary={items[i].payload.title}
                secondary={
                  <p style={{
                    textOverflow: expandedId.includes(items[i].id) ? 'initial' : 'ellipsis',
                    whiteSpace: expandedId.includes(items[i].id) ? 'normal' : 'nowrap',
                    width: '100%',
                    overflow: 'hidden',
                    margin: '0'
                  }}>{convertMessageContent(items[i].payload.body, items[i].id)}
                  </p>
                }
              />
            </ListItem>
          </animated.div >
        </>
      ))
      }
    </div >
  );
}

export default function DeckCards({
  initialItems,
  onClickMessage = () => {
    console.log("onClickMessage");
  },
  onDeleteMessage = () => {
  }
}) {
  return (
    <div className="flex fill center">
      <DraggableList initialItems={initialItems} onClickMessage={onClickMessage} onDeleteMessage={onDeleteMessage} />
    </div>
  );
}