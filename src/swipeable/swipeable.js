import React, { useState } from "react";
import { useSpring, animated, a } from "react-spring";
import { useDrag } from "react-use-gesture"
import { Avatar, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";

const SwipeableItem = ({ content, onSwipeLeft, onSwipeRight, threshold = 100 }) => {
  const [{ x }, setSpringProps] = useSpring(() => ({
    x: 0,
    config: {
      mass: .1,
      tension: 250,
      friction: 15,
    },
  }));

  const bind = useDrag(({ down, movement: [mx], direction: [xDir], distance }) => {
    if (!down && distance > threshold) {
      if (xDir > 0) {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    }

    setSpringProps({
      x: down ? mx : 0,
      immediate: down,
      onStart: () => down && setSpringProps({ immediate: true }),
      onRest: () => !down && setSpringProps({ immediate: false }),
    });
  }, { filterTaps: true });

  const AnimatedListItem = a(ListItem);

  return (
    <AnimatedListItem
      {...bind()}
      style={{
        transform: x.to((x) => `translateX(${x}px)`),
      }}
      // className="swipeable-item"
    >
      <ListItemAvatar>
        <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg"/>
      </ListItemAvatar>
      <ListItemText
        primary="Title"
        secondary={
        <>
          {content}
        </>
        }
      />
    </AnimatedListItem>
  );
};

const SwipeableList = ({ data, onSwipeLeft, onSwipeRight }) => {
  const renderItem = (item) => (
    <SwipeableItem
      key={item.id}
      content={item.content}
      onSwipeLeft={() => onSwipeLeft(item)}
      onSwipeRight={() => onSwipeRight(item)}
    />
  );

  return <div className="swipeable-list">{data.map(renderItem)}</div>;
};

export default SwipeableList;
